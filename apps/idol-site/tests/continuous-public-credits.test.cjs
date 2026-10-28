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
const evidence=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch1.json');
const batch2=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch2.json');
const batch3=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch3.json');
const batch4=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch4.json');
const batch5=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch5.json');
const batch6=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch6.json');
const batch7=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch7.json');
const batch8=require('../../../docs/codex/evidence/20261028-continuous/person-adoption-batch8.json');
const historical=require('../../../docs/codex/evidence/20261028-followup/131-work-resolution-ledger.json');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const genblue={id:'recvxIZLjZmGMf',videoId:'o5EdYwk8k9o',groupId:'rec28ldfRTiCKv',memberIds:['recvxAPQCFWGjX','recvxAPQCFlVPw','recvxAPQCFSVcE','recvxAPQCFknfS','recvxAPQCFaXuH','recvxAPQCFvZsO']};
const xg={id:'recvxDMFHNSckK',videoId:'c5Fc6r4A9d8',groupId:'recvxDKdOtKdWD',memberIds:['recvxDM2kSglhG','recvxDM9ZFQUqc','recvxDM9ZFX1WW','recvxDM9ZF3RF2','recvxDM9ZF8TqH','recvxDM9ZFSz4m','recvxDM9ZFF60Q']};
const targets=[genblue,xg],newIds=new Set(targets.map(x=>x.id));
const workFor=t=>({id:t.id,url:`https://www.youtube.com/watch?v=${t.videoId}`,groupIds:[t.groupId],ratingIds:[],score:0,stageScore:8,note:'synthetic private note',watched:true});

test('two new documentary credits preserve the entire prior 45-record cohort and all six absence rules',()=>{
 const firstCredits=credits.records.slice(0,47),firstRecognition=recognition.records.slice(0,47);
 assert.equal(firstCredits.length,47);assert.equal(firstRecognition.length,47);
 assert.equal(new Set(firstCredits.map(r=>r.workId)).size,47);
 assert.equal(hash(firstCredits.filter(r=>!newIds.has(r.workId))),'0923faf98f4372408d06a08f69b19221b47624f8b6c64ae16cbaad4e7d341214');
 assert.equal(hash(firstRecognition.filter(r=>!newIds.has(r.workId))),'13fc9cfbe7d1aa58bf7fc4bd9ba1863be94f6358773b9a31fd1679e20d9d042f');
 assert.equal(hash(absence.entries),'ebc28ada6fd33e793d1454fb567a0ea2e456a629c0545a9c3b51aba33b70b459');
 assert.equal(hash(manifest),'db09207d9faded33701c6bc1b6138ffcfb670084fdbf94cf778dae3436ed2e03');
 assert.equal(firstRecognition.reduce((n,r)=>n+r.portraits.length,0),292);
 assert.equal(new Set(firstRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,134);
 const union=new Set([...firstCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);
 assert.equal(union.size,52);assert.equal(historical.records.length-union.size,79);
});

test('second documentary batch preserves all 47 prior records and its 51-work historical cohort',()=>{
 assert.equal(hash(credits.records.slice(0,47)),'bf2717f89d46750b6a572eda1e200ec570a79ebf812bf938c1154daec168519e');
 assert.equal(hash(recognition.records.slice(0,47)),'5d2c6e61260732f246d473a274acd3bf77bbe7012c95aad421fe494bd43286e5');
 const historicalCredits=credits.records.slice(0,51),historicalRecognition=recognition.records.slice(0,51);
 assert.equal(historicalCredits.length,51);assert.equal(historicalRecognition.length,51);
 assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,51);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),306);
 assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,143);
 const union=new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);
 assert.equal(union.size,56);assert.equal(historical.records.length-union.size,75);
 assert.equal(batch2.preservation.privateWrites,0);assert.equal(batch2.preservation.absenceRulesChanged,0);
});

