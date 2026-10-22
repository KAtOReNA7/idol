// Synthetic-only projection tests. No real candidate admission, storage or writes.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');

function loader({approvals,reviews}={}){
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
  const out={};cache.set(file,out);
  const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams})(name=>{
   const stubs={'./feishu':{configured:()=>false},'./live':{},'./placeholders':{groupPlaceholderFor:()=>null,wasAuditedGroupPlaceholder:()=>false},'./supplements':{stageSupplementForWork:()=>null},'./stage':{stageForWork:()=>null,stageResearchForWork:()=>({status:'pending'})}};
   if(name in stubs)return stubs[name];
   const result=load(path.resolve(path.dirname(file),name)+'.ts');
   if(name==='./mv-look-policy'&&approvals)return {...result,approvedMvLookPhoto:(raw,target)=>result.approvedMvLookPhoto(raw,target,approvals)};
   if(name==='./mv-look-successor-policy'&&reviews)return {...result,selectReviewedMvLookPhoto:(qualified,target)=>result.selectReviewedMvLookPhoto(qualified,target,reviews)};
   return result;
  },out);
  return out;
 }
 return load;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const previous=freeze({candidateId:'synthetic-predecessor',evidenceId:'e'.repeat(64),ratingId:'recRating',memberId:'recMember',workId:'recWork',videoId:'abcdefghijk',sha256:'a'.repeat(64),sourcePageUrl:'https://example.org/named',sourceImageUrl:'https://example.org/previous.jpg',mime:'image/jpeg',byteLength:400000,width:700,height:612,sameLook:true,identityBasis:'source_named',lookBasis:'exact_mv_visual_match',sourceIdentityName:'Synthetic member',identityEvidence:'Named image caption',identitySelector:'#named-image',sourceSnapshotSha256:'b'.repeat(64),sourceName:'Publisher',sourceCredit:'Publisher',lookEvidence:'Exact MV outfit and set match',lookEvidenceUrl:'https://example.org/mv-proof',lookEvidenceSelector:'#mv-frame',lookEvidenceSnapshotSha256:'c'.repeat(64)});
const next=freeze({...previous,candidateId:'synthetic-successor',sha256:'d'.repeat(64),evidenceId:'f'.repeat(64),sourceImageUrl:'https://example.org/next.jpg',width:1600,height:2400});
const third=freeze({...previous,candidateId:'synthetic-third',sha256:'9'.repeat(64),sourceImageUrl:'https://example.org/third.jpg'});
const key=a=>({candidateId:a.candidateId,sha256:a.sha256});
const edge=(a=previous,b=next)=>({ratingId:a.ratingId,memberId:a.memberId,workId:a.workId,videoId:a.videoId,predecessor:key(a),successor:key(b)});
const review=freeze(edge());
const target=freeze({ratingId:previous.ratingId,memberIds:[previous.memberId],workIds:[previous.workId],videoId:previous.videoId,memberExists:true,workExists:true});
const before=freeze({index:1,approval:previous}),after=freeze({index:2,approval:next}),pair=freeze([before,after]);
const load=loader(),policy=load('lib/idol/mv-look-successor-policy.ts'),select=policy.selectReviewedMvLookPhoto,{F}=load('lib/idol/fields.ts');
const raw=a=>({source_kind:'mv_look_photo',candidate_id:a.candidateId,evidence_id:a.evidenceId,member_id:a.memberId,work_id:a.workId,exact_video_id:a.videoId,file_token:'native_photo_'+a.sha256,source_url:a.sourcePageUrl,source_image_url:a.sourceImageUrl,type:a.mime,size:a.byteLength,width:a.width,height:a.height});
const original=freeze({source_kind:'mv_still',file_token:'native_photo_'+'1'.repeat(64),member_id:previous.memberId,work_id:previous.workId,exact_video_id:previous.videoId,name:'recoverable-original.jpg',unknown:{preserve:['all',1]}});
function tables(photos){return {groups:{records:[]},members:{records:[{recordId:previous.memberId,fields:{[F.members.favorite]:8,[F.members.note]:'member note'}}]},works:{records:[{recordId:previous.workId,fields:{[F.works.url]:'https://youtube.com/watch?v='+previous.videoId,[F.works.note]:'work note',[F.works.score]:0,[F.works.stageScore]:7,[F.works.watched]:'已看'}}]},ratings:{records:[{recordId:previous.ratingId,fields:{[F.ratings.members]:[previous.memberId],[F.ratings.works]:[previous.workId],[F.ratings.photo]:photos,[F.ratings.recognition]:'本MV截图 · 具名',[F.ratings.note]:'rating note',[F.ratings.memory]:'rating memory',[F.ratings.score]:0,[F.ratings.stylingScore]:9}}]}};}
const project=(photos,reviews=[review],approvals=[previous,next,third])=>loader({approvals,reviews})('lib/idol/catalog.ts').projectCatalog(tables(photos),'live','captured');

