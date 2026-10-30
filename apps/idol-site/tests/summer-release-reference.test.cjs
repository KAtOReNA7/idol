const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork,publicCreditsForMember}=load('lib/idol/public-work-credits.ts');
const {publicWorkRecognition}=load('lib/idol/public-work-recognition.ts');
const {publicGroupRecognitionForWork}=load('lib/idol/public-group-recognition.ts');
const {memberWorks}=load('lib/idol/member-works.ts');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const {beforeSummerReference,receipt}=require('./helpers/summer-reference-baseline.cjs');
const work={id:'recvxyH5pzQxpW',url:'https://www.youtube.com/watch?v=8DwTAa5hPsA',groupIds:['recvxyEBDZs5Ic'],ratingIds:[],score:0,stageScore:0,note:'synthetic private note',watched:true};
const group=require('../data/public-group-recognition.json').groups.find(g=>g.groupId===work.groupIds[0]);
const hash=x=>createHash('sha256').update(x).digest('hex');
test('SUMMER exact release-photo subjects are separate from recording, complete MV cast and current generic roster',()=>{
 const row=publicCreditForWork(work);assert.equal(row.kind,'documented_project_lineup');assert.equal(row.memberIds.length,5);
 assert.match(row.note,/民间资料页逐名标注/);assert.match(row.note,/不代表本曲逐人录音或本MV出镜已核实/);assert.match(row.note,/不冒称是本发行新概念照/);
 assert.equal(row.sourceUrl,'https://kprofiles.com/wooah-members-profile/');assert.ok(row.supportingUrls.some(u=>u.includes('4151414')));
 assert.equal(publicGroupRecognitionForWork(work),null);assert.equal(receipt.completeFactItemsClosed,0);assert.equal(receipt.after.completePersonFactItems,24);
 for(const patch of [{id:'wrong'},{groupIds:['wrong']},{url:'https://www.youtube.com/watch?v=wrong012345'},{placeholder:true}]){assert.equal(publicCreditForWork({...work,...patch}),null);assert.deepEqual(publicWorkRecognition({...work,...patch}),[]);}
});
test('all five recognition photos reuse prior same-set original bytes while both complete 105-row preimages remain protected',()=>{
 for(const name of ['public-work-credits.json','public-work-recognition.json']){const current=require('../data/'+name);assert.equal(current.records.length,106);assert.equal(beforeSummerReference(name,current).records.length,105);const bad=structuredClone(current);bad.records[0].videoId='wrong';assert.throws(()=>beforeSummerReference(name,bad));}
 for(const p of publicWorkRecognition(work)){const prior=group.portraits.find(q=>q.memberId===p.memberId);for(const key of ['src','sha256','width','height','sourceCrop','sourceUrl','photoSetId'])assert.deepEqual(p[key],prior[key]);assert.equal(hash(fs.readFileSync(path.join(__dirname,'../public',p.src))),p.sha256);assert.match(p.label,/校服/);assert.match(p.note,/不冒称本发行新概念照/);}
 assert.equal(receipt.newImageOriginals,0);assert.equal(receipt.privateWrites,0);assert.equal(receipt.memberRelationChanges,0);
});
test('the actual public-reference component shows five read-only people and preserves existing zero scores and private fields',()=>{
 const data={works:[work],ratings:[],members:group.portraits.map(p=>({id:p.memberId,stageName:p.name,groupIds:[group.groupId],formerGroupIds:[]}))},before=structuredClone(data);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,5);assert.match(html,/本发行概念照人物参考/);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
 for(const member of data.members){assert.deepEqual(memberWorks(data,member.id),[]);assert.equal(publicCreditsForMember(data,member.id).length,1);const saved={...data,ratings:[{id:'saved-zero',workIds:[work.id],memberIds:[member.id],score:0,stylingScore:9,memory:'private synthetic'}]},snapshot=structuredClone(saved);assert.deepEqual(publicCreditsForMember(saved,member.id),[]);assert.equal(memberWorks(saved,member.id)[0].performance,0);renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data:saved,onMember(){}}));assert.deepEqual(saved,snapshot);}
 assert.deepEqual(data,before);
});