test('three recording additions preserve the old 51 objects, source attribution and all existing private behavior',()=>{
 assert.equal(hash(credits.records.slice(0,51)),'0bda3f83f6c02c65b71322e5969074a7d2f8500263e780d336167261c9af5329');
 assert.equal(hash(recognition.records.slice(0,51)),'54b15c656c2a7bd5f7476c947434bf72b81e1080c60db12ab6b0823c657c6629');
 const historicalCredits=credits.records.slice(0,54),historicalRecognition=recognition.records.slice(0,54);
 assert.equal(historicalCredits.length,54);assert.equal(historicalRecognition.length,54);
 assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,54);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),321);
 assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,153);
 assert.equal(new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]).size,59);
 assert.equal(historical.records.length-59,72);
 const targets=[
  {id:'recvxyOz5XmFwB',videoId:'-1llaBEyOXA',groupId:'recvxyEBDZqxjD',members:['recvxyICzHc0lT','recvxyICzHyGOi','recvxyICzHbVM4','recvxyICzHbJGN','recvxyICzHXdyy']},
  {id:'recvxyOz5Xr917',videoId:'jgD_U2t6qXQ',groupId:'recvxyEBDZ9qVl',members:['recvxyICzHGklh','recvxyICzHhlFz','recvxyICzHLSfX','recvxyICzHpQud','recvxyICzHLR6M']},
  {id:'recvxyOz5XQZhy',videoId:'XEsrFIQOWZg',groupId:'recvxyEBDZ9qVl',members:['recvxyICzHGklh','recvxyICzHhlFz','recvxyICzHLSfX','recvxyICzHpQud','recvxyICzHLR6M']}
 ];
 let slots=0;
 for(const t of targets){
  const work=workFor(t),row=publicCreditForWork(work),ev=batch3.items.find(r=>r.workId===t.id);assert.ok(row);assert.ok(ev);
  assert.equal(row.videoId,t.videoId);assert.equal(row.groupId,t.groupId);assert.deepEqual(row.memberIds,t.members);assert.deepEqual(ev.memberIds,t.members);
  assert.equal(row.kind,'documented_project_lineup');assert.match(row.label,/演唱/);assert.match(row.note,/不.*MV/);
  assert.equal(mvMemberAbsence(work),null);
  assert.equal(publicCreditForWork({...work,url:'https://www.youtube.com/watch?v=other012345'}),null);
  assert.equal(publicCreditForWork({...work,groupIds:['other-group']}),null);
  const portraits=publicWorkRecognition(work);assert.deepEqual(portraits.map(p=>p.memberId),t.members);
  for(const portrait of portraits){
   const ref=ev.referenceReuse.find(r=>r.memberId===portrait.memberId);assert.ok(ref);
   for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(portrait[field],ref.originalManifestRecord[field]);
   assert.equal(portrait.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',portrait.src))).digest('hex'),portrait.sha256);
   assert.equal(portrait.workAssociation,'recognition_reference');assert.match(portrait.note,/不据此证明.*拍摄同期/);slots++;
  }
  const data={works:[work],members:t.members.map(id=>({id,stageName:id,groupIds:[t.groupId]})),ratings:[]},before=structuredClone(data);
  renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  for(const id of t.members){assert.deepEqual(memberWorks(data,id),[]);assert.equal(publicCreditsForMember(data,id).length,1);}
  assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,15);
 const itzy=credits.records.find(r=>r.workId===targets[0].id),restriction=credits.records.find(r=>r.workId===targets[1].id),coke=credits.records.find(r=>r.workId===targets[2].id);
 assert.match(itzy.sourceTitle,/MHN Sports.*转述.*MOSTCONTENTS/);assert.match(itzy.supportingSourceTitles[0],/第一方/);
 assert.match(restriction.sourceTitle,/Financial News.*转述.*ADOR/);assert.ok(restriction.memberIds.includes('recvxyICzHLSfX'));
 assert.match(coke.sourceTitle,/Bandwagon/);assert.match(coke.supportingSourceTitles[0],/Coca-Cola.*第一方/);
 assert.equal(batch3.preservation.privateWrites,0);assert.equal(batch3.preservation.absenceRulesChanged,0);
});

test('second batch preserves partial performer scope, original Japanese release and former-member boundary',()=>{
 const exact=[
  {id:'rec28ldfRTrFGi',videoId:'A-Hr8aYSEx0',members:['recvxAPQCFDPha','recvxAPQCFQR2I','recvxAPQCFtTIC','recvxAPQCF1Jqn'],kind:'documented_project_lineup'},
  {id:'rec28ldfRTrMsR',videoId:'a6PBMuqpGto',members:['rec28ldbniBaWW'],kind:'documented_project_lineup'},
  {id:'rec28ldfRTrQ4z',videoId:'DrU5bxPcH0s',members:['recvxAPQCFeTtL','recvxAPQCFgu8Z','recvxAPQCFgfOW','recvxAPQCFWScb','recvxAPQCFwHoN','recvxAPQCFnjrP','recvxAPQCF822A','recvxAPQCFOtuE'],kind:'documented_project_lineup'},
  {id:'recvxIZLpETQNx',videoId:'sqYNGZJWNcw',members:['recvxAPQCFgu8Z'],kind:'partial_mv_participation'}
 ];
 let count=0;
 for(const target of exact){
  const source=batch2.items.find(i=>i.workId===target.id);assert.ok(source);
  assert.equal(source.videoId,target.videoId);assert.deepEqual(source.memberIds,target.members);
  const work=workFor({...target,groupId:source.groupId}),before=structuredClone(work),row=publicCreditForWork(work);
  assert.equal(row.kind,target.kind);assert.deepEqual(row.memberIds,target.members);assert.equal(mvMemberAbsence(work),null);
  assert.equal(publicCreditForWork({...work,url:'https://www.youtube.com/watch?v=other012345'}),null);
  assert.equal(publicCreditForWork({...work,groupIds:['other-group']}),null);
  const portraits=publicWorkRecognition(work);assert.deepEqual(portraits.map(p=>p.memberId),target.members);
  for(const portrait of portraits){
   const ref=source.referenceReuse.find(r=>r.memberId===portrait.memberId),original=ref.originalManifestRecord;
   for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(portrait[field],original[field]);
   assert.equal(portrait.sha256,ref.sha256);
   assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',portrait.src))).digest('hex'),portrait.sha256);
   assert.equal(portrait.workAssociation,'recognition_reference');assert.match(portrait.note,/不据此证明.*拍摄同期/);
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(portrait,key),false);
   count++;
  }
  const data={works:[work],members:target.members.map(id=>({id,stageName:id,groupIds:[source.groupId]})),ratings:[]},saved=structuredClone(data);
  renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  for(const memberId of target.members)assert.deepEqual(memberWorks(data,memberId),[]);
  assert.deepEqual(data,saved);assert.deepEqual(work,before);assert.equal(work.score,0);
 }
 assert.equal(count,14);
 const vvup=credits.records.find(r=>r.workId===exact[0].id),belle=credits.records.find(r=>r.workId===exact[1].id),japanese=credits.records.find(r=>r.workId===exact[2].id),nana=credits.records.find(r=>r.workId===exact[3].id);
 assert.equal(vvup.memberIds.includes('recvxAPQCFN2Tn'),false);assert.match(vvup.note,/Jiyoon.*首次参与演唱/);
 assert.match(belle.label,/部分名单/);assert.match(belle.note,/不表示完整演唱或MV出镜名单/);
 assert.match(japanese.label,/日文发行/);assert.match(japanese.note,/区分.*英语版/);
 assert.match(nana.label,/部分名单/);assert.match(nana.note,/不扩为全员/);
});

