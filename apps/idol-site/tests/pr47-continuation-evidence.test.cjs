const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {beforeGroupAdvanceTimelineBytes}=require('./helpers/group-advance-evidence.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {stageSupplementForWork,validStageWatchLead}=load('lib/idol/supplements.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const base=require('../../../docs/codex/evidence/20261029-pr47-continuation/baseline.json');
const credits=require('../data/public-work-credits.json'),portraits=require('../data/public-work-recognition.json');
const generic=require('../data/public-group-recognition.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const work={id:'recvxyH5pzFAPL',groupIds:['recvxyEBDZllCe'],url:'https://www.youtube.com/watch?v=os4driLeAiU',song:'DOREMI',ratingIds:[],stageScore:0,score:0,note:'synthetic private note',watched:true};

test('continuation appends bounded evidence while preserving the prior 103 references and frozen sources',()=>{
 for(const [name,data] of [['public-work-credits.json',credits],['public-work-recognition.json',portraits]]){
  assert.equal(hash(JSON.stringify({...data,records:data.records.slice(0,103)},null,2)+'\n'),base.fileHashes['apps/idol-site/data/'+name]);
 }
 for(const [name,digest] of Object.entries(base.fileHashes)){
  if(['apps/idol-site/data/public-work-credits.json','apps/idol-site/data/public-work-recognition.json','apps/idol-site/data/stages/supplements.json'].includes(name))continue;
  const bytes=fs.readFileSync(path.resolve(__dirname,'../../..',name));
  const historical=name==='apps/idol-site/data/timeline-reported-records.json'
   ?beforeGroupAdvanceTimelineBytes(JSON.parse(bytes.toString('utf8'))):bytes;
  assert.equal(hash(historical),digest,name);
 }
});

test('DOREMI release subjects remain separate from recorded roles, exact-video cast and private rating relations',()=>{
 const credit=publicCreditForWork(work),group=generic.groups.find(g=>g.groupId===work.groupIds[0]);
 const data={works:[work],ratings:[],members:group.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[group.groupId],formerGroupIds:[]}))};
 const before=structuredClone(data);
 assert.equal(credit.kind,'documented_project_lineup');assert.match(credit.note,/不代表本曲逐人录音或本 MV 出镜已核实/);
 assert.deepEqual(credit.memberIds,group.portraits.map(p=>p.memberId));assert.equal(publicGroupRecognitionForWork(work),null);
 const rendered=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((rendered.match(/class="mv-identity-frame/g)||[]).length,6);
 assert.match(rendered,/本发行概念照人物参考/);assert.doesNotMatch(rendered,/synthetic private note|<input|<form|cast-scores/);
 for(const image of publicWorkRecognition(work)){
  const prior=group.portraits.find(p=>p.memberId===image.memberId);
  for(const key of ['src','sha256','width','height','sourceCrop','photoSetId','sourceUrl'])assert.deepEqual(image[key],prior[key]);
 }
 for(const member of data.members){
  assert.deepEqual(memberWorks(data,member.id),[]);assert.equal(publicCreditsForMember(data,member.id).length,1);
  const saved={...data,ratings:[{id:'saved-zero',workIds:[work.id],memberIds:[member.id],score:0,stylingScore:8,memory:'private synthetic'}]};
  assert.deepEqual(publicCreditsForMember(saved,member.id),[]);assert.equal(memberWorks(saved,member.id)[0].performance,0);
 }
 for(const mismatch of [{id:'wrong'},{groupIds:['wrong']},{url:'https://www.youtube.com/watch?v=wrong012345'},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
 }
 assert.deepEqual(data,before);
});

test('izna costume entry stays unconfirmed and view-only, without a fabricated complete clip',()=>{
 const row=stageSupplementForWork('rec28ldfRTrNsK');
 const lead=row.watchLeads.find(x=>x.sourceId==='Qfez0Db9Iqc');
 assert.ok(validStageWatchLead(lead));assert.equal(lead.completeness,'unconfirmed');assert.equal(lead.scorePolicy,'view_only');
 assert.equal(lead.performerScope,'unconfirmed');assert.equal(lead.leadTimeSeconds,211);assert.equal(lead.scoreBinding,undefined);
 assert.equal(new URL(lead.url).searchParams.get('t'),'211');
 assert.equal(new URL(lead.url).searchParams.has('end'),false);assert.equal(lead.durationSeconds,undefined);
 assert.match(lead.reason,/待复核的观看窗口，并非歌曲净时长/);
 assert.match(lead.leadTimeEvidence.note,/人工观看.*不是已验证的单曲章节/);
 assert.equal(validStageWatchLead({...lead,url:lead.url+'&end=450'}),false);
 assert.deepEqual(row.alternatives.map(x=>x.sourceId),['ctfS0Rcq-gs']);
 assert.equal(row.alternatives[0].version.match,'different');
});

test('broadcast records become reviewed source notes, never playable or score-bearing stages',()=>{
 for(const [id,domain] of [['rec28ldfRTrOnV','www.tbs.co.jp'],['recvxyH5pzoMAf','www.tv-tokyo.co.jp']]){
  const row=stageSupplementForWork(id);
  assert.ok(row.researchNote);assert.match(row.researchNote.summary,/尚未取得可核验的完整官方单曲视频/);
  assert.equal(row.researchNote.sources.length,1);assert.equal(new URL(row.researchNote.sources[0].url).hostname,domain);
  assert.equal(row.searchReview.outcome,'verification_limited');assert.notEqual(row.searchReview.reviewComplete,true);
  assert.ok(!(row.watchLeads??[]).some(x=>new URL(x.url).hostname===domain));
  assert.ok(!row.alternatives.some(x=>new URL(x.url).hostname===domain));
 }
});
