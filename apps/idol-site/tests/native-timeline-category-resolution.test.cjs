const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const proofPath=path.join(root,'evidence/category-resolution-20261027/native-timeline-corrections.json'),raw=fs.readFileSync(proofPath),proof=JSON.parse(raw);
test('three native presentation datasets use exact reviewed before/after bytes without changing other presentation data',()=>{
 assert.equal(hash(raw),'d5350965ef15005c4c526a7deca4b0367e8e971e8183d44ec7a9b7c4f80a08db');
 for(const d of proof.documents){assert.equal(hash(JSON.stringify(d.before,null,2)+'\n'),d.beforeSha256);assert.equal(hash(JSON.stringify(d.after,null,2)+'\n'),d.afterSha256);assert.equal(hash(fs.readFileSync(path.join(root,d.path))),d.afterSha256);const restored=structuredClone(d.after);restored.events=d.before.events;if(d.slug==='ifeye')restored.publicContent.events=d.before.publicContent.events;assert.deepEqual(restored,d.before,'no unrelated design, assets, identities or content changes');}
});
test('ifeye retains presentation IDs and member links while clearly amending the announced plan',()=>{
 const d=proof.documents.find(d=>d.slug==='ifeye'),ids=['e-ifeye-sasha-hiatus-notice','e-ifeye-sasha-return-plan'];assert.deepEqual(d.after.events.map(e=>e.id),d.before.events.map(e=>e.id));
 for(const id of ids){const a=d.after.events.find(e=>e.id===id),b=d.before.events.find(e=>e.id===id);assert.equal(a.eventDate,null);assert.equal(a.status,'announced');assert.equal(a.date,b.date);assert.deepEqual(a.memberIds,b.memberIds);assert.deepEqual(a.workIds,b.workIds);assert.ok(a.evidenceRefs.length>0);}
 const resume=d.after.events.find(e=>e.id===ids[1]);assert.equal(resume.date,'2026-06-15');assert.equal(resume.plannedDate,'2026-07-01');assert.match(d.after.publicContent.events[resume.id].title,/计划.*6月25日.*7月1日/);
});
test('GENBLUE exposes both sourced audio releases, preserving the five existing native events',()=>{
 const d=proof.documents.find(d=>d.slug==='genblue'),old=new Set(d.before.events.map(e=>e.id));assert.deepEqual(d.after.events.filter(e=>old.has(e.id)),d.before.events);assert.equal(d.after.events.length,7);
 for(const [id,date] of [['e-genblue-oh-chinese-single','2025-04-29'],['e-genblue-swing-dance-single','2025-08-04']]){const e=d.after.events.find(e=>e.id===id);assert.equal(e.date,date);assert.equal(e.eventDate,date);assert.equal(e.announcementDate,null);assert.match(e.title,/数字发行/);assert.deepEqual(e.workIds,[]);assert.equal(e.status,'confirmed');assert.ok(fs.existsSync(path.join(root,e.evidenceRef)));}
 assert.deepEqual(d.after.events.map(e=>e.date),d.after.events.map(e=>e.date).sort());
});
test('Rocket Punch retains stronger existing company evidence and never turns the public-letter day into effective date',()=>{
 const d=proof.documents.find(d=>d.slug==='rocketpunch'),id='e-rocketpunch-suyun-contract-announcement',a=d.after.events.find(e=>e.id===id),b=d.before.events.find(e=>e.id===id);
 assert.deepEqual(d.after.events.filter(e=>e.id!==id),d.before.events.filter(e=>e.id!==id));assert.equal(a.eventDate,null);assert.equal(a.announcementDate.value,'2026-08-06');assert.equal(a.status,'confirmed');assert.deepEqual(a.sources.slice(0,-1),b.sources);assert.equal(a.sources.at(-1).checkedAt,'2026-10-27');assert.match(a.title,/公开信/);assert.deepEqual(a.memberIds,b.memberIds);
});