test('GENBLUE names only the reported six MV participants while XG remains release-project evidence',()=>{
 for(const target of targets){
  const row=publicCreditForWork(workFor(target)),source=evidence.items.find(r=>r.workId===target.id);
  assert.ok(source);assert.equal(row.videoId,target.videoId);assert.equal(row.groupId,target.groupId);
  assert.deepEqual(row.memberIds,target.memberIds);assert.deepEqual(row.memberIds,source.memberIds);
  assert.equal(mvMemberAbsence(workFor(target)),null);
 }
 const g=publicCreditForWork(workFor(genblue)),x=publicCreditForWork(workFor(xg));
 assert.equal(g.kind,'partial_mv_participation');assert.match(g.label,/部分名单/);
 assert.match(g.sourceUrl,/playmusic\.tw\/column_info\.php\?id=28418/);
 assert.match(g.note,/公开报道/);assert.match(g.note,/未完整播放/);
 assert.equal(x.kind,'documented_project_lineup');assert.match(x.label,/发行阵容/);
 assert.match(x.note,/不表示逐人MV出镜/);assert.match(x.evidence,/typo is not adopted/);
 assert.ok(evidence.items.find(i=>i.workId===genblue.id).sources.some(s=>s.facts.some(f=>f.includes('o5EdYwk8k9o'))));
 assert.ok(evidence.items.find(i=>i.workId===xg.id).sources.some(s=>s.facts.some(f=>f.includes('embed/c5Fc6r4A9d8'))));
});

test('thirteen recognition references preserve reviewed original bytes, dimensions and crops',()=>{
 let count=0;
 for(const target of targets){
  const pictures=publicWorkRecognition(workFor(target)),source=evidence.items.find(i=>i.workId===target.id);
  assert.deepEqual(pictures.map(p=>p.memberId),target.memberIds);
  for(const p of pictures){
   const old=source.referenceReuse.find(r=>r.memberId===p.memberId);assert.ok(old);
   const original=manifest.portraits.find(r=>r.workId===old.reusedFromWorkId&&r.memberId===p.memberId);assert.ok(original);
   for(const key of ['src','width','height','sourceCrop','objectPosition','sourceUrl'])assert.deepEqual(p[key],original[key]);
   assert.equal(p.sha256,old.sha256);
   assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',p.src))).digest('hex'),p.sha256);
   assert.equal(p.workAssociation,'recognition_reference');assert.match(p.label,/认人参考/);
   assert.match(p.note,/不据此证明/);assert.match(p.note,/拍摄同期/);
   for(const key of ['ratingId','ratingIds','score','stylingScore','watched','memory'])assert.equal(Object.hasOwn(p,key),false);
   count++;
  }
 }
 assert.equal(count,13);
});

test('the exact work/video/group tuple is required and no score or private relationship is created',()=>{
 for(const target of targets){
  const work=workFor(target),members=target.memberIds.map(id=>({id,name:id,stageName:id,groupIds:[target.groupId]})),data={works:[work],members,ratings:[]},before=structuredClone(data);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{url:`https://evil.example/watch?v=${target.videoId}`},{placeholder:true}]){
   assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
  }
  const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,target.memberIds.length);
  assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const memberId of target.memberIds){
   assert.equal(publicCreditsForMember(data,memberId).length,1);assert.deepEqual(memberWorks(data,memberId),[]);
   const personal={...data,ratings:[{id:'existing-private-relation',memberIds:[memberId],workIds:[work.id],score:0,stylingScore:7,note:'existing synthetic note'}]},saved=structuredClone(personal);
   assert.deepEqual(publicCreditsForMember(personal,memberId),[]);assert.equal(memberWorks(personal,memberId)[0].performance,0);assert.deepEqual(personal,saved);
  }
  assert.deepEqual(data,before);
 }
});


