"""Verify that rebuilding the template cannot erase human submissions."""
import contextlib
import csv
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch


SOURCE = Path(__file__).with_name('build-checklist.py')
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location('human_help_checklist', SOURCE)
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


class RegenerationProtectionTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='idol-human-help-test-')
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.docs = self.root / 'docs/codex'
        self.here = self.docs / 'evidence/20261029-human-help'
        self.here.mkdir(parents=True)
        self.csv_path = self.docs / 'human-help-by-group-20261029.csv'
        self.report_path = self.docs / 'human-help-by-group-20261029.md'
        self.validation_path = self.here / 'validation.json'
        self.report_path.write_bytes(b'Existing report: preserve on failure\r\n')
        self.validation_path.write_bytes(b'{"existing":true}\r\n')
        for name in ('stage-checklist.json', 'other-checklist.json'):
            (self.here / name).write_bytes((builder.HERE / name).read_bytes())
        frozen = self.docs / 'evidence/20261028-post-v200'
        frozen.mkdir()
        for name in ('remaining-stage-ledger.json', 'remaining-person-statistics.json'):
            (frozen / name).write_bytes((builder.DOCS / 'evidence/20261028-post-v200' / name).read_bytes())

    def write_csv(self, rows, headers=None):
        with self.csv_path.open('w', encoding='utf-8-sig', newline='') as handle:
            writer = csv.writer(handle, lineterminator='\n')
            writer.writerow(builder.CSV_HEADERS if headers is None else headers)
            writer.writerows(rows)

    def run_builder(self):
        with patch.object(builder, 'ROOT', self.root), patch.object(builder, 'DOCS', self.docs), patch.object(builder, 'HERE', self.here):
            with contextlib.redirect_stdout(io.StringIO()):
                builder.main()

    def snapshot(self):
        return {path: path.read_bytes() for path in (self.csv_path, self.report_path, self.validation_path)}

    def assert_refused_without_writes(self):
        before = self.snapshot()
        with self.assertRaisesRegex(ValueError, '未改写任何产物'):
            self.run_builder()
        self.assertEqual(before, self.snapshot())

    def test_each_human_column_preserves_unicode_commas_newlines_and_whitespace(self):
        for column, value in (
            (8, '成员姓名：小明'),
            (8, '中文,逗号'),
            (8, '第一段\n第二段'),
            (9, 'https://example.com/source'),
            (10, '01:23／2026-10-29'),
            (8, ' '),
        ):
            with self.subTest(column=column, value=value):
                row = [''] * len(builder.CSV_HEADERS)
                row[0] = '测试团体'
                row[column] = value
                self.write_csv([row])
                self.assert_refused_without_writes()

    def test_changed_missing_or_extra_headers_refuse_before_writes(self):
        for headers in (
            ['未知列'] + builder.CSV_HEADERS[1:],
            builder.CSV_HEADERS[:-1],
            builder.CSV_HEADERS + ['额外列'],
            [],
        ):
            with self.subTest(headers=headers):
                self.write_csv([], headers=headers)
                self.assert_refused_without_writes()

    def test_missing_extra_or_blank_data_rows_refuse_before_writes(self):
        for row in ([''] * 10, [''] * 12, []):
            with self.subTest(width=len(row)):
                self.write_csv([row])
                self.assert_refused_without_writes()

    def test_bad_quoting_encoding_and_empty_file_refuse_before_writes(self):
        stream = io.StringIO(newline='')
        csv.writer(stream).writerow(builder.CSV_HEADERS)
        for data in (
            (stream.getvalue() + '"unterminated').encode('utf-8-sig'),
            b'\xffinvalid UTF-8',
            b'',
        ):
            with self.subTest(data=data[:20]):
                self.csv_path.write_bytes(data)
                self.assert_refused_without_writes()

    def test_unfilled_template_rebuild_is_stable_and_retains_frozen_items(self):
        self.csv_path.write_bytes((builder.DOCS / self.csv_path.name).read_bytes())
        self.run_builder()
        first = self.snapshot()
        self.run_builder()
        self.assertEqual(first, self.snapshot())
        with self.csv_path.open(encoding='utf-8-sig', newline='') as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual(161, len(rows))
        self.assertEqual(45, len({row['团体'] for row in rows}))
        self.assertTrue(all(not row[column] for row in rows for column in builder.CSV_HEADERS[-3:]))
        result = json.loads(self.validation_path.read_text(encoding='utf-8'))
        self.assertEqual(6, len(result['groupsWithoutCurrentItems']))
        self.assertTrue(result['stageWorkIdExactSetMatches'])

    def test_absent_template_can_be_created(self):
        self.run_builder()
        with self.csv_path.open(encoding='utf-8-sig', newline='') as handle:
            self.assertEqual(162, len(list(csv.reader(handle))))


if __name__ == '__main__':
    unittest.main()
