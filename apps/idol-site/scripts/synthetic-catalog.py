"""Emit the public inventory and fictional members into a new local preview database."""
import json
import sqlite3
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
snapshot = 'audit-synthetic'
owner = 'synthetic-audit-owner'
db = sqlite3.connect(':memory:')
schema = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((root / 'drizzle').glob('*.sql')))
db.executescript(schema)
db.execute('INSERT INTO idol_storage_control VALUES(?,?,?,?,?,?,?)', ('main', owner, 'native', 1, snapshot, None, 1))
db.execute('INSERT INTO idol_native_snapshots VALUES(?,?,?,?,?,?,?)', (snapshot, owner, 'active', '2026-11-21T00:00:00Z', '0'*64, '{}', 1))
db.execute('INSERT INTO idol_catalog_state(user_id,generation) VALUES(?,1)', (owner,))
for table in ('groups', 'members', 'works', 'ratings'):
    db.execute('INSERT INTO idol_native_fields VALUES(?,?,?,?)', (f'{snapshot}:{table}', snapshot, table, '[]'))

def record(table, order, record_id, fields):
    db.execute('INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,updated_at,version,source_order) VALUES(?,?,?,?,?,?,1,1,?)',
               (f'{snapshot}:{table}:{record_id}', snapshot, table, record_id, json.dumps(fields, ensure_ascii=False), '0'*64, order))

def load(file):
    return json.loads((root / file).read_text(encoding='utf-8'))

works = load('data/stages/inventory.json')['works']
for index, group in enumerate(load('HANDOFF/artist-registry51.json')):
    gid = group['groupId']
    member = f'recAuditSyntheticMember{index}'
    record('groups', index, gid, {'fld67LEUaG': group.get('name', group['slug']), 'fldhQc8PnX': [member], 'fldDrA68Gz': [w['recordId'] for w in works if gid in w['groupIds']]})
    record('members', index, member, {'fldkWtH5Dl': f'合成成员 {index}', 'fld6bhQOdO': [gid]})
for index, work in enumerate(works):
    mv = work['mv'] or ''
    record('works', index, work['recordId'], {'fld7a3lnBc': work['name'], 'fld2wy1cqw': work['groupIds'], 'fld6ahf75U': work['song'], 'fldhBWXBZE': mv.get('url', '') if isinstance(mv, dict) else mv, 'fld3owwWZX': work['version']})
with Path(sys.argv[1]).open('x', encoding='utf-8') as target:
    target.write(schema + '\n' + '\n'.join(row for row in db.iterdump() if row.startswith('INSERT INTO ')))
