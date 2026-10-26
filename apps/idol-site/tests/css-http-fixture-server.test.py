#!/usr/bin/env python3
"""Reproducible real-handler tests over in-memory HTTP byte streams, without sockets.

Prepare assets: node tests/css-http-fixture-build.mjs
Run: python3 tests/css-http-fixture-server.test.py
Optional: CSS_HTTP_FIXTURE_ROOT=/path/to/generated/fixture

The handler reads exact copied production CSS/fonts. Only time.sleep is replaced,
so planned first-request 18/2-second waits are checked without waiting or claiming
real network-timing coverage. Chromium HTTP tests cover actual elapsed timing.
"""
from __future__ import annotations

import importlib.util
import io
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("css_http_fixture_server", HERE / "css-http-fixture-server.py")
SERVER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SERVER)
FIXTURE_ROOT = Path(os.environ.get("CSS_HTTP_FIXTURE_ROOT", str(HERE.parent.parent / "css-http-fixture"))).resolve()


class InMemoryConnection:
    def __init__(self, path, method="GET"):
        self.input = io.BytesIO(f"{method} {path} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n".encode())
        self.output = io.BytesIO()

    def makefile(self, *_args):
        return self.input

    def sendall(self, data):
        self.output.write(data)


class QuietHandler(SERVER.FixtureHandler):
    def log_message(self, *_args):
        pass


class FixtureHandlerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        manifest_path = FIXTURE_ROOT / "manifest.json"
        if not manifest_path.is_file():
            raise RuntimeError("Build the local fixture first: node tests/css-http-fixture-build.mjs")
        cls.manifest = json.loads(manifest_path.read_text())
        cls.themes = {Path(theme["href"]).name: FIXTURE_ROOT / theme["href"].lstrip("/") for theme in cls.manifest["themes"]}
        if len(cls.themes) != 37:
            raise RuntimeError("Expected 37 exact production theme files in the generated fixture")
        cls.basename = next(iter(cls.themes))

    def setUp(self):
        self.state = SERVER.FixtureState()
        self.sleeps = []
        self.sleep_patch = patch.object(SERVER.time, "sleep", side_effect=self.sleeps.append)
        self.sleep_patch.start()
        self.addCleanup(self.sleep_patch.stop)

    def request(self, path, method="GET"):
        connection = InMemoryConnection(path, method)
        QuietHandler(connection, ("127.0.0.1", 0), object(), directory=str(FIXTURE_ROOT), state=self.state, themes=self.themes)
        raw_headers, body = connection.output.getvalue().split(b"\r\n\r\n", 1)
        lines = raw_headers.decode("latin1").split("\r\n")
        headers = {key.lower(): value for key, value in (line.split(": ", 1) for line in lines[1:])}
        self.assertIn("no-store", headers["cache-control"])
        self.assertEqual(headers["x-content-type-options"], "nosniff")
        return int(lines[0].split()[1]), headers, body

    def test_first_404_then_same_url_returns_exact_css(self):
        path = f"/fault/once404/{self.basename}?case=retry"
        self.assertEqual(self.request(path)[0], 404)
        status, headers, body = self.request(path)
        self.assertEqual(status, 200)
        self.assertIn("text/css", headers["content-type"])
        self.assertEqual(body, self.themes[self.basename].read_bytes())
        self.assertEqual(self.sleeps, [])
        self.assertEqual([row["status"] for row in self.state.snapshot()["requests"]], [404, 200])

    def test_timeout_and_delay_only_wait_on_first_request(self):
        for mode, seconds in [("timeout", 18), ("delay", 2)]:
            with self.subTest(mode=mode):
                path = f"/fault/{mode}/{self.basename}?case=timing"
                before = len(self.sleeps)
                self.assertEqual(self.request(path)[0], 200)
                self.assertEqual(self.sleeps[before:], [seconds])
                self.assertEqual(self.request(path)[0], 200)
                self.assertEqual(self.sleeps[before:], [seconds], "Retry must not repeat the planned delay")
                rows = [row for row in self.state.snapshot()["requests"] if row.get("scenario", "").startswith(mode + "/")]
                self.assertEqual([row["attempt"] for row in rows], [1, 2])
                self.assertEqual([row["delaySeconds"] for row in rows], [seconds, 0])
                self.assertTrue(all(row["status"] == 200 and row.get("finishedAt") for row in rows))

    def test_scenario_case_ids_are_independent(self):
        for case in ["first", "second"]:
            path = f"/fault/once404/{self.basename}?case={case}"
            self.assertEqual(self.request(path)[0], 404)
            self.assertEqual(self.request(path)[0], 200)
        self.assertEqual(sorted(self.state.snapshot()["scenarioCounts"].values()), [2, 2])

    def test_log_contains_actual_statuses_counts_and_completion(self):
        path = f"/fault/once404/{self.basename}?case=logged"
        self.request(path)
        self.request(path)
        status, headers, payload = self.request("/fixture-log.json")
        self.assertEqual(status, 200)
        self.assertIn("application/json", headers["content-type"])
        log = json.loads(payload)
        self.assertEqual(log["scenarioCounts"][f"once404/{self.basename}?case=logged"], 2)
        rows = log["requests"][:2]
        self.assertEqual([row["status"] for row in rows], [404, 200])
        self.assertEqual([row["attempt"] for row in rows], [1, 2])
        self.assertTrue(all(row["path"] == path and row["finishedAt"] and row["durationMs"] >= 0 for row in rows))
        self.assertEqual(log["requests"][-1]["path"], "/fixture-log.json")
        self.assertIsNone(log["requests"][-1]["status"], "The log request is still pending in its own snapshot")

    def test_all_40_css_and_15_fonts_serve_exact_local_bytes(self):
        css_paths = self.manifest["baseCss"] + [theme["href"] for theme in self.manifest["themes"]]
        self.assertEqual(len(css_paths), 40)
        self.assertEqual(len(self.manifest["fontPaths"]), 15)
        for href in css_paths + self.manifest["fontPaths"]:
            with self.subTest(href=href):
                status, headers, body = self.request(href)
                self.assertEqual(status, 200)
                self.assertEqual(body, (FIXTURE_ROOT / href.lstrip("/")).read_bytes())
                self.assertEqual(int(headers["content-length"]), len(body))
                if href.endswith(".css"):
                    self.assertIn("text/css", headers["content-type"])

    def test_head_serves_headers_without_body(self):
        href = self.manifest["themes"][0]["href"]
        status, headers, body = self.request(href, "HEAD")
        self.assertEqual(status, 200)
        self.assertEqual(body, b"")
        self.assertEqual(int(headers["content-length"]), (FIXTURE_ROOT / href.lstrip("/")).stat().st_size)

    def test_api_unknown_fault_and_path_escape_are_rejected(self):
        for path in ["/api/catalog", "/fault/delay/notallowed.css", "/fault/unknown/" + self.basename, "/../../etc/passwd", "/..%2f..%2fetc/passwd"]:
            with self.subTest(path=path):
                self.assertEqual(self.request(path)[0], 404)
        self.assertEqual(self.state.snapshot()["scenarioCounts"], {})
        self.assertEqual(self.sleeps, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
