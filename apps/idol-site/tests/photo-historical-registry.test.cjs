const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function load(file){const o={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(n=>load(require('node:path').join(require('node:path').dirname(file),n)+'.ts'),o);return o;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261018.solhistoricalr1'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-solhistoricalr1-33.json'));
test('historical batch admits exactly 33 fixed source proofs, preserves quality boundaries and excludes unresolved groups',()=>{
 assert.equal(extra.length,33);assert.equal(new Set(extra.map(c=>c.sha256)).size,33);assert.equal(extra.reduce((n,c)=>n+c.byteLength,0),12039355);
 assert.deepEqual(JSON.parse(JSON.stringify(extra)),fixture.entries.map(e=>e.candidate));
 assert.deepEqual(Object.fromEntries(['newjeans','idle','triples','loona','fromis9'].map(g=>[g,fixture.entries.filter(e=>e.group===g).length])),{newjeans:3,idle:5,triples:19,loona:2,fromis9:4});
 assert.equal(fixture.entries.filter(e=>e.qualityLabel==='HD_source').length,8);assert.equal(fixture.entries.filter(e=>e.qualityLabel==='card_only').length,25);
 const proof=load('lib/idol/photo-source-proof.ts');
 for(const [i,c]of extra.entries()){
  assert.ok(proof.validSourceNamedPhotoProof(c));assert.equal(c.id,c.ratingId+':'+c.candidateVersion+':'+c.sha256);assert.equal(registry.filter(r=>r.ratingId===c.ratingId).length,1);
  assert.ok(c.byteLength>0&&c.byteLength<=3000000);assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.mime,'image/jpeg');assert.equal(c.timestampSeconds,null);assert.equal(c.decodedPixelsVerified,true);
  for(const k of ['memberName','song','version','fileName'])assert.equal(typeof c[k],'string');
  const p={...c};delete p.evidenceId;assert.equal(c.evidenceId,sha(JSON.stringify(Object.fromEntries(Object.keys(p).sort().map(k=>[k,p[k]])))));
  if(fixture.entries[i].qualityLabel==='card_only'){assert.match(c.lookEvidence,/Published-size card only; no HD claim/);assert.doesNotMatch(c.lookEvidence,/HD source quality/);}else assert.match(c.lookEvidence,/HD source quality independently reviewed/);
  assert.doesNotMatch(c.sourceCredit,/HD|未|unverified|unknown/);
 }
});
test('all historical targets are exact existing member-work-video pairs; no snapshot bypass for new native records',()=>{
 const tables=JSON.parse(fs.readFileSync('data/snapshot.json')).tables,policy=load('lib/idol/mv-look-policy.ts');
 for(const c of extra){
  const rating=tables.ratings.records.find(r=>r.recordId===c.ratingId).fields,work=tables.works.records.find(w=>w.recordId===c.workId).fields;
  assert.deepEqual(rating.fld58b7Cvs.map(r=>r.recordId),[c.workId]);assert.deepEqual(rating.fldNSoSjTU.map(r=>r.recordId),[c.memberId]);assert.ok(JSON.stringify(work.fldhBWXBZE).includes(c.videoId));assert.ok(tables.members.records.some(m=>m.recordId===c.memberId));
  const raw={source_kind:c.kind,candidate_id:c.id,evidence_id:c.evidenceId,member_id:c.memberId,work_id:c.workId,exact_video_id:c.videoId,file_token:'native_photo_'+c.sha256,source_url:c.sourcePageUrl,source_image_url:c.sourceImageUrl,type:c.mime,size:c.byteLength,width:c.width,height:c.height},target={ratingId:c.ratingId,memberIds:[c.memberId],workIds:[c.workId],videoId:c.videoId,memberExists:true,workExists:true};
  assert.equal(policy.approvedMvLookPhoto(raw,target)?.candidateId,c.id);for(const change of [{ratingId:'wrong'},{memberIds:['wrong']},{workIds:['wrong']},{videoId:'wrong'}])assert.equal(policy.approvedMvLookPhoto(raw,{...target,...change}),null);
 }
});