test('four further named credits preserve old 54 objects, exact performer scopes and all original asset bytes',()=>{
 assert.equal(hash(credits.records.slice(0,54)),'d81e26460816b9e9a3abc020b5bd0dd23d4e3501e733ff7ab2b7b9ac407ecf17');
 assert.equal(hash(recognition.records.slice(0,54)),'4e96f06ddecf36b83ca8e934f67cd7602fb9f76d3ca5051ec4dec1697ebcd78c');
 const historicalCredits=credits.records.slice(0,58),historicalRecognition=recognition.records.slice(0,58);
 assert.equal(historicalCredits.length,58);assert.equal(historicalRecognition.length,58);
 assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,58);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),339);
 assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,165);
 const union=new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);
 assert.equal(union.size,63);assert.equal(historical.records.length-union.size,68);
 const exact=[
  {id:'rec28ldfRTrGEy',videoId:'BbcxmtNaesk',groupId:'rec28ldfRTiDh1',members:['recvxAPQCFeMGQ','recvxAPQCF1S0j','recvxAPQCFRRHa','recvxAPQCF50Hn','recvxAPQCFGDkN','recvxAPQCFjMmI'],kind:'documented_project_lineup'},
  {id:'recvxyH5pzbluu',videoId:'udOf9JGMA7U',groupId:'recvxyEBDZ2V3c',members:['recvxyICzH6sk8'],kind:'documented_project_lineup'},
  {id:'rec28ldfRTrGou',videoId:'IVXJXo_AZyw',groupId:'rec28ldfRTiDcU',members:['recvxAPQCFTDpN','recvxAPQCF89Dz','recvxAPQCFg3or','recvxAPQCFWkr2','recvxAPQCFgfgo'],kind:'partial_mv_participation'},
  {id:'recvxyH5pzoaOZ',videoId:'VACXoKdmofo',groupId:'recvxyEBDZPbu5',members:['recvxyICzHH702','recvxyICzHbczT','recvxyICzHn6vM','recvxyICzHBiSD','recvxyICzHrdSX','recvxyICzHXzUs'],kind:'documented_project_lineup'}
 ];
 let slots=0;
 for(const t of exact){
  const work=workFor(t),row=publicCreditForWork(work),ev=batch4.items.find(i=>i.workId===t.id);
  assert.ok(row);assert.ok(ev);assert.equal(row.videoId,t.videoId);assert.equal(row.groupId,t.groupId);
  assert.equal(row.kind,t.kind);assert.deepEqual(row.memberIds,t.members);assert.deepEqual(ev.memberIds,t.members);
  assert.equal(mvMemberAbsence(work),null);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'}]){
   assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);
  }
  const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),t.members);
  for(const photo of photos){
   const ref=ev.referenceReuse.find(r=>r.memberId===photo.memberId);assert.ok(ref);
   for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(photo[field],ref.originalManifestRecord[field]);
   assert.equal(photo.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);
   assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不据此证明.*拍摄同期/);
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);
   if(t.id==='rec28ldfRTrGEy'){assert.equal(photo.width,670);assert.ok(photo.src.endsWith('.original.jpg'));assert.ok(Math.min(photo.width,photo.height*3/4)>=540);}
   slots++;
  }
  const data={works:[work],members:t.members.map(id=>({id,stageName:id,groupIds:[t.groupId]})),ratings:[]},before=structuredClone(data);
  const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,t.members.length);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const id of t.members){assert.deepEqual(memberWorks(data,id),[]);assert.equal(publicCreditsForMember(data,id).length,1);}
  assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,18);
 const bew=credits.records.find(r=>r.workId===exact[0].id),st=credits.records.find(r=>r.workId===exact[1].id),sc=credits.records.find(r=>r.workId===exact[2].id),love=credits.records.find(r=>r.workId===exact[3].id);
 assert.match(bew.note,/不据此推定.*逐人出镜/);assert.match(st.note,/不表示其为唯一演唱者/);assert.match(st.note,/韩语舞台版本/);
 assert.match(sc.sourceTitle,/本期 About Styling/);assert.match(sc.note,/未完整播放或逐帧核验/);
 assert.equal(love.memberIds.includes('recvxyICzHOhfP'),false);assert.match(love.note,/不把其他作品的无真人规则套用/);
 assert.equal(batch4.preservation.privateWrites,0);assert.equal(batch4.preservation.privateRelationsAdded,0);assert.equal(batch4.preservation.absenceRulesChanged,0);
});


