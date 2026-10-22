const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function load(file){const o={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(n=>load(require('node:path').join(require('node:path').dirname(file),n)+'.ts'),o);return o;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261018.solhistoricalr3'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-solhistoricalr3-17.json'));
test('third historical batch admits exactly 17 reviewed photographs with 1 HD and 16 card-only proofs',()=>{
 assert.equal(extra.length,17);assert.equal(extra.reduce((n,c)=>n+c.byteLength,0),2090688);
 assert.deepEqual(JSON.parse(JSON.stringify(extra)),fixture.entries.map(e=>e.candidate));
 assert.deepEqual(Object.fromEntries(['idle','triples','loona','fromis9'].map(g=>[g,fixture.entries.filter(e=>e.group===g).length])),{idle:3,triples:1,loona:10,fromis9:3});
 assert.equal(fixture.entries.filter(e=>e.qualityLabel==='HD_source').length,1);assert.equal(fixture.entries.filter(e=>e.qualityLabel==='card_only').length,16);
 const proof=load('lib/idol/photo-source-proof.ts');
 for(const [i,c]of extra.entries()){
  assert.ok(proof.validSourceNamedPhotoProof(c));assert.equal(c.id,c.ratingId+':'+c.candidateVersion+':'+c.sha256);
  assert.ok(c.byteLength>0&&c.byteLength<=3000000);assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.mime,'image/jpeg');assert.equal(c.timestampSeconds,null);assert.equal(c.decodedPixelsVerified,true);
  for(const k of ['memberName','song','version','fileName'])assert.equal(typeof c[k],'string');
  const p={...c};delete p.evidenceId;assert.equal(c.evidenceId,sha(JSON.stringify(Object.fromEntries(Object.keys(p).sort().map(k=>[k,p[k]])))));
  if(fixture.entries[i].qualityLabel==='card_only'){assert.match(c.lookEvidence,/Published-size card only; no HD claim; do not upscale or stretch/);assert.doesNotMatch(c.lookEvidence,/HD source quality/);}else assert.match(c.lookEvidence,/HD source quality independently reviewed/);
  assert.equal(c.lookBasis,(fixture.entries[i].group==='loona'||c.song==='WE GO')?'exact_mv_shoot_provenance':'exact_mv_visual_match');
 }
 assert.equal(extra.some(c=>c.song==='LUMINOUS'),false);
 for(const c of extra)assert.doesNotMatch(c.memberName,/[（(]/);
});
test('all 190 candidates remain hash-unique and all 173 published operation hashes remain immutable',()=>{
 const legacy=JSON.parse(fs.readFileSync('data/photo-import-candidates.json')),all=[...legacy.candidates,...registry.filter(c=>!['mv-look.20261018.nightmiyeon1','mv-look.20261019.soldelta4'].includes(c.candidateVersion))],{stable}=load('lib/idol/hash.ts');
 assert.equal(all.length,190);assert.equal(new Set(all.map(c=>c.id)).size,190);assert.equal(new Set(all.map(c=>c.sha256)).size,190);
 for(const expected of JSON.parse(fs.readFileSync('tests/fixtures/photo-import-published-173-hashes.json'))){const c=all.find(c=>c.id===expected.id);assert.ok(c);assert.equal(sha(stable({batch:c.candidateVersion??legacy.version,candidate:c})),expected.hash);}
 const src=fs.readFileSync('lib/idol/photo-append-candidates.ts','utf8');const marker=',\n  {\n    "ratingId": "'+extra[0].ratingId+'",\n    "workId": "'+extra[0].workId+'",';const pos=src.lastIndexOf(marker);assert.ok(pos>0);assert.equal(sha(src.slice(0,pos)+'\n];\n'),fixture.oldRegistrySourceSHA256);
 assert.match(fs.readFileSync('lib/idol/photo-import-limits.ts','utf8'),/PHOTO_UPLOAD_HARD_LIMIT=3_000_000/);
});
test('retained original source fragments match their reviewed digests',()=>{
 assert.ok(Object.keys(fixture.evidenceFiles).length>=30);
 for(const [path,expected]of Object.entries(fixture.evidenceFiles))assert.equal(sha(fs.readFileSync(path)),expected,path);
 for(const c of extra){assert.ok(Object.values(fixture.evidenceFiles).includes(c.sourceSnapshotSha256));assert.ok(Object.values(fixture.evidenceFiles).includes(c.lookEvidenceSnapshotSha256));}
});
test('all seventeen targets are exact existing member-work-video relations and cannot authorize another target',()=>{
 const tables=JSON.parse(fs.readFileSync('data/snapshot.json')).tables,policy=load('lib/idol/mv-look-policy.ts');
 for(const c of extra){
  const rating=tables.ratings.records.find(r=>r.recordId===c.ratingId).fields,work=tables.works.records.find(w=>w.recordId===c.workId).fields;
  assert.deepEqual(rating.fld58b7Cvs.map(r=>r.recordId),[c.workId]);assert.deepEqual(rating.fldNSoSjTU.map(r=>r.recordId),[c.memberId]);assert.ok(JSON.stringify(work.fldhBWXBZE).includes(c.videoId));assert.ok(tables.members.records.some(m=>m.recordId===c.memberId));
  const raw={source_kind:c.kind,candidate_id:c.id,evidence_id:c.evidenceId,member_id:c.memberId,work_id:c.workId,exact_video_id:c.videoId,file_token:'native_photo_'+c.sha256,source_url:c.sourcePageUrl,source_image_url:c.sourceImageUrl,type:c.mime,size:c.byteLength,width:c.width,height:c.height},target={ratingId:c.ratingId,memberIds:[c.memberId],workIds:[c.workId],videoId:c.videoId,memberExists:true,workExists:true};
  assert.equal(policy.approvedMvLookPhoto(raw,target)?.candidateId,c.id);for(const change of [{ratingId:'wrong'},{memberIds:['wrong']},{workIds:['wrong']},{videoId:'wrong'}])assert.equal(policy.approvedMvLookPhoto(raw,{...target,...change}),null);
 }
});
