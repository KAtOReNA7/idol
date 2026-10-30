const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {stageForWork,stageScoreIsBound}=load('lib/idol/stage.ts');
const {stageSourceKey,stageWatchUrl,stageEmbedUrl}=load('lib/idol/stage-source.ts');
const {stageSupplementForWork}=load('lib/idol/supplements.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const {beforePassword,receipt}=require('./helpers/password-formal-baseline.cjs');
const {beforeStayc,stayc}=require('./helpers/password-formal-baseline.cjs');
const dir='../../../docs/codex/evidence/20261029-pr47-v202-followup/';
const photos=require(dir+'madein-photo-adoption.json'),human=require(dir+'password-user-confirmation.json');
const generic=require('../data/public-group-recognition.json');
const hash=x=>createHash('sha256').update(x).digest('hex');

test('STAYC binds the confirmed Japanese song interval without changing the full-part or Password identity',()=>{
 const all=require('../data/stage-videos.json'),s=stageForWork(stayc.workId),key='bilibili:BV1bo4y1x7LV:cid:1115512650:p:1@1085-1273';
 assert.equal(stageSourceKey(s),key);assert.ok(stageScoreIsBound(s));assert.equal(stageEmbedUrl(s),null);
 assert.equal(s.clip.sourceDurationSeconds,1469);assert.equal(s.clip.endSeconds-s.clip.startSeconds,188);
 assert.equal(s.platform,'bilibili');assert.equal(s.selection.occasion,'music_program');assert.equal(s.sourceClass,'reupload');
 assert.match(s.verificationNote,/需手动定位/);assert.match(s.verificationNote,/完整206条保存日志/);
 assert.equal(Object.keys(beforeStayc('stageVideos',all)).length,498);assert.deepEqual(all[receipt.workId],receipt.stageVideos.afterRow);
 assert.ok(stayc.ownerPreimage.usedAgeSeconds<900);assert.equal(stayc.ownerPreimage.targetStageScoreEmpty,true);assert.equal(stayc.privateWrites,0);
 const whole={...s,clip:undefined};assert.notEqual(stageSourceKey(whole),key);assert.equal(stageScoreIsBound(whole),false);
});

test('Password real adoption keeps all 497 old objects and binds only the exact reviewed BV CID and page',()=>{
 const all=require('../data/stage-videos.json'),id=receipt.workId,s=stageForWork(id);
 assert.equal(Object.keys(require('./helpers/qwer-formal-baseline.cjs').beforeQwer('stageVideos',all)).length,499);assert.equal(Object.keys(beforePassword('stageVideos',all)).length,497);
 assert.deepEqual(s,receipt.stageVideos.afterRow);assert.equal(stageSourceKey(s),human.embedIdentity.sourceKey);assert.ok(stageScoreIsBound(s));
 assert.equal(stageWatchUrl(s),'https://www.bilibili.com/video/BV1bhU8BWEso/?p=1&cid=34265369310');assert.equal(stageEmbedUrl(s),null);
 assert.equal(s.sourceClass,'reupload');assert.equal(s.selection.occasion,'music_program');assert.equal(s.likes.precision,'unknown');
 assert.match(s.verificationNote,/用户完整看片/);assert.match(s.verificationNote,/代理未独立全片播放/);assert.match(s.verificationNote,/完整206条保存日志/);
 for(const change of [{bilibili:{cid:'34265369311',page:1}},{bilibili:{cid:'34265369310',page:2},url:s.url.replace('p=1','p=2')},{scoreBinding:{...s.scoreBinding,sourceKey:s.videoId}},{scoreBinding:{...s.scoreBinding,initialScore:0}}])assert.equal(stageScoreIsBound({...s,...change}),false);
 assert.ok(receipt.ownerPreimage.usedAgeSeconds<900);assert.equal(receipt.ownerPreimage.all497PublishedSourcesMatchLocal,true);
 assert.equal(receipt.ownerPreimage.targetStageScoreEmpty,true);assert.equal(receipt.ownerPreimage.targetSaveRows,0);assert.equal(receipt.privateWrites,0);assert.equal(receipt.deployment,'none');
 assert.equal(stageSupplementForWork(id).researchNote.summary.includes('尚未采用'),false);
 const altered=structuredClone(all);altered[Object.keys(all)[0]].title+='wrong';assert.throws(()=>beforePassword('stageVideos',altered));
});

test('MADEIN new six-image generic collection preserves both original bytes and PUNG release-reference scope',()=>{
 const g=generic.groups.find(g=>g.groupName==='MADEIN');assert.deepEqual(g,photos.after);
 assert.equal(g.portraits.length,6);assert.equal(photos.assets.length,6);
 for(const p of g.portraits){
  assert.equal(p.width,683);assert.equal(p.height,1024);assert.equal(p.sourceCrop.width/p.sourceCrop.height,.75);
  assert.ok(p.sourceCrop.x>=0&&p.sourceCrop.y>=0&&p.sourceCrop.x+p.sourceCrop.width<=p.width&&p.sourceCrop.y+p.sourceCrop.height<=p.height);
  const a=photos.assets.find(a=>a.path===p.src),bytes=fs.readFileSync(path.join(__dirname,'../public',p.src));
  assert.equal(hash(bytes),p.sha256);assert.equal(bytes.length,a.bytes);assert.equal(a.delivery,'local');assert.equal(p.participationStatus,'unverified_for_work');
 }
 for(const p of photos.expectedBefore.portraits)assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);
 const pung={id:'rec28ldfRTrPi9',groupIds:[g.groupId],url:'https://www.youtube.com/watch?v=aer_X9NmhTc'};
 assert.equal(publicGroupRecognitionForWork(pung),null);
 for(const p of publicWorkRecognition(pung))assert.equal(p.src,photos.after.portraits.find(q=>q.memberId===p.memberId).src);
});

test('MADEIN four release subjects use clear press references without expanding the cast or creating scores',()=>{
 const g=generic.groups.find(g=>g.groupName==='MADEIN'),target=generic.works.find(w=>w.groupId===g.groupId);
 assert.ok(target);const work={id:target.workId,url:'https://www.youtube.com/watch?v='+target.videoId,groupIds:[g.groupId],ratingIds:[],score:0,stageScore:0,note:'private synthetic note'};
 const data={works:[work],ratings:[],members:g.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[g.groupId]}))},before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,4);assert.match(html,/不代表已核实其在本视频出镜/);assert.doesNotMatch(html,/SUHYE|YESEO/);
 assert.doesNotMatch(html,/<input|<form|cast-scores|private synthetic note/);assert.deepEqual(data,before);
 assert.equal(human.ifeye.adoption,'none; keep factual role unresolved');
});
