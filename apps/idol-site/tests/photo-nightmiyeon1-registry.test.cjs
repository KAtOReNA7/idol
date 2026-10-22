const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function load(file){const o={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})',{URL})(n=>load(require('node:path').join(require('node:path').dirname(file),n)+'.ts'),o);return o;}
const registry=load('lib/idol/photo-append-candidates.ts').appendPhotoCandidates,extra=registry.filter(c=>c.candidateVersion==='mv-look.20261018.nightmiyeon1'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-nightmiyeon1-1.json'));
test('one source-named showcase photograph has exact immutable card-only admission',()=>{
 assert.equal(extra.length,1);const c=extra[0];assert.deepEqual(JSON.parse(JSON.stringify(extra)),fixture.entries.map(e=>e.candidate));
 assert.ok(load('lib/idol/photo-source-proof.ts').validSourceNamedPhotoProof(c));assert.equal(c.id,c.ratingId+':'+c.candidateVersion+':'+c.sha256);
 assert.equal(c.kind,'mv_look_photo');assert.equal(c.mode,'append-look-preserve-reference');assert.equal(c.lookBasis,'exact_mv_visual_match');assert.equal(c.timestampSeconds,null);assert.equal(c.decodedPixelsVerified,true);
 assert.equal(c.width,1500);assert.equal(c.height,2250);assert.equal(c.byteLength,1138283);assert.equal(c.mime,'image/jpeg');assert.equal(c.sourceIdentityName,'Miyeon');assert.equal(c.videoId,'Jh4QFaPmdss');
 assert.equal(fixture.entries[0].qualityLabel,'card_only');assert.equal(fixture.entries[0].photoContext,'comeback_showcase');assert.equal(fixture.entries[0].productionReady,false);
 assert.match(c.identityEvidence,/not an MV shoot/);assert.match(c.sourceCredit,/watermark preserved/);assert.match(c.lookEvidence,/Card only/);assert.match(c.lookEvidence,/no clean portrait or HD main claim/);assert.match(c.lookEvidence,/No crop\/render test performed/);
 assert.doesNotMatch(JSON.stringify(c),/\/workspace\/|LocalFile|localFile|productionReady|recommendedUse/);
 const p={...c};delete p.evidenceId;assert.equal(c.evidenceId,sha(JSON.stringify(Object.fromEntries(Object.keys(p).sort().map(k=>[k,p[k]])))));
});
test('all 191 candidates are hash-unique and all 190 prior operation hashes and registry text are unchanged',()=>{
 const legacy=JSON.parse(fs.readFileSync('data/photo-import-candidates.json')),all=[...legacy.candidates,...registry.filter(c=>c.candidateVersion!=='mv-look.20261019.soldelta4')],{stable}=load('lib/idol/hash.ts');
 assert.equal(all.length,191);assert.equal(new Set(all.map(c=>c.id)).size,191);assert.equal(new Set(all.map(c=>c.sha256)).size,191);
 const hashes=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-published-190-hashes.json'));assert.equal(hashes.length,190);
 for(const expected of hashes){const c=all.find(c=>c.id===expected.id);assert.ok(c);assert.equal(sha(stable({batch:c.candidateVersion??legacy.version,candidate:c})),expected.hash);}
 const src=fs.readFileSync('lib/idol/photo-append-candidates.ts','utf8');const marker=',\n  {\n    "ratingId": "'+extra[0].ratingId+'",\n    "workId": "'+extra[0].workId+'",';const pos=src.lastIndexOf(marker);assert.ok(pos>0);assert.equal(sha(src.slice(0,pos)+'\n];\n'),fixture.oldRegistrySourceSHA256);
});
test('retained minimal original evidence fragments and MV pixels match digests',()=>{
 assert.equal(Object.keys(fixture.evidenceFiles).length,5);for(const [path,expected]of Object.entries(fixture.evidenceFiles))assert.equal(sha(fs.readFileSync(path)),expected,path);
 const c=extra[0],dir='tests/fixtures/photo-import-nightmiyeon1-evidence/';assert.equal(sha(fs.readFileSync(dir+'dispatch-miyeon-identity.html')),c.sourceSnapshotSha256);assert.equal(sha(fs.readFileSync(dir+'petitlutin-miyeon-precise-mv.html')),c.lookEvidenceSnapshotSha256);
 const identity=fs.readFileSync(dir+'dispatch-miyeon-identity.html','utf8');assert.match(identity,/(Miyeon)/);assert.equal(Buffer.from(identity.match(/data-il="([^"]+)"/)[1],'base64').toString(),c.sourceImageUrl);
 assert.match(fs.readFileSync(dir+'petitlutin-miyeon-precise-mv.html','utf8'),/youtube-nocookie.com\/embed\/Jh4QFaPmdss/);
});
test('the one target is an exact existing member-work-video relation and cannot authorize another target',()=>{
 const tables=JSON.parse(fs.readFileSync('data/snapshot.json')).tables,policy=load('lib/idol/mv-look-policy.ts');
 for(const c of extra){
  const rating=tables.ratings.records.find(r=>r.recordId===c.ratingId).fields,work=tables.works.records.find(w=>w.recordId===c.workId).fields;
  assert.deepEqual(rating.fld58b7Cvs.map(r=>r.recordId),[c.workId]);assert.deepEqual(rating.fldNSoSjTU.map(r=>r.recordId),[c.memberId]);assert.ok(JSON.stringify(work.fldhBWXBZE).includes(c.videoId));assert.ok(tables.members.records.some(m=>m.recordId===c.memberId));
  const raw={source_kind:c.kind,candidate_id:c.id,evidence_id:c.evidenceId,member_id:c.memberId,work_id:c.workId,exact_video_id:c.videoId,file_token:'native_photo_'+c.sha256,source_url:c.sourcePageUrl,source_image_url:c.sourceImageUrl,type:c.mime,size:c.byteLength,width:c.width,height:c.height},target={ratingId:c.ratingId,memberIds:[c.memberId],workIds:[c.workId],videoId:c.videoId,memberExists:true,workExists:true};
  assert.equal(policy.approvedMvLookPhoto(raw,target)?.candidateId,c.id);for(const change of [{ratingId:'wrong'},{memberIds:['wrong']},{workIds:['wrong']},{videoId:'wrong'}])assert.equal(policy.approvedMvLookPhoto(raw,{...target,...change}),null);
 }
});