test('seven version-specific documentary additions preserve 58 prior objects and distinguish creative from performance credits',()=>{
 assert.equal(hash(credits.records.slice(0,58)),'55249b35ae63a82363e9102e4de04550c481ef2d7eebce5104c0b9fb35c0e574');
 assert.equal(hash(recognition.records.slice(0,58)),'80220185b3763d15b6c12763697476c9c22f05e88b28c57d55ecfeb8a22200aa');
 const historicalCredits=credits.records.slice(0,65),historicalRecognition=recognition.records.slice(0,65);
 assert.equal(historicalCredits.length,65);assert.equal(historicalRecognition.length,65);
 assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,65);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),379);
 assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,171);
 const union=new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);assert.equal(union.size,70);assert.equal(historical.records.length-union.size,61);
 const members={madein:['rec28ldbniBgam','rec28ldbniBghr','rec28ldbniBgoz','rec28ldbniBgvC','rec28ldbniBgYn','rec28ldbniBgCI','rec28ldbniBgJR'],yp:['recvxAPQCFTDpN','recvxAPQCF89Dz','recvxAPQCFg3or','recvxAPQCFWkr2','recvxAPQCFgfgo'],rocket:['recvxyICzHHVgm','recvxyICzHhNwL','recvxyICzHfdEb','recvxyICzHpBMU','recvxyICzHxMMv','recvxyICzHrWlC']};
 const tuples=[['rec28ldfRTrCzF','kLd8bHVpUUw','rec28ldfRTiCzI','madein'],['rec28ldfRTrCDJ','PYEOubLoXDo','rec28ldfRTiCzI','madein'],['rec28ldfRTrGwK','QsOnTCwooDs','rec28ldfRTiDcU','yp'],['recvxIZY0lR25A','GaqBpWroH68','rec28ldfRTiDcU','yp'],['recvxJ03dOg1Gc','lFxXpXk35Eo','rec28ldfRTiDcU','yp'],['recvxIZY0lPdWr','J997YfFCw2I','rec28ldfRTiDcU','yp'],['recvxyH5pzuYEC','FypWEDYseBY','recvxyEBDZB3pz','rocket']];
 let slots=0;
 for(const [id,videoId,groupId,group] of tuples){
  const work=workFor({id,videoId,groupId}),row=publicCreditForWork(work),ev=batch5.items.find(i=>i.workId===id);assert.ok(ev);assert.ok(row);
  assert.equal(row.kind,'documented_project_lineup');assert.deepEqual(row.memberIds,members[group]);assert.deepEqual(ev.memberIds,members[group]);assert.equal(mvMemberAbsence(work),null);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'}]){assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);}
  const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),members[group]);
  for(const photo of photos){
   const ref=ev.referenceReuse.find(r=>r.memberId===photo.memberId);assert.ok(ref);
   for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(photo[field],ref.originalManifestRecord[field]);
   assert.equal(photo.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);
   assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不据此证明.*拍摄同期/);assert.match(photo.label,/认人参考/);
   if(group==='madein'&&photo.memberId==='rec28ldbniBgam'){assert.match(photo.photoSetId,/fallin/);assert.match(photo.note,/不把七图说成同一套/);}
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);slots++;
  }
  const data={works:[work],members:members[group].map(id=>({id,stageName:id,groupIds:[groupId]})),ratings:[]},before=structuredClone(data),html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,members[group].length);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const mid of members[group])assert.deepEqual(memberWorks(data,mid),[]);assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,40);
 const by=id=>credits.records.find(r=>r.workId===id);
 assert.match(by(tuples[0][0]).note,/2024/);assert.ok(by(tuples[0][0]).memberIds.includes('rec28ldbniBgYn'));
 assert.match(by(tuples[2][0]).note,/John Park.*不证明/);
 assert.match(by(tuples[3][0]).label,/作词/);assert.doesNotMatch(by(tuples[3][0]).label,/演唱/);assert.match(by(tuples[3][0]).note,/不把作词名单改写/);
 assert.match(by(tuples[4][0]).note,/不扩成五人创作/);assert.deepEqual(batch5.items.find(i=>i.workId===tuples[4][0]).personRoles.JIANA,['release participation']);
 assert.match(by(tuples[5][0]).note,/不把10月12日另一支Choreography/);
 assert.match(by(tuples[6][0]).label,/Acoustic/);assert.match(by(tuples[6][0]).note,/不是日文版/);assert.ok(by(tuples[6][0]).memberIds.includes('recvxyICzHhNwL'));
 assert.equal(batch5.preservation.privateWrites,0);assert.equal(batch5.preservation.privateRelationsAdded,0);assert.equal(batch5.preservation.absenceRulesChanged,0);
});

