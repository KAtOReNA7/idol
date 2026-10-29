const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits,MemberPublicCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const source=require('../data/public-group-recognition.json');
const credits=require('../data/public-work-credits.json');
const recognition=require('../data/public-work-recognition.json');
const base='../../../docs/codex/evidence/20261028-post-v200/people/generic-reference/';
const baseline=require(base+'baseline.json');
const adoption=require(base+'adoption.json');
const fileHash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const workFor=row=>({id:row.workId,url:`https://www.youtube.com/watch?v=${row.videoId}`,groupIds:[row.groupId],ratingIds:[],score:0,stageScore:0,note:'synthetic private note',watched:true});
const dataFor=(work,group)=>({works:[work],members:group.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[group.groupId],formerGroupIds:[]})),ratings:[]});

test('generic references preserve existing public evidence, original bindings and private snapshot bytes',()=>{
 for(const [name,sha] of Object.entries(baseline.protectedFiles)){
  // These two append-only collections gained a source-scoped release reference.
  // Reconstruct the entire v201 file, including its metadata, to keep its hash guard.
  const collection=name==='public-work-credits.json'?credits:name==='public-work-recognition.json'?recognition:null;
  const hash=collection?createHash('sha256').update(JSON.stringify({...collection,records:collection.records.slice(0,102)},null,2)+'\n').digest('hex'):fileHash(path.join(__dirname,'../data',name));
  assert.equal(hash,sha,name);
 }
 assert.equal(credits.records.slice(0,102).length,102);assert.equal(recognition.records.slice(0,102).reduce((n,r)=>n+r.portraits.length,0),527);
 assert.equal(source.works.length,24);assert.equal(source.groups.length,11);
 assert.deepEqual(source.works.map(w=>w.workId).sort(),baseline.unverifiedWorkIds.slice().sort());
 assert.equal(new Set(source.works.map(w=>w.workId)).size,24);
 assert.equal(adoption.genericReferenceSlots,119);assert.equal(adoption.factEvidenceUnresolvedWorks,24);
 assert.equal(adoption.newImageFiles,0);assert.equal(adoption.privateRelationsAdded,0);assert.equal(adoption.privateWrites,0);
 for(const credit of credits.records)assert.equal(publicGroupRecognitionForWork(workFor(credit)),null);
});

test('all generic portraits retain full existing originals and consistent bounded3:4 display crops',()=>{
 const paths=new Set();
 for(const group of source.groups){
  assert.equal(new Set(group.portraits.map(p=>p.memberId)).size,group.portraits.length);
  assert.equal(group.scope,'group_generic_recognition');assert.equal(group.participationStatus,'unverified_for_work');
  for(const p of group.portraits){
   assert.equal(fileHash(path.join(__dirname,'../public',p.src)),p.sha256);paths.add(p.src);
   assert.equal(p.workAssociation,'recognition_reference');assert.equal(p.participationStatus,'unverified_for_work');
   assert.match(p.label,/团体通用认人参考/);assert.match(p.sourceUrl,/^https:\/\//);
   const c=p.sourceCrop;assert.equal(c.width/c.height,0.75);assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=p.width&&c.y+c.height<=p.height);
   for(const field of ['workId','videoId','ratingId','ratingIds','score','stylingScore','watched','memory'])assert.equal(Object.hasOwn(p,field),false,field);
  }
 }
 assert.equal(paths.size,63);
});

// MADEIN now has a limited release-cover reference, separately tested in group-followup.
// Keep its historical generic data and test every still-active generic fallback.
for(const row of source.works.filter(r=>r.workId!=='rec28ldfRTrPi9'))test(`read-only generic reference is exact-tuple scoped without participation claims: ${row.workId}`,()=>{
 const work=workFor(row),group=publicGroupRecognitionForWork(work);
 assert.equal(group.groupId,row.groupId);assert.equal(publicCreditForWork(work),null);assert.deepEqual(publicWorkRecognition(work),[]);
 for(const mismatch of [{id:'wrong-work'},{groupIds:['wrong-group']},{url:'https://www.youtube.com/watch?v=other012345'},{placeholder:{reason:'placeholder'}}])assert.equal(publicGroupRecognitionForWork({...work,...mismatch}),null);
 const data=dataFor(work,group),before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.match(html,/团体通用认人参考/);assert.match(html,/未核实本作参与/);assert.match(html,/不是本作品的出镜、演唱或创作名单/);assert.match(html,/这里不提供成员评分/);
 assert.match(html,/data-participation-status="unverified_for_work"/);
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,group.portraits.length);
 assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note|data-credit-work=/);
 for(const p of group.portraits){
  assert.deepEqual(memberWorks(data,p.memberId),[]);assert.deepEqual(publicCreditsForMember(data,p.memberId),[]);
  assert.equal(renderToStaticMarkup(React.createElement(MemberPublicCredits,{memberId:p.memberId,data,onWork(){}})), '');
  const saved={...data,ratings:[{id:'saved-zero',memberIds:[p.memberId],workIds:[work.id],score:0,stylingScore:9,memory:'saved private memory'}]},savedBefore=structuredClone(saved);
  assert.equal(memberWorks(saved,p.memberId)[0].performance,0);assert.deepEqual(publicCreditsForMember(saved,p.memberId),[]);
  renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:saved,onMember(){}}));assert.deepEqual(saved,savedBefore);
 }
 assert.deepEqual(data,before);
 const wrong={...data,members:data.members.map(m=>({...m,groupIds:['wrong-group']}))};
 assert.equal(renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:wrong,onMember(){}})), '');
 const former={...data,members:data.members.map(m=>({...m,groupIds:[],formerGroupIds:[row.groupId]}))};
 assert.match(renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:former,onMember(){}})),/团体通用认人参考/);
});

test('generic presentation does not depend on an MV appearance decision or alter its policy',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../lib/idol/public-group-recognition.ts'),'utf8');
 const component=fs.readFileSync(path.join(__dirname,'../components/public-group-recognition.tsx'),'utf8');
 assert.doesNotMatch(code+component,/mvMemberAbsence|memberScoringPolicy|ratingIds|setRating|saveRating/);
 const madein=source.groups.find(g=>g.groupName==='MADEIN');assert.match(madein.collectionNote,/569×854/);
 const wooah=source.groups.find(g=>g.groupName==='WOOAH');assert.match(wooah.collectionNote,/同套校服造型/);assert.equal(wooah.collectionConsistency,'documented_same_video_look');
 const hitgs=source.groups.find(g=>g.groupName==='HITGS');assert.match(hitgs.collectionNote,/未独立证实全部照片为同次拍摄/);
});
