"""Recoverable, single-writer publication of reviewed public stage files."""
from contextlib import contextmanager
from hashlib import sha256
import json
import os
from pathlib import Path
import sqlite3
import tempfile


def digest(data):
    return None if data is None else sha256(data).hexdigest()


def read_bytes(path):
    return path.read_bytes() if path.exists() else None


def sync_directory(path):
    if os.name != 'nt':
        descriptor = os.open(path, os.O_RDONLY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)


def replace_bytes(path, content):
    if content is None:
        path.unlink(missing_ok=True)
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.stage-write-', delete=False) as temp:
            temporary = Path(temp.name)
            try:
                temp.write(content)
                temp.flush()
                os.fsync(temp.fileno())
            except BaseException:
                temp.close()
                temporary.unlink(missing_ok=True)
                raise
        try:
            os.replace(temporary, path)
        finally:
            temporary.unlink(missing_ok=True)
    sync_directory(path.parent)


@contextmanager
def stage_writer(root):
    directory = root / 'data/stages'
    # The kernel releases this lock on process death. Keep its inode stable.
    with (directory / '.stage-import.lock').open('a+b') as lock:
        lock.seek(0)
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        db = sqlite3.connect(directory / '.stage-import.sqlite3')
        try:
            files = StageBatchFiles(root, db)
            files.recover()
            yield files
        finally:
            db.close()


class StageBatchFiles:
    def __init__(self, root, db):
        self.root = root
        self.db = db
        self.before = {}
        db.execute('PRAGMA synchronous=FULL')
        db.execute('CREATE TABLE IF NOT EXISTS pending(path TEXT PRIMARY KEY, old BLOB, new_hash TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS receipts(name TEXT PRIMARY KEY, batch_hash TEXT NOT NULL, files TEXT NOT NULL, summary TEXT NOT NULL)')

    def path(self, name):
        path = (self.root / name).resolve()
        evidence = (self.root / 'data/stages/evidence').resolve()
        if path not in (self.root / 'data/stage-videos.json', self.root / 'data/stages/status.json') and not (
                path.parent == evidence and path.suffix == '.json'):
            raise ValueError('Unexpected stage output path')
        return path

    def remember(self, name):
        self.before[name] = read_bytes(self.root / name)
        return self.before[name]

    def recover(self):
        rows = self.db.execute('SELECT path,old,new_hash FROM pending ORDER BY rowid DESC').fetchall()
        for name, old, new_hash in rows:
            if digest(read_bytes(self.path(name))) not in (digest(old), new_hash):
                raise ValueError('Recovery found an external change in ' + name)
        for name, old, _ in rows:
            if read_bytes(self.path(name)) != old:
                replace_bytes(self.path(name), old)
        with self.db:
            self.db.execute('DELETE FROM pending')

    def completed(self, name, batch_hash):
        row = self.db.execute('SELECT batch_hash,files,summary FROM receipts WHERE name=?', (name,)).fetchone()
        if not row:
            return None
        if row[0] != batch_hash:
            raise ValueError('Completed batch name refers to different public evidence')
        summary = json.loads(row[2])
        if summary.get('retainedExistingSources') or any(digest(read_bytes(self.path(file))) != value for file, value in json.loads(row[1]).items()):
            return None
        return {**summary, 'alreadyApplied': True}

    def commit(self, name, batch_hash, outputs, summary, check_fresh):
        contents = {file: (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode('utf-8') for file, obj in outputs.items()}
        for file, old in self.before.items():
            if read_bytes(self.root / file) != old:
                raise ValueError('Public input changed during validation: ' + file)
        hashes = {file: digest(data) for file, data in contents.items()}
        with self.db:
            for file in contents:
                self.path(file)
                self.db.execute('INSERT INTO pending VALUES(?,?,?)', (file, self.before[file], hashes[file]))
        try:
            check_fresh()
            for file, data in contents.items():
                if self.before[file] != data:
                    replace_bytes(self.path(file), data)
            check_fresh()
            with self.db:
                self.db.execute('INSERT OR REPLACE INTO receipts VALUES(?,?,?,?)', (name, batch_hash, json.dumps(hashes), json.dumps(summary)))
                self.db.execute('DELETE FROM pending')
        except BaseException:
            self.recover()
            raise
