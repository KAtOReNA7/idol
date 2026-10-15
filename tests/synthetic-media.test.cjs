const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const fixture=JSON.parse(fs.readFileSync('fixtures/catalog.json','utf8'));
function load(file){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(exports,require){'+code+'})',{URL,Response})(exports,name=>{assert.equal(name,'@/fixtures/catalog.json');return {default:fixture};});return exports;}
const {GET}=load('app/api/media/route.ts');
const request=(table,record,index='0')=>new Request('http://localhost/api/media?'+new URLSearchParams({table,record,index}));
test('synthetic media supplies portrait and landscape images only for registered fixtures',async()=>{
 for(const [record,dimensions] of [['recDemo0Rating0','400 × 600'],['recDemo0Rating1','900 × 500']]){
  const response=GET(request('ratings',record));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/svg+xml');const svg=await response.text();assert.ok(svg.includes(dimensions));assert.ok(svg.includes('no real photo'));assert.ok(!svg.includes('<image'));assert.ok(response.headers.get('content-security-policy').includes('sandbox'));
 }
});
test('missing pictures and arbitrary record, table and index inputs fail closed',()=>{
 for(const args of [['ratings','recDemo0Rating2'],['ratings','unknown'],['ratings','../../etc/passwd'],['members','recDemo0Rating0'],['ratings','recDemo0Rating0','1'],['ratings','recDemo0Rating0','0x0']])assert.equal(GET(request(...args)).status,404);
});
test('media fixture registration preserves fictional member-work relationships',()=>{
 for(const r of fixture.ratings.filter(r=>r.photo)){
  assert.equal(r.photo.table,'ratings');assert.equal(r.photo.recordId,r.id);assert.ok(r.memberIds.every(id=>id.startsWith('recDemo')));assert.ok(r.workIds.every(id=>id.startsWith('recDemo')));assert.ok(r.recognition.includes('synthetic fixture'));
 }
 assert.ok(fixture.ratings.some(r=>r.photo===null));
});
test('save remains forbidden and the fixture stays a snapshot',async()=>{
 const {POST}=load('app/api/save/route.ts');const before=JSON.stringify(fixture),response=POST();assert.equal(response.status,403);assert.equal((await response.json()).error,'SANDBOX_READ_ONLY');assert.equal(fixture.mode,'snapshot');assert.equal(JSON.stringify(fixture),before);
});
