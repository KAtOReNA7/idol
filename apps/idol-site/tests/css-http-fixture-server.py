#!/usr/bin/env python3
"""Serve only the synthetic fixture and exact local production CSS/font files.

No browser automation, API forwarding, credentials, or outbound network access.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
import time
from urllib.parse import parse_qs, unquote, urlsplit


def utc_now():
    return datetime.now(timezone.utc).isoformat()


class FixtureState:
    def __init__(self):
        self.lock = threading.Lock()
        self.started_at = utc_now()
        self.scenario_counts = {}
        self.requests = []

    def plan(self, mode, basename, case):
        key = f"{mode}/{basename}?case={case}"
        with self.lock:
            attempt = self.scenario_counts.get(key, 0) + 1
            self.scenario_counts[key] = attempt
        status = 404 if mode == "once404" and attempt == 1 else 200
        delay = (18 if mode == "timeout" else 2 if mode == "delay" else 0) if attempt == 1 else 0
        return key, attempt, status, delay

    def begin(self, path, method, **extra):
        with self.lock:
            record = {"id": len(self.requests) + 1, "startedAt": utc_now(), "path": path, "method": method, "status": None, **extra}
            self.requests.append(record)
            return record

    def finish(self, record, status, duration_ms, disconnected=False):
        with self.lock:
            record.update(status=status, finishedAt=utc_now(), durationMs=round(duration_ms, 3), clientDisconnected=disconnected)

    def snapshot(self):
        with self.lock:
            return {"startedAt": self.started_at, "observedAt": utc_now(), "scenarioCounts": dict(self.scenario_counts), "requests": [dict(record) for record in self.requests]}


class FixtureHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, directory, state, themes, **kwargs):
        self.fixture_root = Path(directory).resolve()
        self.state = state
        self.themes = themes
        self.request_record = None
        self.response_status = 500
        super().__init__(*args, directory=str(self.fixture_root), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def send_response(self, code, message=None):
        self.response_status = code
        super().send_response(code, message)

    def send_bytes(self, status, payload, content_type, head_only=False):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if not head_only:
            self.wfile.write(payload)

    def do_GET(self):
        self.dispatch(False)

    def do_HEAD(self):
        self.dispatch(True)

    def dispatch(self, head_only):
        parsed = urlsplit(self.path)
        decoded = unquote(parsed.path)
        started = time.monotonic()
        self.response_status = 500
        self.request_record = self.state.begin(self.path, self.command)
        disconnected = False
        try:
            if decoded == "/fixture-log.json":
                payload = (json.dumps(self.state.snapshot(), ensure_ascii=False, indent=2) + "\n").encode()
                self.send_bytes(200, payload, "application/json; charset=utf-8", head_only)
                return
            if decoded.startswith("/fault/"):
                parts = decoded.split("/")
                if len(parts) != 4 or parts[2] not in {"once404", "timeout", "delay"} or parts[3] not in self.themes:
                    self.send_bytes(404, b"Unknown fixture CSS fault path.\n", "text/plain; charset=utf-8", head_only)
                    return
                mode, basename = parts[2], parts[3]
                case = parse_qs(parsed.query).get("case", ["default"])[0][:200]
                key, attempt, status, delay = self.state.plan(mode, basename, case)
                with self.state.lock:
                    self.request_record.update(scenario=key, attempt=attempt, plannedStatus=status, delaySeconds=delay)
                if delay:
                    time.sleep(delay)
                if status == 404:
                    self.send_bytes(404, b"Intentional first-attempt stylesheet 404.\n", "text/plain; charset=utf-8", head_only)
                else:
                    self.send_bytes(200, self.themes[basename].read_bytes(), "text/css; charset=utf-8", head_only)
                return
            target = (self.fixture_root / decoded.lstrip("/")).resolve()
            if not target.is_relative_to(self.fixture_root) or decoded.startswith("/api/"):
                self.send_bytes(404, b"Outside local fixture scope.\n", "text/plain; charset=utf-8", head_only)
                return
            if head_only:
                super().do_HEAD()
            else:
                super().do_GET()
        except (BrokenPipeError, ConnectionResetError):
            disconnected = True
        finally:
            self.state.finish(self.request_record, self.response_status, (time.monotonic() - started) * 1000, disconnected)

    def list_directory(self, path):
        self.send_error(404, "Directory listing disabled for this fixture")
        return None


def make_server(directory, port):
    directory = Path(directory).resolve()
    manifest = json.loads((directory / "manifest.json").read_text())
    themes = {}
    for theme in manifest["themes"]:
        css_path = (directory / theme["href"].lstrip("/")).resolve()
        if not css_path.is_relative_to(directory) or not css_path.is_file():
            raise ValueError(f"Invalid or absent fixture stylesheet: {theme['href']}")
        themes[css_path.name] = css_path
    if len(themes) != 37:
        raise ValueError(f"Expected 37 distinct theme files, found {len(themes)}")
    state = FixtureState()
    handler = partial(FixtureHandler, directory=directory, state=state, themes=themes)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    server.daemon_threads = True
    return server, state


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", "--root", default=str(Path(__file__).resolve().parent))
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    server, _ = make_server(args.directory, args.port)
    print(f"Fixture only: http://127.0.0.1:{server.server_port}/ (root {Path(args.directory).resolve()})", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
