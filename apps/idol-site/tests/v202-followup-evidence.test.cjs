const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {stageSupplementForWork}=load('lib/idol/supplements.ts');
const {stageForWork}=load('lib/idol/stage.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const {beforeV202Generic,beforeV202Supplements,beforeMadeinWorkPhotos,receipt}=require('./helpers/v202-followup-evidence.cjs');
const generic=require('../data/public-group-recognition.json'),credits=require('../data/public-work-credits.json'),recognition=require('../data/public-work-recognition.json'),supplements=require('../data/stages/supplements.json');
const hash=value=>createHash('sha256').update(value).digest('hex');
const bytes=value=>JSON.stringify(value,null,2)+'\n';
const group=generic.groups.find(g=>g.groupName==='HITGS');
const work={id:'recvxIZy3525BF',groupIds:[group.groupId],url:'https://www.youtube.com/watch?v=IM-N8trjDzk',song:'Gulliver!',score:0,stageScore:0,ratingIds:[],note:'synthetic private note',watched:true};

test('Gulliver interview adds exactly four named recording references and never infers VV or a complete cast',()=>{
 const credit=publicCreditForWork(work);
 assert.deepEqual(credit.memberIds,group.portraits.filter(p=>['Seojin','Seohee','Hyerin','Iyoo'].includes(p.name)).sort((a,b)=>['Seojin','Seohee','Hyerin','Iyoo'].indexOf(a.name)-['Seojin','Seohee','Hyerin','Iyoo'].indexOf(b.name)).map(p=>p.memberId));
 assert.equal(credit.kind,'reported_participation');assert.match(credit.note,/不推定VV的录音参与/);assert.match(credit.note,/不把录音资料当完整MV出镜名单/);
 assert.equal(credit.sourceUrl,'https://kanstarpress.com/?p=204530&page=7');assert.ok(credit.supportingUrls.includes('https://kanstarpress.com/?p=204530&page=8'));
 assert.equal(publicWorkRecognition(work).length,4);assert.equal(publicGroupRecognitionForWork(work),null);
 const data={works:[work],ratings:[],members:group.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[group.groupId],formerGroupIds:[]}))},before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,4);assert.doesNotMatch(html,/synthetic private note|<input|<form|cast-scores/);
 for(const m of data.members){assert.deepEqual(memberWorks(data,m.id),[]);assert.equal(publicCreditsForMember(data,m.id).length,m.stageName==='VV'?0:1);}
 const saved={...data,ratings:[{id:'saved-zero',workIds:[work.id],memberIds:[credit.memberIds[0]],score:0,memory:'saved private'}]};
 assert.deepEqual(publicCreditsForMember(saved,credit.memberIds[0]),[]);assert.equal(memberWorks(saved,credit.memberIds[0])[0].performance,0);
 assert.deepEqual(data,before);
 for(const patch of [{id:'wrong'},{groupIds:['wrong']},{url:'https://www.youtube.com/watch?v=wrong012345'},{placeholder:true}]){assert.equal(publicCreditForWork({...work,...patch}),null);assert.deepEqual(publicWorkRecognition({...work,...patch}),[]);}
});

test('same-collection evidence retains all five original images, names, crops and the unverified-work boundary',()=>{
 assert.deepEqual(group.portraits,receipt.genericGroupChange.expectedBefore.portraits);
 assert.equal(group.collectionConsistency,'documented_named_press_collection');assert.equal(group.collectionSourceUrl,'https://kanstarpress.com/?p=204530');
 assert.match(group.collectionNote,/具体拍摄日期未确认/);assert.match(group.collectionNote,/不代表本作参与/);
 const other={...work,id:'recvxIZy35rUeY',url:'https://www.youtube.com/watch?v=L9VNIOcfSOU'};
 assert.equal(publicGroupRecognitionForWork(other).portraits.length,5);
 for(const p of group.portraits)assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);
});

test('only the bounded append, HITGS context and two policy notes differ from the complete v202 data',()=>{
 for(const [name,data] of [['public-work-credits.json',credits],['public-work-recognition.json',recognition]]){
  assert.equal(data.records.length,105);
  const prior=beforeMadeinWorkPhotos(name,data);
  assert.equal(hash(bytes({...prior,records:prior.records.slice(0,104)})),receipt.beforeFileSha256['apps/idol-site/data/'+name]);
 }
 assert.equal(hash(bytes(beforeV202Generic(generic))),receipt.beforeFileSha256['apps/idol-site/data/public-group-recognition.json']);
 assert.equal(hash(bytes(beforeV202Supplements(supplements))),receipt.beforeFileSha256['apps/idol-site/data/stages/supplements.json']);
 const bad=structuredClone(generic);bad.groups.find(g=>g.groupName==='HITGS').portraits[0].name='wrong';assert.throws(()=>beforeV202Generic(bad),/complete reviewed HITGS/);
 const altered=structuredClone(supplements);altered.works.recvxyH5pzoMAf.searchReview.publicNote.summary='unreviewed';assert.throws(()=>beforeV202Supplements(altered),/complete reviewed current-policy/);
});

test('updated broadcast notes allow repost research links while preserving the full-song and rating boundary',()=>{
 for(const id of ['recvxyH5pzoMAf']){
  const row=stageSupplementForWork(id);
  assert.match(row.researchNote.summary,/完整日语原版区间/);assert.match(row.researchNote.summary,/已采用/);
  assert.doesNotMatch(row.researchNote.summary,/完整官方单曲视频/);
  assert.equal(stageForWork(id).platform,'bilibili');
 }
 const note=stageSupplementForWork('recvxyH5pzoMAf').researchNote;
 assert.ok(note.sources.some(s=>s.url==='https://www.bilibili.com/video/BV1bo4y1x7LV/?p=1&cid=1115512650'));
 assert.ok(!(stageSupplementForWork('recvxyH5pzoMAf').watchLeads??[]).some(s=>s.platform==='bilibili'));
});
