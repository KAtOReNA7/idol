const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto'),path=require('node:path');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
function load(file){const out={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(n=>load(path.join(path.dirname(file),n)+'.ts'),out);return out;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261019.soldelta4'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-soldelta4-15.json'));
test('delta4 admits exactly the 15 reviewed original candidates and unchanged source-proof records',()=>{
 assert.equal(extra.length,15);assert.equal(extra.reduce((n,c)=>n+c.byteLength,0),6823588);assert.deepEqual(plain(extra),fixture.entries.map(e=>e.candidate));
 assert.deepEqual(Object.fromEntries(['idle','fromis9','billlie','triples'].map(g=>[g,fixture.entries.filter(e=>e.group===g).length])),{idle:5,fromis9:1,billlie:5,triples:4});
 assert.equal(fixture.entries.filter(e=>e.qualityTier==='card_only').length,10);assert.equal(fixture.entries.filter(e=>e.qualityTier==='HD_source').length,5);assert.equal(fixture.entries.filter(e=>e.isNewPhoto).length,7);
 const proof=load('lib/idol/photo-source-proof.ts');
 for(const [i,c]of extra.entries()){
  assert.ok(proof.validSourceNamedPhotoProof(c));assert.equal(c.id,c.ratingId+':'+c.candidateVersion+':'+c.sha256);assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.kind,'mv_look_photo');assert.equal(c.ownerScope,'current-native-project-owner');assert.equal(c.timestampSeconds,null);assert.equal(c.decodedPixelsVerified,true);assert.ok(c.byteLength>0&&c.byteLength<=3000000);assert.doesNotMatch(JSON.stringify(c),/\/workspace\/|ownerConfirmation/);
  const bytes=fs.readFileSync(fixture.entries[i].proofRecord),record=JSON.parse(bytes);assert.equal(sha(bytes),c.evidenceId);for(const [k,v]of Object.entries(record))assert.equal(c[k],v,k);assert.equal(bytes.toString(),JSON.stringify(Object.fromEntries(Object.keys(record).sort().map(k=>[k,record[k]]))));
 }
});
test('historical delta4 subset has exactly 206 hash-unique candidates; prior hashes and source prefix remain immutable',()=>{
 const legacy=JSON.parse(fs.readFileSync('data/photo-import-candidates.json')),published=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-published-206-hashes.json')),ids=new Set(published.map(e=>e.id)),historical=registry.filter(c=>ids.has(c.id)),all=[...legacy.candidates,...historical],{stable}=load('lib/idol/hash.ts');
 assert.equal(published.length,206);assert.equal(ids.size,206);assert.equal(all.every(c=>ids.has(c.id)),true);
 assert.equal(historical.length,186);assert.equal(all.length,206);assert.equal(new Set(all.map(c=>c.id)).size,206);assert.equal(new Set(all.map(c=>c.sha256)).size,206);assert.equal(new Set(extra.map(c=>c.ratingId)).size,15);assert.equal(all.reduce((n,c)=>n+c.byteLength,0),72533311);
 const prior=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-published-191-hashes.json'));assert.equal(prior.length,191);
 for(const e of prior){const c=all.find(x=>x.id===e.id);assert.ok(c);assert.equal(sha(stable({batch:c.candidateVersion??legacy.version,candidate:c})),e.hash,e.id);}
 const src=fs.readFileSync('lib/idol/photo-append-candidates.ts','utf8'),marker=',\n  {\n    "id": "'+extra[0].id+'",',pos=src.indexOf(marker);assert.ok(pos>0);assert.equal(sha(src.slice(0,pos)+'\n];\n'),fixture.oldRegistrySourceSHA256);
});
test('deduplicated retained source, exact-version, diagnostic-pixel and proof evidence matches every digest',()=>{
 assert.equal(Object.keys(fixture.evidenceFiles).length,50);
 for(const [file,digest]of Object.entries(fixture.evidenceFiles)){assert.ok(file.startsWith('tests/fixtures/'));assert.equal(sha(fs.readFileSync(file)),digest,file);}
 for(const e of fixture.entries){for(const hash of [e.candidate.sourceSnapshotSha256,e.candidate.lookEvidenceSnapshotSha256,e.candidate.evidenceId])assert.ok(e.evidenceFiles.some(file=>fixture.evidenceFiles[file]===hash));assert.equal(e.liveTuplePreflightStillRequired,true);assert.equal(e.renderTested,false);assert.equal(e.uploaded,false);}
});
test('all 15 targets are exact existing member-work-video tuples and reject cross-target/raw-attachment substitutions',()=>{
 const tables=JSON.parse(fs.readFileSync('data/snapshot.json')).tables,policy=load('lib/idol/mv-look-policy.ts');
 for(const c of extra){
  const rating=tables.ratings.records.find(r=>r.recordId===c.ratingId).fields,work=tables.works.records.find(w=>w.recordId===c.workId).fields;
  assert.deepEqual(rating.fld58b7Cvs.map(r=>r.recordId),[c.workId]);assert.deepEqual(rating.fldNSoSjTU.map(r=>r.recordId),[c.memberId]);assert.ok(JSON.stringify(work.fldhBWXBZE).includes(c.videoId));assert.ok(tables.members.records.some(m=>m.recordId===c.memberId));assert.equal(work.fld6ahf75U,c.song);
  const raw={source_kind:c.kind,candidate_id:c.id,evidence_id:c.evidenceId,member_id:c.memberId,work_id:c.workId,exact_video_id:c.videoId,file_token:'native_photo_'+c.sha256,source_url:c.sourcePageUrl,source_image_url:c.sourceImageUrl,type:c.mime,size:c.byteLength,width:c.width,height:c.height},target={ratingId:c.ratingId,memberIds:[c.memberId],workIds:[c.workId],videoId:c.videoId,memberExists:true,workExists:true};
  assert.equal(policy.approvedMvLookPhoto(raw,target)?.candidateId,c.id);
  for(const change of [{ratingId:'wrong'},{memberIds:['wrong']},{workIds:['wrong']},{videoId:'wrong'},{memberExists:false},{workExists:false}])assert.equal(policy.approvedMvLookPhoto(raw,{...target,...change}),null);
  for(const change of [{evidence_id:'0'.repeat(64)},{file_token:'native_photo_'+'0'.repeat(64)},{width:350},{source_image_url:'https://example.com/other.jpg'}])assert.equal(policy.approvedMvLookPhoto({...raw,...change},target),null);
 }
});
test('Nxde remains truthful full-original/card-only, Billlie remains showcase, and ZAP/LUMINOUS are not reimported',()=>{
 const nxde=fixture.entries.filter(e=>e.candidate.song==='Nxde');assert.equal(nxde.length,5);
 for(const e of nxde){assert.equal(e.candidate.width,700);assert.equal(e.candidate.height,612);assert.equal(e.qualityTier,'card_only');assert.deepEqual(e.displayFocus.sourceCrop,{x:350,y:0,width:350,height:612});assert.equal(e.displayFocus.maxEffectiveWidth,350);assert.equal(e.displayFocus.preserveOriginal,true);assert.equal(e.displayFocus.liveDefaultBlockedUntilFocusWired,true);assert.match(e.candidate.lookEvidence,/right-side|right photograph/);}
 const billlie=extra.filter(c=>['EUNOIA','DANG! (hocus pocus)'].includes(c.song));assert.equal(billlie.length,5);for(const c of billlie){assert.equal(c.lookBasis,'exact_mv_visual_match');assert.match(c.sourceName,/发布会同造型照/);}
 const dang=billlie.find(c=>c.song==='DANG! (hocus pocus)');assert.equal(dang.sourceIdentityName,'시윤');assert.match(dang.lookEvidence,/shorts|短裤/i);assert.match(dang.lookEvidence,/tights|袜/i);
 assert.equal(fixture.alreadyRegisteredZAP.length,7);for(const z of fixture.alreadyRegisteredZAP){const matched=registry.filter(c=>c.sha256===z.sha256&&c.ratingId===z.ratingId&&c.workId===z.workId&&c.memberId===z.memberId);assert.equal(matched.length,1);assert.notEqual(matched[0].candidateVersion,fixture.candidateVersion);}
 assert.equal(fixture.excludedLUMINOUS.length,11);assert.equal(extra.some(c=>c.song==='LUMINOUS'||c.song==='ZAP'),false);
});
