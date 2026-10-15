import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
test('production data and management routes are excluded',()=>{for(const p of ['data/snapshot.json','data/backup.ts','app/api/manage','app/mcp','.openai/hosting.json'])assert.equal(existsSync(p),false,p);});
test('catalog is synthetic and scores distinguish zero and missing',()=>{const d=JSON.parse(readFileSync('fixtures/catalog.json'));assert.equal(d.mode,'snapshot');assert.equal(d.works[0].score,0);assert.equal(d.works[1].score,null);assert.ok(d.works.every(w=>w.id.startsWith('recDemo')));});
test('save rejects requests instead of pretending success',()=>{const s=readFileSync('app/api/save/route.ts','utf8');assert.match(s,/status:403/);assert.doesNotMatch(s,/fetch\(|process\.env/);});