test('eight limited participation records preserve old 65 objects and do not turn creative or release credits into cast or scores',()=>{
 assert.equal(hash(credits.records.slice(0,65)),'d500195222dde66c3f6598e3e089d2718496730329d05a1fb77d022cd4e41803');
 assert.equal(hash(recognition.records.slice(0,65)),'cd6770936eb20c3de168f8a455ed1ff327c9ed6ca77569e7d0f9de43133d504e');
 const historicalCredits=credits.records.slice(0,73),historicalRecognition=recognition.records.slice(0,73);
 assert.equal(historicalCredits.length,73);assert.equal(historicalRecognition.length,73);
 assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,73);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),405);
 assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,189);
 const union=new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);assert.equal(union.size,78);assert.equal(historical.records.length-union.size,53);
 const h2h=['rec28ldbniB6Rt','rec28ldbniB70B','rec28ldbniB7vO'];
 const exact=[
  ['rec28ldfRTrI0Y','80-Q7b1qaFg','rec28ldfRTiBAq',h2h],
  ['rec28ldfRTrJKM','GtPPT-qSXj8','rec28ldfRTiBAq',h2h],
  ['rec28ldfRTrIC0','gNUMxMuxH20','rec28ldfRTiBAq',['rec28ldbniB7F7']],
  ['rec28ldfRTrJne','peFN4squVuQ','rec28ldfRTiC6k',['rec28ldbniBa8G','rec28ldbniBafU','rec28ldbniBan4','rec28ldbniBauu','rec28ldbniBaBx']],
  ['recvxyH5pzbYAm','a7d5aFNh-YE','recvxyEBDZPXW9',['recvxyICzH9odN','recvxyICzH2hbG','recvxyICzHhav7','recvxyICzHs6DK','recvxyICzHtQXk','recvxyICzHJHn8','recvxyICzHBhTg']],
  ['recvxyOz5X7zV3','ytTlH0EpSqI','recvxyEBDZqxjD',['recvxyICzHc0lT','recvxyICzHyGOi','recvxyICzHbVM4','recvxyICzHbJGN','recvxyICzHXdyy']],
  ['recvxyHuKMXVDa','xjBY3MLdvVQ','recvxyEBDZxfeD',['recvxyICzH9h49']],
  ['recvxyH5pz4ojC','5oIIzNGeXco','recvxyEBDZllCe',['recvxyICzHDkqn']]
 ];
 let slots=0;
 for(const [id,videoId,groupId,memberIds] of exact){
  const work=workFor({id,videoId,groupId}),row=publicCreditForWork(work),ev=batch6.items.find(i=>i.workId===id);assert.ok(row);assert.ok(ev);assert.deepEqual(row.memberIds,memberIds);assert.deepEqual(ev.memberIds,memberIds);assert.equal(mvMemberAbsence(work),null);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'}]){assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);}
  const pictures=publicWorkRecognition(work);assert.deepEqual(pictures.map(p=>p.memberId),memberIds);
  for(const photo of pictures){
   const ref=ev.referenceReuse.find(r=>r.memberId===photo.memberId);assert.ok(ref);
   for(const key of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(photo[key],ref.originalManifestRecord[key]);
   assert.equal(photo.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不据此证明.*拍摄同期/);
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);slots++;
  }
  const data={works:[work],members:memberIds.map(id=>({id,stageName:id,groupIds:[groupId]})),ratings:[]},before=structuredClone(data),html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));
  assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,memberIds.length);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const mid of memberIds){assert.deepEqual(memberWorks(data,mid),[]);const personal={...data,ratings:[{id:'existing-relation',memberIds:[mid],workIds:[id],score:0,stylingScore:8,note:'existing synthetic note'}]},saved=structuredClone(personal);assert.equal(memberWorks(personal,mid)[0].performance,0);assert.deepEqual(publicCreditsForMember(personal,mid),[]);assert.deepEqual(personal,saved);}
  assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,26);
 const by=id=>credits.records.find(r=>r.workId===id);
 assert.match(by(exact[0][0]).label,/录音.*部分名单/);assert.match(by(exact[1][0]).note,/不据此推定.*逐人出镜/);
 assert.match(by(exact[2][0]).sourceUrl,/4-241018088/);assert.match(by(exact[2][0]).note,/YE-ON/);assert.doesNotMatch(by(exact[2][0]).note,/CARMEN/);
 assert.match(by(exact[3][0]).note,/未完整播放/);
 assert.match(by(exact[4][0]).label,/日文发行个人盘/);assert.match(by(exact[4][0]).note,/不是个人独唱/);
 assert.match(publicWorkRecognition(workFor({id:exact[4][0],videoId:exact[4][1],groupId:exact[4][2]})).find(p=>p.memberId==='recvxyICzHJHn8').note,/不把七图说成同一套/);
 assert.match(by(exact[5][0]).label,/日文发行活动/);assert.match(by(exact[5][0]).note,/活动视频不是本MV/);
 assert.match(by(exact[6][0]).label,/作词/);assert.doesNotMatch(by(exact[6][0]).label,/演唱/);assert.match(by(exact[6][0]).note,/不扩为aespa全员/);
 assert.match(by(exact[7][0]).label,/作曲/);assert.doesNotMatch(by(exact[7][0]).label,/演唱/);assert.match(by(exact[7][0]).note,/不自动扩成六人/);
 assert.equal(batch6.preservation.privateWrites,0);assert.equal(batch6.preservation.privateRelationsAdded,0);assert.equal(batch6.preservation.absenceRulesChanged,0);
});