test('default reviewed successor registry is deeply frozen and never authorizes synthetic candidates',()=>{
 assert.ok(Object.isFrozen(policy.reviewedMvLookSuccessors));assert.equal(select(pair,target),null);
 for(const entry of policy.reviewedMvLookSuccessors)for(const value of [entry,entry.predecessor,entry.successor])assert.ok(Object.isFrozen(value));
});
test('every production successor edge binds two separately admitted exact tuples and cannot conflict',()=>{
 const approvals=load('lib/idol/mv-look-policy.ts').approvedMvLookPhotos,ratings=new Set(),candidateIds=new Set();
 for(const entry of policy.reviewedMvLookSuccessors){
  assert.equal(ratings.has(entry.ratingId),false);ratings.add(entry.ratingId);
  assert.notEqual(entry.predecessor.candidateId,entry.successor.candidateId);assert.notEqual(entry.predecessor.sha256,entry.successor.sha256);
  for(const endpoint of [entry.predecessor,entry.successor]){
   assert.match(endpoint.sha256,/^[a-f0-9]{64}$/);assert.equal(candidateIds.has(endpoint.candidateId),false);candidateIds.add(endpoint.candidateId);
   const matches=approvals.filter(a=>a.candidateId===endpoint.candidateId&&a.sha256===endpoint.sha256);assert.equal(matches.length,1);
   for(const field of ['ratingId','memberId','workId','videoId'])assert.equal(matches[0][field],entry[field]);
  }
 }
});
test('zero and single approvals retain the existing decision before or after append',()=>{
 assert.equal(select([],target,[review]),null);
 for(const reviews of [[],[review],[review,review],[review,edge(next,previous)]]){
  assert.equal(select([before],target,reviews),before);assert.equal(select([after],target,reviews),after);
 }
});
test('only one exact reviewed pair selects the successor independently of attachment order',()=>{
 assert.equal(select(pair,target,[review]),after);assert.equal(select([after,before],target,[review]),after);
 for(const [oldIndex,newIndex]of [[1,2],[7,3],[4,19]]){
  const old={index:oldIndex,approval:previous},replacement={index:newIndex,approval:next};
  assert.equal(select([old,replacement],target,[review]),replacement);
 }
});
test('third qualified competitor and duplicate attachments remain ambiguous',()=>{
 const other={index:3,approval:third};
 for(const photos of [[before,after,other],[other,after,before],[before,before],[after,after],[before,{...before,index:4}],[after,{...after,index:4}],[before,after,{...after,index:4}]])assert.equal(select(photos,target,[review]),null);
});
test('each full review tuple field is required and exact',()=>{
 for(const field of ['ratingId','memberId','workId','videoId'])assert.equal(select(pair,target,[{...review,[field]:'wrong'}]),null,field);
 for(const change of [{ratingId:'wrong'},{memberIds:[]},{memberIds:['wrong']},{memberIds:[previous.memberId,'other']},{workIds:[]},{workIds:['wrong']},{workIds:[previous.workId,'other']},{videoId:null},{videoId:'zzzzzzzzzzz'},{memberExists:false},{workExists:false}])assert.equal(select(pair,{...target,...change},[review]),null,JSON.stringify(change));
 for(const field of ['ratingId','memberId','workId','videoId'])assert.equal(select([{...before,approval:{...previous,[field]:'wrong'}},after],target,[review]),null,field);
});
test('both endpoint candidate IDs and full lowercase SHA-256 must match',()=>{
 for(const endpoint of ['predecessor','successor']){
  for(const value of [null,undefined,{}])assert.equal(select(pair,target,[{...review,[endpoint]:value}]),null);
  for(const value of ['', 'wrong', review[endpoint].candidateId+'-extra'])assert.equal(select(pair,target,[{...review,[endpoint]:{...review[endpoint],candidateId:value}}]),null);
  for(const value of ['', '0'.repeat(64),review[endpoint].sha256.slice(0,12),review[endpoint].sha256.toUpperCase()])assert.equal(select(pair,target,[{...review,[endpoint]:{...review[endpoint],sha256:value}}]),null);
 }
});
test('same candidate, same original hash, invalid indexes and duplicate indexes are rejected',()=>{
 assert.equal(select(pair,target,[{...review,successor:review.predecessor}]),null);
 const alias={...next,sha256:previous.sha256};assert.equal(select([before,{index:2,approval:alias}],target,[edge(previous,alias)]),null);
 const sameId={...next,candidateId:previous.candidateId};assert.equal(select([before,{index:2,approval:sameId}],target,[edge(previous,sameId)]),null);
 for(const index of [-1,NaN,Infinity,1.5,1])assert.equal(select([before,{...after,index}],target,[review]),null);
});
test('duplicate, reverse, fork, merge and chain reviews fail closed',()=>{
 const conflicts=[review,edge(next,previous),edge(previous,third),edge(third,next),edge(next,third),edge(third,previous)];
 for(const conflict of conflicts)assert.equal(select(pair,target,[review,conflict]),null);
 assert.equal(select(pair,target,[review,edge(next,third),edge(third,previous)]),null);
});
test('wrong-tuple conflict cannot hide behind another rating ID',()=>{
 for(const field of ['ratingId','memberId','workId','videoId'])assert.equal(select(pair,target,[review,{...review,[field]:'other'}]),null);
 const unrelated={...previous,candidateId:'another-old',sha256:'2'.repeat(64)},unrelatedNext={...next,candidateId:'another-new',sha256:'3'.repeat(64)};
 assert.equal(select(pair,target,[review,edge(unrelated,unrelatedNext)]),null);
 assert.equal(select(pair,target,[review,{...edge(unrelated,unrelatedNext),ratingId:'another-rating',memberId:'another-member',workId:'another-work',videoId:'zzzzzzzzzzz'}]),after);
});
test('selector does not mutate frozen inputs, review edges, keys or approval records',()=>{
 const reviews=freeze([review]),preimage=JSON.stringify({pair,target,reviews});select(pair,target,reviews);
 assert.equal(JSON.stringify({pair,target,reviews}),preimage);
});
test('pre-upload uses old look, post-append uses new look and keeps original MV at index zero',()=>{
 const l=loader({approvals:[previous,next],reviews:[review]}),{projectCatalog}=l('lib/idol/catalog.ts');
 const pre=tables([original,raw(previous)]),post=tables([original,raw(previous),raw(next)]),preimage=JSON.stringify(post);
 const oldView=projectCatalog(pre,'live','captured'),newView=projectCatalog(freeze(post),'live','captured');
 assert.equal(oldView.ratings[0].photo.index,1);assert.equal(newView.ratings[0].photo.index,2);
 assert.equal(newView.ratings[0].photo.sourceKind,'mv_look_photo');assert.equal(newView.ratings[0].referencePhoto.index,0);
 assert.equal(newView.ratings[0].referencePhoto.sourceKind,undefined); // Existing index-zero reference shape stays unchanged.
 for(const field of ['score','stylingScore','note','memory','recognition','source','verification'])assert.equal(newView.ratings[0][field],oldView.ratings[0][field]);
 assert.deepEqual(plain(newView.works),plain(oldView.works));assert.deepEqual(plain(newView.members),plain(oldView.members));
 assert.equal(JSON.stringify(post),preimage);assert.deepEqual(plain(post.ratings.records[0].fields[F.ratings.photo]),[plain(original),raw(previous),raw(next)]);
});
test('catalog uses successor actual index without sorting or moving the original reference',()=>{
 for(const [attachments,index]of [[[original,raw(previous),raw(next)],2],[[original,raw(next),raw(previous)],1]]){
  const c=project(attachments);assert.equal(c.ratings[0].photo.index,index);assert.equal(c.ratings[0].referencePhoto.index,0);
 }
});
test('without an exact review, two admitted photos retain exact legacy fallback',()=>{
 const base=project([original]).ratings[0];
 for(const reviews of [[],[{...review,videoId:'wrong'}],[review,review],[review,edge(next,previous)]])assert.deepEqual(plain(project([original,raw(previous),raw(next)],reviews).ratings[0]),plain(base));
});
test('client/raw timestamp, priority, successor and preference claims never resolve ambiguity',()=>{
 const claimed={...raw(next),priority:999999,preferred:true,supersedes:previous.candidateId,created_at:'2999-01-01T00:00:00Z',reviewed_successor:review,personalPhotoEligible:true};
 assert.deepEqual(plain(project([original,raw(previous),claimed],[]).ratings[0]),plain(project([original],[]).ratings[0]));
});
test('third fully approved photo keeps catalog fallback even with an exact reviewed pair',()=>{
 const base=project([original]).ratings[0];
 assert.deepEqual(plain(project([original,raw(previous),raw(next),raw(third)]).ratings[0]),plain(base));
});
test('a successor review cannot admit an unlisted candidate or altered immutable attachment',()=>{
 const notAdmitted=project([original,raw(previous),raw(next)],[review],[previous]);assert.equal(notAdmitted.ratings[0].photo.index,1);
 for(const field of Object.keys(raw(next))){
  const photos=[original,raw(previous),{...raw(next),[field]:'tampered'}],c=project(photos);
  assert.equal(c.ratings[0].photo.index,1,field);assert.equal(c.ratings[0].referencePhoto.index,0,field);
 }
});
test('full row binding changes still prevent approval despite the successor review',()=>{
 const l=loader({approvals:[previous,next],reviews:[review]}),{projectCatalog}=l('lib/idol/catalog.ts');
 for(const mutate of [t=>t.ratings.records[0].recordId='wrong',t=>t.ratings.records[0].fields[F.ratings.members]=['wrong'],t=>t.ratings.records[0].fields[F.ratings.works]=['wrong'],t=>t.works.records[0].fields[F.works.url]='https://youtu.be/zzzzzzzzzzz',t=>t.members.records.push(t.members.records[0]),t=>t.works.records.push(t.works.records[0])]){
  const t=tables([original,raw(previous),raw(next)]);mutate(t);assert.equal(projectCatalog(t,'live','captured').ratings[0].photo.index,0);
 }
});
test('browser/member projections receive only selected index and stable original, never review IDs/hashes',()=>{
 const l=loader({approvals:[previous,next],reviews:[review]}),c=l('lib/idol/catalog.ts').projectCatalog(tables([original,raw(previous),raw(next)]),'live','captured');
 const browser=l('lib/idol/browser-catalog.ts').projectBrowserCatalog(c),member=l('lib/idol/member-works.ts').memberWorks(browser,previous.memberId)[0];
 assert.equal(browser.ratings[0].personalPhotoEligible,true);assert.equal(member.photo.index,2);assert.equal(member.referencePhoto.index,0);
 for(const value of [previous.candidateId,next.candidateId,previous.sha256,next.sha256,previous.evidenceId,next.evidenceId,previous.sourceImageUrl,next.sourceImageUrl])assert.equal(JSON.stringify(browser).includes(value),false,value);
});
test('successor does not inherit predecessor-specific presentation cropping',()=>{
 const focus=load('lib/idol/photo-display-focus.ts').photoDisplayFocus;
 const old=load('lib/idol/mv-look-policy.ts').approvedMvLookPhotos.find(a=>focus(a.candidateId,a.sha256));assert.ok(old);
 const replacement={...old,candidateId:'synthetic-focus-successor',sha256:'d'.repeat(64),sourceImageUrl:'https://example.org/full-original.jpg',width:1600,height:2400};
 const l=loader({approvals:[old,replacement],reviews:[edge(old,replacement)]}),{projectCatalog}=l('lib/idol/catalog.ts');
 const t=tables([{...original,member_id:old.memberId,work_id:old.workId,exact_video_id:old.videoId},raw(old)]);
 t.members.records[0].recordId=old.memberId;t.works.records[0].recordId=old.workId;t.works.records[0].fields[F.works.url]='https://youtu.be/'+old.videoId;
 t.ratings.records[0].recordId=old.ratingId;t.ratings.records[0].fields[F.ratings.members]=[old.memberId];t.ratings.records[0].fields[F.ratings.works]=[old.workId];
 const before=projectCatalog(t,'live','captured');assert.ok(before.ratings[0].photo.displayFocus);
 t.ratings.records[0].fields[F.ratings.photo].push(raw(replacement));
 const after=projectCatalog(t,'live','captured');assert.equal(after.ratings[0].photo.index,2);assert.equal(after.ratings[0].photo.displayFocus,undefined);assert.equal(after.ratings[0].referencePhoto.index,0);
 assert.ok(focus(old.candidateId,old.sha256));assert.deepEqual(plain(t.ratings.records[0].fields[F.ratings.photo][1]),raw(old));
});
test('helper remains projection-only; no import, storage, raw-field or browser-interface changes',()=>{
 const helper=fs.readFileSync('lib/idol/mv-look-successor-policy.ts','utf8'),catalog=fs.readFileSync('lib/idol/catalog.ts','utf8');
 assert.doesNotMatch(helper,/\bfetch\(|\bBUCKET\b|\.put\(|Date\.now|sort\(/);
 assert.match(catalog,/approvedMvLookPhoto\(attachment,target\)/);assert.match(catalog,/selectReviewedMvLookPhoto\(qualified,target\)/);
 assert.match(catalog,/photoDisplayFocus\(approval.candidateId,approval.sha256\)/);
});
