"""Add five unscored I DO ME member relationships to an existing synthetic D1 preview."""
import argparse
import json
import sqlite3
from pathlib import Path


def apply(state):
    files = [p for p in (state / 'v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if p.name != 'metadata.sqlite']
    if len(files) != 1:
        raise ValueError('Expected one local D1 database in the selected Miniflare preview.')
    project = Path(__file__).resolve().parents[3] / 'apps/idol-site'
    campaign = json.loads((project / 'data/kiiikiii-artist.json').read_bytes())['debutCampaign']
    people = json.loads((project / 'data/kiiikiii-portraits.json').read_bytes())
    snapshot = 'audit-synthetic'
    owner = 'synthetic-audit-owner'
    work = campaign['workId']
    record_ids = ['recAuditKiiiKiii' + p['stageName'].title() for p in people]
    with sqlite3.connect(files[0].resolve().as_uri() + '?mode=rw', uri=True, timeout=15) as db:
        db.execute('BEGIN IMMEDIATE')
        control = db.execute('SELECT owner_id,mode,active_snapshot FROM idol_storage_control WHERE id = ?', ('main',)).fetchone()
        if control != (owner, 'native', snapshot):
            raise ValueError('The selected database is outside the synthetic preview.')
        row = db.execute("SELECT fields_json FROM idol_native_records WHERE snapshot_id=? AND table_key='works' AND record_id=?", (snapshot, work)).fetchone()
        fields = json.loads(row[0]) if row else {}
        if campaign['videoId'] not in str(fields.get('fldhBWXBZE', '')):
            raise ValueError('The selected preview lacks the original public recording.')
        changed = 0
        for index, (person, rating) in enumerate(zip(people, record_ids)):
            member = person['memberId']
            if not db.execute("SELECT 1 FROM idol_native_records WHERE snapshot_id=? AND table_key='members' AND record_id=?", (snapshot, member)).fetchone():
                raise ValueError('The selected preview is missing the public member ' + person['stageName'])
            values = {'fld6BveWOh': 'I DO ME · ' + person['stageName'], 'fld58b7Cvs': [work], 'fldNSoSjTU': [member]}
            encoded = json.dumps(values, ensure_ascii=False)
            existing = db.execute("SELECT fields_json FROM idol_native_records WHERE snapshot_id=? AND table_key='ratings' AND record_id=?", (snapshot, rating)).fetchone()
            if existing:
                prior = json.loads(existing[0])
                if any(prior.get(k) != v for k, v in values.items()):
                    raise ValueError('A synthetic key already belongs to a different relationship.')
                continue
            db.execute("INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,updated_at,version,source_order) VALUES(?,?,'ratings',?,? ,?,1,1,?)",
                       (f'{snapshot}:ratings:{rating}', snapshot, rating, encoded, '0' * 64, index))
            changed += 1
        previous_links = fields.get('fldkgbJyiR', [])
        if previous_links not in ([], record_ids):
            raise ValueError('Existing review relationships would be replaced.')
        if previous_links != record_ids:
            fields['fldkgbJyiR'] = record_ids
            db.execute("UPDATE idol_native_records SET fields_json=?,version=version+1 WHERE snapshot_id=? AND table_key='works' AND record_id=?",
                       (json.dumps(fields, ensure_ascii=False), snapshot, work))
            changed += 1
        if changed:
            db.execute('UPDATE idol_catalog_state SET generation=generation+1,snapshot_id=NULL,checksum=NULL,part_count=NULL,captured_at=NULL WHERE user_id=?', (owner,))
    print('Synthetic I DO ME relationships ready:', len(people), 'members.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('state', type=Path, help='Local Miniflare state directory for the synthetic preview')
    apply(parser.parse_args().state)