test('final four person records preserve old 73 objects, historical RAMI and Korean-version scope without score writes',()=>{
 assert.equal(hash(credits.records.slice(0,73)),'f585f8ce7bdf089f8200fd7697fd3b6662ab421df6c62a50b040ee8359f86078');
 assert.equal(hash(recognition.records.slice(0,73)),'09e743030380d24b414ffdd51bdf9e3b4afba6a7e7a01151b67064b8ad7509fb');
 const historicalCredits=credits.records.slice(0,77),historicalRecognition=recognition.records.slice(0,77);
 assert.equal(historicalCredits.length,77);assert.equal(historicalRecognition.length,77);assert.equal(new Set(historicalCredits.map(r=>r.workId)).size,77);
 assert.equal(historicalRecognition.reduce((n,r)=>n+r.portraits.length,0),429);assert.equal(new Set(historicalRecognition.flatMap(r=>r.portraits.map(p=>p.src))).size,197);
 const union=new Set([...historicalCredits.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);assert.equal(union.size,82);assert.equal(historical.records.length-union.size,49);
 const baby=['rec28ldbniB9dP','rec28ldbniB9lW','rec28ldbniB9uh','rec28ldbniB9CH','rec28ldbniB9KV','rec28ldbniB9Tl','rec28ldbniBa1w'];
 const tuples=[
  ['rec28ldfRTrJ7M','yFGsw8phPn4','rec28ldfRTiC6k',['rec28ldbniBa8G','rec28ldbniBafU','rec28ldbniBan4','rec28ldbniBauu','rec28ldbniBaBx']],
  ['rec28ldfRTrLgo','M8r3x4Re8-I','rec28ldfRTiC1X',baby],
  ['rec28ldfRTrLku','Gz_yRl6703c','rec28ldfRTiC1X',baby],
  ['rec28ldfRTrLBw','qjebIv8FYMI','rec28ldfRTiBON',['rec28ldbniB7Nx','rec28ldbniB7Vy','rec28ldbniB82H','rec28ldbniB89P','rec28ldbniB8ho']]
 ];
 let slots=0;
 for(const [id,videoId,groupId,memberIds] of tuples){
  const work=workFor({id,videoId,groupId}),row=publicCreditForWork(work),ev=batch7.items.find(i=>i.workId===id);assert.ok(row);assert.ok(ev);assert.deepEqual(row.memberIds,memberIds);assert.deepEqual(ev.memberIds,memberIds);assert.equal(mvMemberAbsence(work),null);
  assert.equal(ev.exactVideoEvidence.videoId,videoId);assert.equal(ev.exactVideoEvidence.exactIdMatches,true);assert.equal(ev.exactVideoEvidence.fullPlaybackVerified,false);assert.equal(ev.exactVideoEvidence.personVisualIdentification,false);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'}]){assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);}
  const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),memberIds);
  for(const photo of photos){
   const ref=ev.referenceReuse.find(r=>r.memberId===photo.memberId);assert.ok(ref);for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(photo[field],ref.originalManifestRecord[field]);
   assert.equal(photo.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不据此证明.*拍摄同期/);
   if(groupId==='rec28ldfRTiC1X'){assert.match(photo.note,/不称七图同套/);if(photo.memberId==='rec28ldbniB9KV'){assert.equal(photo.width,840);assert.match(photo.sourceUrl,/mgz_seq=14146/);}}
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);slots++;
  }
  const data={works:[work],members:memberIds.map(id=>({id,stageName:id,groupIds:[groupId]})),ratings:[]},before=structuredClone(data),html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,memberIds.length);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const mid of memberIds){assert.deepEqual(memberWorks(data,mid),[]);const personal={...data,ratings:[{id:'saved',workIds:[id],memberIds:[mid],score:0,stylingScore:9}]},saved=structuredClone(personal);assert.equal(memberWorks(personal,mid)[0].performance,0);assert.deepEqual(publicCreditsForMember(personal,mid),[]);assert.deepEqual(personal,saved);}assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,24);
 const by=id=>credits.records.find(r=>r.workId===id);
 assert.equal(by(tuples[0][0]).kind,'partial_mv_participation');assert.match(by(tuples[0][0]).note,/不混用Studio Choom/);
 for(const t of [tuples[1],tuples[2]]){assert.match(by(t[0]).label,/原发行阵容/);assert.doesNotMatch(by(t[0]).label,/演唱/);assert.ok(by(t[0]).memberIds.includes('rec28ldbniB9KV'));}
 assert.match(by(tuples[3][0]).label,/韩文发行/);assert.match(by(tuples[3][0]).note,/不把日文版资料自动套用/);
 assert.equal(batch7.preservation.privateWrites,0);assert.equal(batch7.preservation.privateRelationsAdded,0);assert.equal(batch7.preservation.absenceRulesChanged,0);
});


