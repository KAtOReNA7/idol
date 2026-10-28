const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {mvMemberAbsence}=load('lib/idol/mv-member-appearance.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const credits=require('../data/public-work-credits.json');
const recognition=require('../data/public-work-recognition.json');
const manifest=require('../data/mv-public-media.json');
const absence=require('../data/mv-member-appearance.json');
const base='../../../docs/codex/evidence/20261028-v200/people/';
const deltas=[...require(base+'public-work-credits.delta.json').records,...require(base+'public-work-credits.batch2.delta.json').records];
const references=[...require(base+'public-work-recognition.delta.json').records,...require(base+'public-work-recognition.batch2.delta.json').records];
const adoption=require(base+'adoption.json');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

test('v200 appends eleven scoped public references without changing eighty prior objects or original media/absence rules',()=>{
 assert.equal(hash(credits.records.slice(0,80)),'20a26981d5124f4d27486df8fb7f121ba3b2d4fc37799b58fec7c9fcdde4b8b5');
 assert.equal(hash(recognition.records.slice(0,80)),'51402f13448b26adf5b7aca72aeefaa89fa48286f8929e6551a541765224f6f1');
 assert.equal(hash(manifest),'db09207d9faded33701c6bc1b6138ffcfb670084fdbf94cf778dae3436ed2e03');
 assert.equal(hash(absence.entries),'ebc28ada6fd33e793d1454fb567a0ea2e456a629c0545a9c3b51aba33b70b459');
 assert.deepEqual(credits.records.slice(80,91),deltas);assert.deepEqual(recognition.records.slice(80,91),references);
 assert.equal(new Set(credits.records.slice(0,91).map(r=>r.workId)).size,91);
 assert.equal(recognition.records.slice(0,91).reduce((n,r)=>n+r.portraits.length,0),488);
 assert.equal(new Set(recognition.records.slice(0,91).flatMap(r=>r.portraits.map(p=>p.src))).size,229);
 assert.equal(new Set([...credits.records.slice(0,91).map(r=>r.workId),...absence.entries.map(r=>r.workId)]).size,96);
 assert.equal(adoption.remainingPersonWorks,35);assert.equal(adoption.preservation.privateWrites,0);
 assert.equal(adoption.preservation.privateRelationsAdded,0);assert.equal(adoption.preservation.newImageFiles,0);
});

for(const expected of deltas)test(`public-only exact tuple and saved zero protection: ${expected.workId}`,()=>{
 const work={id:expected.workId,url:`https://www.youtube.com/watch?v=${expected.videoId}`,groupIds:[expected.groupId],ratingIds:[],score:0,stageScore:8,note:'synthetic private note',watched:true};
 assert.deepEqual(publicCreditForWork(work),expected);assert.equal(mvMemberAbsence(work),null);
 for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'},{placeholder:true}]){
  assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
 }
 const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),expected.memberIds);
 assert.equal(new Set(photos.map(p=>p.photoSetId)).size,1);
 for(const photo of photos){
  assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不证明本视频出镜/);
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);
  assert.ok(photo.width>0&&photo.height>0);const c=photo.sourceCrop;
  assert.ok(c&&c.x>=0&&c.y>=0&&c.x+c.width<=photo.width&&c.y+c.height<=photo.height);
  assert.ok(Math.abs(c.width/c.height-0.75)<0.001);
  for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);
 }
 const data={works:[work],members:expected.memberIds.map(id=>({id,stageName:id,groupIds:[expected.groupId]})),ratings:[]},before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,expected.memberIds.length);
 assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
 for(const mid of expected.memberIds){
  assert.deepEqual(memberWorks(data,mid),[]);assert.equal(publicCreditsForMember(data,mid).length,1);
  const personal={...data,ratings:[{id:'saved',workIds:[work.id],memberIds:[mid],score:0,stylingScore:9}]},saved=structuredClone(personal);
  assert.equal(memberWorks(personal,mid)[0].performance,0);assert.deepEqual(publicCreditsForMember(personal,mid),[]);assert.deepEqual(personal,saved);
 }
 assert.deepEqual(data,before);assert.equal(work.score,0);
});

test('limited writer, release, packaging and recording scopes cannot silently become exhaustive video casts',()=>{
 const by=id=>deltas.find(r=>r.workId===id);
 for(const id of ['rec28ldfRTrN8c','rec28ldfRTrMwG','rec28ldfRTrMgm']){assert.equal(by(id).kind,'named_artist_credit');assert.equal(by(id).memberIds.length,1);assert.match(by(id).label,/作词/);}
 assert.equal(by('recvxIYG1FSCws').memberIds.length,1);assert.match(by('recvxIYG1FSCws').note,/只.*SORA.*不推定其他四人/);
 assert.equal(by('rec28ldfRTrMcf').label,'公开录音参与署名');assert.match(by('rec28ldfRTrMcf').note,/Performer/);
 assert.match(by('recvxyOz5XueI9').label,/个人盘/);assert.match(by('recvxyOz5XueI9').note,/不据此判定CHUU是否参与录音/);assert.equal(by('recvxyOz5XueI9').memberIds.length,11);
 for(const id of ['rec28ldfRTrIZT','rec28ldfRTrHhL','rec28ldfRTrNO2','rec28ldfRTrMMV','rec28ldfRTrJVj'])assert.equal(by(id).kind,'documented_project_lineup');
 assert.match(by('rec28ldfRTrMMV').note,/不把专题中的《Who is she》MV当作本视频出镜证据/);
 assert.match(by('rec28ldfRTrJVj').note,/11月17日.*Performance MV/);
 assert.equal(by('rec28ldfRTrJVj').videoId,'1yMzV0NdB9g');
});
