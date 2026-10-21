"""Restore/verify the GitHub text bundle, not a Library downloader. Python 3.8+."""
import argparse, hashlib, json, re
from pathlib import Path, PurePosixPath
EXPECTED_MANIFEST_SHA256 = '6c6d46be4175827ce3b15a30cab5ec5192735ccee54ec4662cba80a68c4f185e'
p = argparse.ArgumentParser()
p.add_argument('--manifest', type=Path, default=Path(__file__).with_name('source-manifest.json'))
p.add_argument('--destination', type=Path, required=True)
p.add_argument('--verify', action='store_true', help='Read-only verification of an existing restored directory')
a = p.parse_args()
raw = a.manifest.read_bytes()
assert hashlib.sha256(raw).hexdigest() == EXPECTED_MANIFEST_SHA256, 'Manifest SHA mismatch; do not proceed'
m = json.loads(raw)
assert m['schemaVersion'] == 1
b = {'schemaVersion': 1, 'files': []}
for part in m['parts']:
    assert re.fullmatch(r'source-part-[0-9]{2}\.json', part['path']), 'Unsafe shard path'
    shard = a.manifest.parent / part['path']; assert not shard.is_symlink()
    data = shard.read_bytes()
    assert len(data) == part['bytes'] and hashlib.sha256(data).hexdigest() == part['sha256'], part['path']
    parsed = json.loads(data); assert parsed['schemaVersion'] == 1 and len(parsed['files']) == part['fileCount']
    b['files'].extend(parsed['files'])
assert len(b['files']) == m['files'] and sum(row['bytes'] for row in b['files']) == m['totalSourceBytes']
entries, seen = [], set()
for row in b['files']:
    name = row['path']; q = PurePosixPath(name)
    assert name and '\\' not in name and ':' not in name and not q.is_absolute()
    assert all(part not in ('', '.', '..') and not part.endswith((' ', '.')) for part in name.split('/'))
    assert not any(re.fullmatch(r'(?i)(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?', part) for part in q.parts)
    assert name.casefold() not in seen; seen.add(name.casefold())
    data = row['content'].encode('utf-8')
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256'], name
    entries.append((q, data))
dest = a.destination.absolute()
assert not dest.is_symlink(), 'Symlink destination refused'
if a.verify:
    assert dest.is_dir(), 'Missing destination'
    for q, data in entries:
        target = dest.joinpath(*q.parts)
        assert not any(part.is_symlink() for part in [target, *target.parents] if part != dest.parent), 'Symlink refused'
        assert target.read_bytes() == data, 'Mismatch: ' + str(q)
else:
    assert not dest.exists(), 'Use a NEW destination; no overwrites are performed'
    assert not any(part.is_symlink() for part in dest.parents), 'Symlink parent refused'
    dest.mkdir(parents=True)
    for q, data in entries:
        target = dest.joinpath(*q.parts); target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('xb') as f: f.write(data)
        assert target.read_bytes() == data, str(q)
print(('Verified' if a.verify else 'Restored and verified') + ' %d files, %d bytes' % (len(entries), sum(len(data) for _, data in entries)))
print('Source integrity only: original images, full framework host, Figma and browser acceptance are separate.')
