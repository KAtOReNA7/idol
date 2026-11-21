"""Restore the private MV rating store and its receipts into an isolated SQLite database.

python scripts/archive/restore_personal_mv_ratings.py stage-data-backup.json new-local.sqlite
The full archive verifier also calls restore_ratings for archived native data.
"""
import hashlib
import json
import math
from contextlib import closing
from pathlib import Path
import re
import sqlite3
import sys


class InvalidPersonalBackup(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise InvalidPersonalBackup(message)


def score(value):
    return value is None or type(value) in (int, float) and math.isfinite(value) and 0 <= value <= 10


def latest_ratings(data):
    """Require an unbroken sequence of done receipts for every independent binding."""
    rows = data.get('personalMvRatings', [])
    journal = data.get('journal')
    require(isinstance(rows, list) and isinstance(journal, list), 'Missing native rows or journal.')
    formats = ('idol.native-data-export.v1', 'idol.native-data-export.v2',
               'idol.native-archive.v1', 'idol.native-archive.v2')
    require(data.get('formatVersion') in formats and data['formatVersion'].endswith('.v2') == bool(rows),
            'These personal rows require a native v2 backup.')
    require(not rows or data.get('source') == 'native', 'Wrong source for personal ratings.')
    histories = {}
    expected_columns = {'id','snapshot_id','work_id','video_id','member_id','score','styling_score','revision'}
    for log in journal:
        if log.get('table_key') != 'personal_mv_ratings':
            continue
        require(log.get('status') == 'done', 'Unresolved personal receipt.')
        previous, patch, result = (json.loads(log[column]) for column in ('before_json','patch_json','result_json'))
        owner, key = log['user_id'], log['record_id']
        identity = [owner, previous['snapshot'], result['workId'], result['videoId'], result['memberId']]
        encoded = json.dumps(identity, ensure_ascii=False, separators=(',', ':')).encode()
        require(isinstance(owner,str) and bool(owner) and isinstance(identity[1],str) and bool(identity[1])
                and re.fullmatch(r'rec[A-Za-z0-9]+',identity[2]) and re.fullmatch(r'[A-Za-z0-9_-]{11}',identity[3])
                and re.fullmatch(r'rec[A-Za-z0-9]+',identity[4]) and key == hashlib.sha256(encoded).hexdigest(),
                'Personal record identity mismatch.')
        require(result.get('operationId') == log.get('id') and result.get('saved') is True and result.get('verified') is True
                and type(result.get('revision')) is int and result['revision'] >= 1, 'Invalid personal receipt.')
        require(patch.get('snapshot') == previous['snapshot']
                and all(previous.get(name) == patch.get(name) == result.get(name) for name in ('scope','workId','videoId','memberId'))
                and all(name in result and name in patch and score(result[name]) and patch[name] == result[name]
                        for name in ('score','stylingScore')), 'Personal receipt values differ.')
        versions = histories.setdefault(key, {})
        require(result['revision'] not in versions, 'Duplicate personal receipt revision.')
        versions[result['revision']] = (owner,previous,patch,result)
    restored = []
    seen = set()
    for row in rows:
        require(isinstance(row,dict) and set(row) == expected_columns, 'Invalid personal backup row.')
        key = row['id']
        require(key not in seen and key in histories, 'Missing or duplicate personal row identity.')
        seen.add(key)
        versions = histories[key]
        require(type(row['revision']) is int and row['revision'] == len(versions)
                and set(versions) == set(range(1,len(versions)+1)), 'Incomplete personal save history.')
        last = None
        for revision in range(1,len(versions)+1):
            owner,previous,_,result = versions[revision]
            require(previous.get('previous') == last, 'Broken personal save preimage.')
            last = {name:result[name] for name in ('score','stylingScore','revision')}
        require(row['snapshot_id'] == previous['snapshot']
                and (row['work_id'],row['video_id'],row['member_id']) == (result['workId'],result['videoId'],result['memberId'])
                and score(row['score']) and score(row['styling_score'])
                and (row['score'],row['styling_score']) == (result['score'],result['stylingScore']),
                'Personal backup row differs from its latest receipt.')
        restored.append((key,owner,row['snapshot_id'],row['work_id'],row['video_id'],row['member_id'],
                         row['score'],row['styling_score'],row['revision']))
    require(seen == histories.keys(), 'A journaled personal rating is missing.')
    return restored


def restore_ratings(con, data):
    rows = latest_ratings(data)
    migration = Path(__file__).resolve().parents[2] / 'drizzle' / '0011_personal_mv_ratings.sql'
    # Each call works on a brand new isolated database. The score table and
    # unique identity are restored using the same migration as the deployed D1.
    for statement in migration.read_text(encoding='utf-8').split('--> statement-breakpoint'):
        con.execute(statement)
    con.executemany('INSERT INTO idol_personal_mv_ratings VALUES (?,?,?,?,?,?,?,?,?)',rows)
    require(sorted(con.execute('SELECT * FROM idol_personal_mv_ratings').fetchall()) == sorted(rows),
            'Personal rating readback differs.')
    return len(rows)


def main():
    if len(sys.argv) != 3:
        raise SystemExit('Usage: restore_personal_mv_ratings.py native-export.json new-local.sqlite')
    source, target = map(Path,sys.argv[1:])
    data = json.loads(source.read_text(encoding='utf-8'))
    latest_ratings(data)
    with target.open('xb'):
        pass
    try:
        with closing(sqlite3.connect(target)) as con, con:
            count = restore_ratings(con,data)
            con.execute('CREATE TABLE saves(id TEXT PRIMARY KEY,row_json TEXT NOT NULL)')
            con.executemany('INSERT INTO saves VALUES (?,?)',((row['id'],json.dumps(row,ensure_ascii=False))
                for row in data['journal'] if row.get('table_key') == 'personal_mv_ratings'))
            require(con.execute('PRAGMA integrity_check').fetchone()[0] == 'ok','SQLite integrity check failed.')
    except BaseException:
        target.unlink(missing_ok=True)
        raise
    print(json.dumps({'personalMvRatings':count,'sqliteIntegrity':'ok'}))


if __name__ == '__main__':
    main()
