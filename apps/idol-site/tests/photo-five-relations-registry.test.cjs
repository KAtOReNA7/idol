const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function load(file){const o={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(n=>load(require('node:path').join(require('node:path').dirname(file),n)+'.ts'),o);return o;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261018.solr4relations5'),resolved=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-five-resolved-relations.json')),expected=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-solr4relations5.json'));
test('only five genuine native readback relations resolve previously qualified photo holds',()=>{
 const created=fs.readFileSync('tests/fixtures/five-relations-created-20261018.json'),refreshed=fs.readFileSync('tests/fixtures/five-relations-refreshed-20261018.json');
 assert.equal(sha(created),resolved.createdReadbackSHA256);assert.equal(sha(refreshed),resolved.refreshedReadbackSHA256);
 const text=JSON.parse(refreshed).content[0].text,pairs=Array.from(text.matchAll(/label: '([^']+)',\s*recordId: '([^']+)',\s*revision: '([^']+)'/g),m=>({label:m[1],recordId:m[2],revision:m[3]}));
 assert.equal(pairs.length,5);assert.equal(resolved.pairs.length,5);
 const code=fs.readFileSync('lib/idol/relation-maintenance.ts','utf8'),fixed=Array.from(code.matchAll(/memberId:'([^']+)',workId:'([^']+)',videoId:'([^']+)',memberName:'([^']+)',song:'([^']+)'/g),m=>({memberId:m[1],workId:m[2],videoId:m[3],memberName:m[4],song:m[5]}));assert.equal(fixed.length,5);
 const snapshot=JSON.parse(fs.readFileSync('data/snapshot.json')).tables;
 for(const p of resolved.pairs){
  assert.deepEqual(pairs.find(r=>r.recordId===p.recordId),{label:p.label,recordId:p.recordId,revision:p.revision});
  assert.ok(created.toString().includes(p.recordId));assert.ok(created.toString().includes(p.revision));assert.equal(p.originalVerdictRatingId,null);
  const exact=fixed.find(r=>r.memberId===p.memberId&&r.workId===p.workId);assert.deepEqual(exact,Object.fromEntries(['memberId','workId','videoId','memberName','song'].map(k=>[k,p[k]])));
  assert.equal(snapshot.ratings.records.some(r=>r.recordId===p.recordId),false);
  const work=snapshot.works.records.find(w=>w.recordId===p.workId);assert.ok(JSON.stringify(work.fields.fldhBWXBZE).includes(p.videoId));assert.ok(snapshot.members.records.some(m=>m.recordId===p.memberId));
  const c=extra.find(c=>c.ratingId===p.recordId);assert.ok(c);for(const k of ['memberId','workId','videoId','sha256'])assert.equal(c[k],p[k]);
 }
});
test('five append payloads are immutable, byte bounded, source qualified and bind exactly their own native target',()=>{
 assert.equal(extra.length,5);assert.equal(new Set(extra.map(c=>c.sha256)).size,5);assert.equal(extra.reduce((n,c)=>n+c.byteLength,0),2015901);
 assert.deepEqual(JSON.parse(JSON.stringify(extra)),expected);const {validSourceNamedPhotoProof}=load('lib/idol/photo-source-proof.ts');
 for(const c of extra){
  assert.equal(registry.filter(x=>x.ratingId===c.ratingId).length,1);assert.equal(c.id,c.ratingId+':'+c.candidateVersion+':'+c.sha256);assert.ok(validSourceNamedPhotoProof(c));
  for(const k of ['memberName','song','version','fileName'])assert.equal(typeof c[k],'string');assert.ok(c.byteLength>0&&c.byteLength<=3000000);
  assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.timestampSeconds,null);assert.equal(c.kind,'mv_look_photo');assert.equal(c.decodedPixelsVerified,true);
  const p={...c};delete p.evidenceId;assert.equal(c.evidenceId,sha(JSON.stringify(Object.fromEntries(Object.keys(p).sort().map(k=>[k,p[k]])))));
  assert.equal(c.lookBasis,c.song==='Touch'?'exact_mv_visual_match':'exact_mv_shoot_provenance');assert.ok(['Dispatch','KATSEYE official'].includes(c.sourceCredit));
  assert.match(c.lookEvidence,/Card use only/);if(c.song==='Touch')assert.match(c.lookEvidence,/Apple.*preview|preview.*Apple/);
 }
});
test('native IDs do not relax exact approval bindings or permit cross-pair attachment reuse',()=>{
 const policy=load('lib/idol/mv-look-policy.ts');
 for(const c of extra){
  const raw={source_kind:c.kind,candidate_id:c.id,evidence_id:c.evidenceId,member_id:c.memberId,work_id:c.workId,exact_video_id:c.videoId,file_token:'native_photo_'+c.sha256,source_url:c.sourcePageUrl,source_image_url:c.sourceImageUrl,type:c.mime,size:c.byteLength,width:c.width,height:c.height};
  const target={ratingId:c.ratingId,memberIds:[c.memberId],workIds:[c.workId],videoId:c.videoId,memberExists:true,workExists:true};
  assert.equal(policy.approvedMvLookPhoto(raw,target)?.candidateId,c.id);
  for(const other of extra.filter(x=>x!==c))assert.equal(policy.approvedMvLookPhoto(raw,{...target,ratingId:other.ratingId}),null);
  for(const change of [{memberIds:['wrong']},{workIds:['wrong']},{videoId:'wrong'},{memberExists:false},{workExists:false}])assert.equal(policy.approvedMvLookPhoto(raw,{...target,...change}),null);
 }
});
