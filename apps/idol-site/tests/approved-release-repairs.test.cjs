const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const manifest=read('evidence/approved-release-repairs/manifest.json');
test('all source bytes retained and all display paths verified within budget',()=>{
 assert.equal(manifest.covers.length,80);
 let bytes=0;
 for(const m of manifest.covers){
  assert.equal(digest(m.originalPath),m.sourceSha256);
  assert.equal(digest('public'+m.displayPath),m.displaySha256);
  if(m.mode==='display_derivative'){
   bytes+=fs.statSync(path.join(root,'public'+m.displayPath)).size;
   assert.ok(Math.max(...m.displayDimensions)<=1200);
   assert.ok(m.displayDimensions[0]<=m.sourceDimensions[0]);
   assert.ok(m.displayDimensions[1]<=m.sourceDimensions[1]);
  }
 }
 assert.ok(bytes<=20*1024*1024,bytes);
});
for(const group of ['itzy','nmixx','kiiikiii','xg'])test(group+' preserves existing identity and private-independent metadata',()=>{
 const before=read('evidence/approved-release-repairs/'+group+'-baseline.json');
 const after=read('data/'+group+'-artist.json');
 for(const [key,value] of Object.entries(before)){
  if(['releases','supplementalReleases','upcoming','releaseCoverage'].includes(key))continue;
  assert.deepEqual(after[key],value,key);
 }
 for(const old of before.releases){
  const now=after.releases.find(r=>r.id===old.id);assert.ok(now,old.id);
  for(const [key,value] of Object.entries(old)){
   if(['image','imageSourceUrl','imageKind'].includes(key)&&!old.image)continue;
   assert.deepEqual(now[key],value,old.id+':'+key);
  }
 }
 const ids=new Set();
 for(const row of [...after.releases,...after.supplementalReleases??[]]){
  assert.ok(!ids.has(row.id));ids.add(row.id);
  assert.ok(row.date<='2026-10-18',row.title);
  assert.ok(row.image&&fs.existsSync(path.join(root,'public',row.image)),row.title);
 }
});
test('new catalogs are bounded, categories separated, future NMIXX not released',()=>{
 const itzy=read('data/itzy-artist.json'),nmixx=read('data/nmixx-artist.json');
 assert.equal(itzy.releases.length,25);assert.equal(itzy.supplementalReleases.length,10);
 assert.equal(nmixx.releases.length,14);assert.equal(nmixx.supplementalReleases.length,10);
 assert.equal(nmixx.upcoming.length,1);assert.equal(nmixx.upcoming[0].date,'2026-12-09');
 for(const g of [itzy,nmixx])assert.ok(g.releases.every(r=>!r.category||r.category==='group'));
 for(const group of ['itzy','nmixx']){
  const component=fs.readFileSync(path.join(root,'components/'+group+'-artist.tsx'),'utf8');
  for(const category of ['solo','collaboration','soundtrack','version'])assert.ok(component.includes("category==='"+category+"'"));
  assert.ok(component.includes('content.upcoming.map'));
 }
 const xg=fs.readFileSync(path.join(root,'components/expanded-artist.tsx'),'utf8');
 assert.ok(xg.includes('REMIXES & VERSIONS'));assert.ok(xg.includes('MEMBER SOLO'));
});
