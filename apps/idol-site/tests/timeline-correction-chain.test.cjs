'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateCorrectionChain,digest}=require('./helpers/timeline-correction-chain.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p));
const registry=require('../data/artist-timeline-registry.json');
const baseline={corrections:[require('../HANDOFF/timeline-corrections/triples-assemble24.json'),require('../evidence/approved-visual-repairs/badvillain-overstep-correction.json'),require('../evidence/approved-visual-repairs/madein-rise-correction.json')],ledger:require('../HANDOFF/batch-f/integration-ledger.json'),snapshot:require('../data/snapshot.json'),events:new Map(registry.flatMap(g=>JSON.parse(read(`data/artist-timelines/${g.slug}.json`)).events.map(e=>[e.id,e])))};
function input(){return {...structuredClone(baseline),readBytes:read};}
function rehash(a){const c=a.corrections[0];c.beforeSha256=digest(c.before);c.afterSha256=digest(c.after);c.diff=c.allowedFields.map(field=>({field,before:c.before[field],after:c.after[field]}));a.events.set(c.eventId,structuredClone(c.after));}
test('three sourced corrections chain exact historical before to exact current after; 623 unique events remain',()=>{
 const a=input(),historical=validateCorrectionChain(a),c=a.corrections[0];
 assert.equal(a.events.size,623);assert.equal(historical.size,623);
 assert.deepEqual(historical.get(c.eventId),c.before);assert.equal(c.before.eventDate,null);assert.deepEqual(c.before.workIds,[]);
 assert.equal([...a.events].filter(([id,event])=>digest(event)!==digest(historical.get(id))).length,3);
 assert.deepEqual(c.after.sources[0],c.before.sources[0]);
});
const negatives={
 'missing correction':a=>a.corrections=[],
 'unlisted correction':a=>a.corrections.push({...a.corrections[0],eventId:'unlisted'}),
 'wrong correction target':a=>a.corrections[0].eventId='e-triples-aaa-dimension-debut',
 'incorrect before even with recomputed hash':a=>{a.corrections[0].before.summary='changed history';rehash(a);},
 'wrong historical adopted hash':a=>a.corrections[0].historicalAdoptedSha256='0'.repeat(64),
 'current object not matching after':a=>a.events.get(a.corrections[0].eventId).summary='unlisted edit',
 'missing public source':a=>{a.corrections[0].after.sources.pop();rehash(a);},
 'modified old Bugs source':a=>{a.corrections[0].after.sources[0].scopeNote='rewritten history';rehash(a);},
 'missing evidence file':a=>a.readBytes=p=>{if(p.includes('assemble24-source'))throw Error('missing');return read(p);},
 'evidence bytes changed':a=>a.readBytes=p=>p.includes('assemble24-source')?Buffer.from('{}'):read(p),
 'article date confused with update':a=>{a.corrections[0].after.sources.at(-1).sourcePublishedAt.value='2024-05-08';rehash(a);},
 'member relationship added':a=>{a.corrections[0].after.memberIds=['member'];rehash(a);},
 'out of scope review change despite declared whitelist expansion':a=>{a.corrections[0].after.reviewStatus='hold';a.corrections[0].allowedFields.push('reviewStatus');rehash(a);},
 'another event changed':a=>{const id=a.ledger.events.find(r=>r.eventId!==a.corrections[0].eventId).eventId;a.events.get(id).summary='outside correction';},
 'incorrect release day':a=>{a.corrections[0].after.eventDate.value='2024-05-09';rehash(a);},
 'work record link drift':a=>{a.corrections[0].after.workIds=['other'];rehash(a);},
 'work proof drift':a=>a.corrections[0].workIdentity.url='https://www.youtube.com/watch?v=other',
 'snapshot video identity drift':a=>a.snapshot.tables.works.records.find(w=>w.recordId==='rec28ldfRTrCjG').fields.fldhBWXBZE[0].url='https://www.youtube.com/watch?v=other',
 'snapshot official title drift':a=>a.snapshot.tables.works.records.find(w=>w.recordId==='rec28ldfRTrCjG').fields.fld6nT26GF='Other MV',
 'snapshot group identity drift':a=>a.snapshot.tables.works.records.find(w=>w.recordId==='rec28ldfRTrCjG').fields.fld2wy1cqw=[],
 'snapshot duplicate work':a=>a.snapshot.tables.works.records.push(a.snapshot.tables.works.records.find(w=>w.recordId==='rec28ldfRTrCjG')),
};
for(const [name,mutate] of Object.entries(negatives))test(`correction fails closed: ${name}`,()=>{const a=input();mutate(a);assert.throws(()=>validateCorrectionChain(a));});

for(const [label,mutate] of Object.entries({
 'missing BADVILLAIN correction':a=>a.corrections.pop(),
 'BADVILLAIN incorrect release date':a=>a.corrections[1].after.eventDate.value='2024-06-04',
 'BADVILLAIN changed original source':a=>a.corrections[1].after.sources[0].scopeNote='changed',
 'BADVILLAIN changed member association':a=>a.corrections[1].after.memberIds.push('recFake'),
 'BADVILLAIN missing new evidence':a=>a.readBytes=p=>{if(p.includes('badvillain-overstep-date'))throw Error('missing');return read(p);},
 'BADVILLAIN changed historical hash':a=>a.corrections[1].beforeDocumentSha256='0'.repeat(64),
}))test(`correction fails closed: ${label}`,()=>{const a=input();mutate(a);assert.throws(()=>validateCorrectionChain(a));});

for(const [label,mutate] of Object.entries({
 'missing MADEIN correction':a=>a.corrections.pop(),
 'MADEIN unexpected review promotion':a=>{const id=a.ledger.events.find(row=>row.slug==='madein'&&row.eventId!=='e-madein-rise-release-carrier-hold').eventId;a.events.get(id).reviewStatus='hold';},
 'MADEIN inferred physical release':a=>a.corrections[2].after.eventDate.value='2024-09-20',
 'MADEIN replaced original work identity':a=>a.corrections[2].after.workIds[0]='recWrong',
 'MADEIN missing distribution evidence':a=>a.readBytes=p=>{if(p.includes('madein-rise-distribution'))throw Error('missing');return read(p);},
 'MADEIN modified distribution evidence':a=>a.readBytes=p=>p.includes('madein-rise-distribution')?Buffer.from('{}'):read(p),
 'MADEIN unrecorded extra event':a=>a.events.set('e-madein-rise-release-carrier-hold',{...a.events.get('e-madein-rise-release-carrier-hold'),id:'new'}),
}))test(`correction fails closed: ${label}`,()=>{const a=input();mutate(a);assert.throws(()=>validateCorrectionChain(a));});