test('last three scoped release references preserve old 77 objects and keep specific scene evidence separate from the full cast',()=>{
 assert.equal(hash(credits.records.slice(0,77)),'251d97d3ec86a24245435dad5ce10ce3a76ea250e04225eeff300ddbaff2dd23');
 assert.equal(hash(recognition.records.slice(0,77)),'9578a75dbfcbba6c8246689aeab6898e33f85463cf774787662f1cba40c77d55');
 assert.equal(credits.records.length,80);assert.equal(recognition.records.length,80);assert.equal(new Set(credits.records.map(r=>r.workId)).size,80);
 assert.equal(recognition.records.reduce((n,r)=>n+r.portraits.length,0),444);assert.equal(new Set(recognition.records.flatMap(r=>r.portraits.map(p=>p.src))).size,202);
 const union=new Set([...credits.records.map(r=>r.workId),...absence.entries.map(r=>r.workId)]);assert.equal(union.size,85);assert.equal(historical.records.length-union.size,46);
 const kiii=['rec28ldbniB8oY','rec28ldbniB8wf','rec28ldbniB8Oo','rec28ldbniB8WR','rec28ldbniB94X'];
 const tuples=[['rec28ldfRTrINH','OncJ5v1keww','rec28ldfRTiBUk',kiii],['rec28ldfRTrIRO','BTlj6Sls7KE','rec28ldfRTiBUk',kiii],['rec28ldfRTrK1S','xRU1XXHIpIc','rec28ldfRTiBON',['rec28ldbniB7Nx','rec28ldbniB7Vy','rec28ldbniB82H','rec28ldbniB89P','rec28ldbniB8ho']]];
 let slots=0;
 for(const [id,videoId,groupId,memberIds] of tuples){
  const work=workFor({id,videoId,groupId}),row=publicCreditForWork(work),ev=batch8.items.find(i=>i.workId===id);assert.ok(row);assert.ok(ev);assert.deepEqual(row.memberIds,memberIds);assert.deepEqual(ev.memberIds,memberIds);assert.equal(row.kind,'documented_project_lineup');assert.equal(mvMemberAbsence(work),null);
  assert.equal(ev.exactVideoEvidence.videoId,videoId);assert.equal(ev.exactVideoEvidence.exactIdMatches,true);assert.equal(ev.exactVideoEvidence.fullPlaybackVerified,false);assert.equal(ev.exactVideoEvidence.personVisualIdentification,false);
  for(const mismatch of [{id:'other-work'},{groupIds:['other-group']},{url:'https://www.youtube.com/watch?v=other012345'}]){assert.equal(publicCreditForWork({...work,...mismatch}),null);assert.deepEqual(publicWorkRecognition({...work,...mismatch}),[]);}
  const photos=publicWorkRecognition(work);assert.deepEqual(photos.map(p=>p.memberId),memberIds);assert.equal(new Set(photos.map(p=>p.photoSetId)).size,1);
  for(const photo of photos){
   const ref=ev.referenceReuse.find(r=>r.memberId===photo.memberId);assert.ok(ref);for(const field of ['src','width','height','sourceCrop','objectPosition','sourceUrl','photoSetId'])assert.deepEqual(photo[field],ref.originalManifestRecord[field]);
   assert.equal(photo.sha256,ref.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../public',photo.src))).digest('hex'),photo.sha256);assert.equal(photo.workAssociation,'recognition_reference');assert.match(photo.note,/不据此证明.*拍摄同期/);
   for(const key of ['score','ratingId','ratingIds','stylingScore','watched','memory'])assert.equal(Object.hasOwn(photo,key),false);slots++;
  }
  const data={works:[work],members:memberIds.map(id=>({id,stageName:id,groupIds:[groupId]})),ratings:[]},before=structuredClone(data),html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work,data,onMember(){}}));assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,memberIds.length);assert.doesNotMatch(html,/<input|<form|cast-scores|synthetic private note/);
  for(const mid of memberIds){assert.deepEqual(memberWorks(data,mid),[]);const personal={...data,ratings:[{id:'saved',workIds:[id],memberIds:[mid],score:0,stylingScore:9}]},saved=structuredClone(personal);assert.equal(memberWorks(personal,mid)[0].performance,0);assert.deepEqual(publicCreditsForMember(personal,mid),[]);assert.deepEqual(personal,saved);}assert.deepEqual(data,before);assert.equal(work.score,0);
 }
 assert.equal(slots,15);
 const by=id=>credits.records.find(r=>r.workId===id);
 assert.match(by(tuples[0][0]).note,/不将概念照名单当作逐人录音署名/);assert.match(by(tuples[0][0]).label,/本发行参与参考/);
 assert.match(by(tuples[1][0]).note,/不把该专题另列的《404》MV当成本视频证据/);assert.ok(by(tuples[1][0]).supportingUrls.includes('https://www.mk.co.kr/news/musics/11931864'));
 assert.match(by(tuples[2][0]).note,/MINJU.*其余四人不扩写/);assert.doesNotMatch(by(tuples[2][0]).label,/全员|出演/);
 assert.equal(batch8.preservation.privateWrites,0);assert.equal(batch8.preservation.privateRelationsAdded,0);assert.equal(batch8.preservation.absenceRulesChanged,0);
});
