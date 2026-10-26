const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
function load(file){const out={};vm.runInNewContext('(function(exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(out);return out;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261018.solr4'),expected=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-sol-r4-30.json')),proof=load('lib/idol/photo-source-proof.ts');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
test('solr4 admits exactly thirty independent selected cards with fixed bytes, identity and proof bindings',()=>{
 assert.equal(extra.length,30);assert.equal(new Set(extra.map(c=>c.sha256)).size,30);assert.equal(extra.reduce((n,c)=>n+c.byteLength,0),4466269);
 for(const [i,c]of extra.entries()){
  assert.deepEqual(Object.fromEntries(Object.keys(expected[i]).map(k=>[k,c[k]])),expected[i]);
  assert.equal(c.id,c.ratingId+':mv-look.20261018.solr4:'+c.sha256);assert.equal(registry.filter(r=>r.ratingId===c.ratingId).length,1);
  assert.equal(c.kind,'mv_look_photo');assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.ownerScope,'current-native-project-owner');assert.equal(c.decodedPixelsVerified,true);
  assert.equal(typeof c.version,'string');assert.equal(typeof c.memberName,'string');assert.equal(typeof c.song,'string');assert.ok(proof.validSourceNamedPhotoProof(c));assert.equal(c.lookBasis,'exact_mv_shoot_provenance');assert.equal(c.timestampSeconds,null);assert.ok(c.byteLength>0&&c.byteLength<=3000000);
  assert.ok(['Dispatch','Melon Magazine / Kep1er'].includes(c.sourceCredit));assert.equal(c.ownerConfirmationMessageId,undefined);
  const p={...c};delete p.evidenceId;assert.equal(c.evidenceId,sha(JSON.stringify(Object.fromEntries(Object.keys(p).sort().map(k=>[k,p[k]])))));
  assert.match(c.identityEvidence,/not the omitted full page/);assert.match(c.lookEvidence,/no finished-MV frame comparison or timecode asserted/);
 }
});
test('solr4 targets existing exact snapshot relations and never creates the five held missing relations',()=>{
 const tables=JSON.parse(fs.readFileSync('data/snapshot.json')).tables;
 for(const c of extra){
  const rating=tables.ratings.records.find(r=>r.recordId===c.ratingId).fields,work=tables.works.records.find(r=>r.recordId===c.workId).fields;
  assert.deepEqual(rating.fld58b7Cvs.map(r=>r.recordId),[c.workId]);assert.deepEqual(rating.fldNSoSjTU.map(r=>r.recordId),[c.memberId]);assert.ok(JSON.stringify(work.fldhBWXBZE).includes(c.videoId));
  assert.ok(tables.members.records.some(m=>m.recordId===c.memberId));assert.equal(c.song,work.fld6ahf75U);
 }
 assert.equal(extra.filter(c=>c.song==='WA DA DA').length,9);assert.equal(extra.filter(c=>c.song==='TIPI-TAP').length,7);assert.equal(extra.filter(c=>c.song==='SWICY').length,6);assert.equal(extra.filter(c=>c.song==='너만 몰라 (Curious)').length,8);
 assert.ok(!extra.some(c=>/katseye|touch/i.test(c.fileName)));assert.ok(!extra.some(c=>c.song==='SWICY'&&/gehlee|yunha/i.test(c.memberName)));
});
