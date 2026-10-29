const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits,MemberPublicCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const source=require('../data/public-group-recognition.json');
const credits=require('../data/public-work-credits.json'),recognition=require('../data/public-work-recognition.json');
const baseline=require('../../../docs/codex/evidence/20261029-group-followup/application-baseline.json');
const {beforeV202Generic}=require('./helpers/v202-followup-evidence.cjs');
const group=source.groups.find(g=>g.groupName==='MADEIN');
const mids=['rec28ldbniBgam','rec28ldbniBghr','rec28ldbniBgCI','rec28ldbniBgJR'];
const work={id:'rec28ldfRTrPi9',groupIds:['rec28ldfRTiCzI'],url:'https://www.youtube.com/watch?v=aer_X9NmhTc',song:'PUNG!',ratingIds:[],score:0,stageScore:0,note:'synthetic private note',watched:true};
const data={works:[work],ratings:[],members:group.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[group.groupId],formerGroupIds:[]}))};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('new release-cover reference preserves v201 files, generic archive, original media and all source bindings',()=>{
 for(const [collection,digest] of [[credits,baseline.originalCreditFileSha256],[recognition,baseline.originalRecognitionFileSha256]])
  assert.equal(hash(JSON.stringify({...collection,records:collection.records.slice(0,102)},null,2)+'\n'),digest);
 for(const [name,digest] of Object.entries(baseline.protectedFiles))assert.equal(hash(name==='public-group-recognition.json'?JSON.stringify(beforeV202Generic(source),null,2)+'\n':fs.readFileSync(path.join(__dirname,'../data',name))),digest,name);
 assert.equal(credits.records.length,105);assert.equal(recognition.records.length,105);
 assert.equal(recognition.records.reduce((n,r)=>n+r.portraits.length,0),541);
 const active=source.works.filter(w=>publicGroupRecognitionForWork({id:w.workId,groupIds:[w.groupId],url:`https://www.youtube.com/watch?v=${w.videoId}`}));
 assert.equal(source.works.length,24);assert.equal(active.length,21);
 assert.equal(active.reduce((n,w)=>n+source.groups.find(g=>g.groupId===w.groupId).portraits.length,0),102);
 for(const p of publicWorkRecognition(work)){
  const original=group.portraits.find(q=>q.memberId===p.memberId);
  for(const key of ['src','sha256','width','height','sourceCrop','photoSetId','sourceUrl'])assert.deepEqual(p[key],original[key]);
  assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);
 }
});

test('PUNG release-cover scope names only four documented editions, with no exact-MV, audio or private relationship inference',()=>{
 const before=structuredClone(data),credit=publicCreditForWork(work);
 assert.equal(credit.kind,'documented_project_lineup');assert.deepEqual(credit.memberIds,mids);
 assert.equal(credit.sourceUrl,'https://www.cdjapan.co.jp/product/NEOIMP-24272');
 assert.match(credit.note,/不等同本曲逐人录音或本MV出镜确认/);assert.match(credit.note,/569×854/);
 assert.equal(publicGroupRecognitionForWork(work),null);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.match(html,/公开本发行封套参与参考/);assert.match(html,/不代表已核实其在本视频出镜/);
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,4);
 assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note|GAEUN|SUHYE|YESEO/);
 for(const m of data.members){
  assert.deepEqual(memberWorks(data,m.id),[]);
  assert.equal(publicCreditsForMember(data,m.id).length,mids.includes(m.id)?1:0);
  const saved={...data,ratings:[{id:'saved-zero',memberIds:[m.id],workIds:[work.id],score:0,stylingScore:9,memory:'synthetic saved memory'}]},prior=structuredClone(saved);
  assert.deepEqual(publicCreditsForMember(saved,m.id),[]);
  assert.equal(memberWorks(saved,m.id)[0].performance,0);
  assert.equal(renderToStaticMarkup(React.createElement(MemberPublicCredits,{memberId:m.id,data:saved,onWork(){}})),'');
  renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:saved,onMember(){}}));assert.deepEqual(saved,prior);
 }
 for(const mismatch of [{id:'wrong'},{groupIds:['wrong']},{url:'https://www.youtube.com/watch?v=other012345'},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
 }
 assert.deepEqual(data,before);
});
