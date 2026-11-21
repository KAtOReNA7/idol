"""Crash, reentry and contention checks on three synthetic public files."""
import json
import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

scripts = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(scripts))
import stage_batch_files as transactions

outputs = {'data/stages/evidence/case.json': {'items': []},
           'data/stage-videos.json': {'synthetic': 'video'}, 'data/stages/status.json': {'synthetic': 'ready'}}


def apply(root, interrupt=None):
    with transactions.stage_writer(root) as files:
        for name in outputs:
            files.remember(name)
        if interrupt:
            original = transactions.replace_bytes
            calls = 0
            def stop_after(path, data):
                nonlocal calls
                original(path, data)
                calls += 1
                if calls == interrupt:
                    os._exit(17)
            transactions.replace_bytes = stop_after
        files.commit('case.json', 'test-batch', outputs, {'newSources': 1}, lambda: None)


class StageBatchTests(unittest.TestCase):
    def prepare(self, root):
        (root / 'data/stages').mkdir(parents=True)
        for file in list(outputs)[1:]:
            (root / file).write_bytes(b'{"before":true}\n')
        return {file: transactions.read_bytes(root / file) for file in outputs}

    def test_recover_after_each_replace_and_retry_without_changing_bytes(self):
        for position in range(1, 4):
            with self.subTest(position=position), TemporaryDirectory() as directory:
                root = Path(directory)
                before = self.prepare(root)
                child = subprocess.run([sys.executable, '-O', __file__, 'interrupt', directory, str(position)])
                self.assertEqual(child.returncode, 17)
                with transactions.stage_writer(root):
                    self.assertEqual({file: transactions.read_bytes(root / file) for file in outputs}, before)
                apply(root)
                with transactions.stage_writer(root) as files:
                    self.assertTrue(files.completed('case.json', 'test-batch')['alreadyApplied'])
                    self.assertEqual({file: json.loads((root / file).read_bytes()) for file in outputs}, outputs)

    def test_live_writer_is_exclusive_and_releases_on_exit(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare(root)
            with transactions.stage_writer(root):
                result = subprocess.run([sys.executable, __file__, 'acquire', directory], capture_output=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(b'WRITER_BUSY', result.stdout)
            apply(root)

    def test_recovery_preserves_unexpected_external_edit(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.prepare(root)
            result = subprocess.run([sys.executable, __file__, 'interrupt', directory, '2'])
            self.assertEqual(result.returncode, 17)
            path = root / 'data/stage-videos.json'
            path.write_bytes(b'external edit')
            with self.assertRaisesRegex(ValueError, 'external change'):
                with transactions.stage_writer(root):
                    pass
            self.assertEqual(path.read_bytes(), b'external edit')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'interrupt':
        apply(Path(sys.argv[2]), int(sys.argv[3]))
    elif len(sys.argv) > 2 and sys.argv[1] == 'acquire':
        try:
            with transactions.stage_writer(Path(sys.argv[2])):
                pass
        except OSError:
            print('WRITER_BUSY')
            sys.exit(2)
    else:
        unittest.main()
