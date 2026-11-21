const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {harness}=require('./helpers/personal-mv-ratings.cjs');
const {parse}=require('next/dist/compiled/node-html-parser');
const path=require('node:path'),os=require('node:os'),child=require('node:child_process'),{DatabaseSync}=require('node:sqlite');
const tableSchema=name=>({field_id:name,field_name:name,type:1});
const fixtureOwner=()=>({userId:'owner',email:fs.readFileSync('lib/idol/http.ts','utf8').match(/toLowerCase\(\)!=='([^']+)'/)[1]});
const count=(sql,table)=>sql.prepare('SELECT count(*) AS n FROM '+table).get().n;
const bad=(code,status)=>e=>e.code===code&&(!status||e.status===status);

test('owner explicitly saves zero for a historical member, reads it privately, exports it, and can clear it',async()=>{
 const h=harness(),{api,sql}=h,input=await h.request();
 const first=await api.savePersonalMvRating('owner',input);
 const control=await api.ownControl('owner');
 assert.deepEqual(await api.personalMvRatingsForOwner('owner',control,h.catalog,h.work.id),await h.read());
 assert.deepEqual((await api.personalMvRatingsForOwner('owner',control,h.catalog,'recOther')).entries,[]);
 assert.equal(first.verified,true);assert.equal(first.revision,1);assert.equal(first.score,0);
 assert.deepEqual(await api.savePersonalMvRating('owner',input),first);
 assert.equal(count(sql,'idol_saves'),1);assert.equal(count(sql,'idol_personal_mv_ratings'),1);
 assert.equal(sql.prepare("SELECT count(*) AS n FROM idol_native_records WHERE table_key='ratings'").get().n,0);
 const owner={...h.catalog,personalMvRatings:await h.read()},guest=api.projectPublicCatalog(owner);
 assert.equal(guest.personalMvRatings,undefined);assert.equal(guest.ratings.length,0);
 assert.equal(api.memberWorks(guest,h.member.id).length,0);
 const items=api.memberWorks(owner,h.member.id);assert.equal(items.length,1);assert.equal(items[0].performance,0);assert.equal(api.memberWorkSummary(items).ratedWorks,1);
 const insights=catalog=>api.summarizeMembers(api.prepareCatalog(catalog)).rows;
 assert.deepEqual(insights(guest),[]);
 const ownStats=insights(owner);assert.equal(ownStats[0].performance.mean,0);assert.equal(ownStats[0].performance.sampleCount,1);
 assert.deepEqual(ownStats[0].ratingIds,[]);assert.deepEqual(ownStats[0].workIds,[h.work.id]);
 const changed={...owner,works:[{...h.work,url:'https://youtu.be/NEWvideo012'}]};assert.deepEqual(insights(changed),[]);
 const native={id:'recRating',memberIds:[h.member.id],workIds:[h.work.id],score:9,stylingScore:null};
 const authoritative={...owner,ratings:[native],works:[{...h.work,ratingIds:[native.id]}]};
 const primary=insights(authoritative)[0];assert.equal(primary.performance.mean,9);assert.equal(primary.performance.sampleCount,1);
 assert.deepEqual(primary.ratingIds,[native.id]);
 assert.equal(api.memberWorks({...owner,works:[{...h.work,url:'https://youtu.be/NEWvideo012'}]},h.member.id).length,0);
 const backup=await api.nativeExportSnapshot('owner');assert.equal(backup.personalMvRatings[0].score,0);assert.equal(backup.journal.length,1);
 await assert.rejects(api.nativeExportSnapshot('another'),bad('OWNER_ONLY',403));
 await assert.rejects(api.savePersonalMvRating('owner',{...input,score:9}),bad('IDEMPOTENCY_CONFLICT',409));
 await api.savePersonalMvRating('owner',await h.request({score:null,revision:1}));
 assert.equal((await h.read()).entries[0].score,null);assert.equal(count(sql,'idol_saves'),2);
});
test('wrong owner, mismatched source, wrong group, forbidden appearances, invalid scores and native relations cannot be silently bound',async()=>{
 const h=harness(),{api}=h,input=await h.request();
 await assert.rejects(api.savePersonalMvRating('visitor',input),bad('OWNER_ONLY',403));
 for(const [patch,code] of [[{videoId:'NEWvideo012'},'MV_SOURCE_CHANGED'],[{scope:'0'.repeat(64)},'STORAGE_CHANGING'],
  [{score:-1},'INVALID_SCORE'],[{score:11},'INVALID_SCORE'],[{score:'0'},'INVALID_SCORE'],[{score:null},'INVALID_SCORE'],[{owner:'owner'},'INVALID_SAVE']]){
  await assert.rejects(api.savePersonalMvRating('owner',{...input,...patch}),bad(code));
 }
 h.seed('members','recOther',{fld6bhQOdO:['recOtherGroup']});
 await assert.rejects(api.savePersonalMvRating('owner',{...input,memberId:'recOther'}),bad('INVALID_MEMBER'));
 const absent=require('../data/mv-member-appearance.json').entries[0];
 h.seed('works',absent.workId,{fldhBWXBZE:'https://youtu.be/'+absent.videoId,fld2wy1cqw:['recGroup']});
 await assert.rejects(api.savePersonalMvRating('owner',{...input,workId:absent.workId,videoId:absent.videoId}),bad('MV_HAS_NO_MEMBERS'));
 h.seed('ratings','recNative',{fld58b7Cvs:{link_record_ids:[input.workId]},fldNSoSjTU:[{recordId:input.memberId}]});
 await assert.rejects(api.savePersonalMvRating('owner',input),bad('EDIT_CONFLICT'));
 assert.equal(count(h.sql,'idol_saves'),0);assert.equal(count(h.sql,'idol_personal_mv_ratings'),0);
});
test('concurrent saves, stale revisions, lost receipts and mid-transaction failure preserve a single binding and matching journal',async()=>{
 const h=harness(),{api,sql,model}=h;
 const a=await h.request(),b=await h.request({score:9});
 model.failSecond=true;await assert.rejects(api.savePersonalMvRating('owner',a),/synthetic interruption/);
 assert.equal(count(sql,'idol_saves'),0);assert.equal(count(sql,'idol_personal_mv_ratings'),0);model.failSecond=false;
 const results=await Promise.allSettled([a,b].map(input=>api.savePersonalMvRating('owner',input)));
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(count(sql,'idol_saves'),1);
 const next=await h.request({score:7,revision:1});model.loseReply=true;
 const done=await api.savePersonalMvRating('owner',next);assert.equal(done.revision,2);
 const retries=await Promise.all([api.savePersonalMvRating('owner',next),api.savePersonalMvRating('owner',next)]);
 assert.deepEqual(retries,[done,done]);assert.equal(count(sql,'idol_saves'),2);assert.equal(count(sql,'idol_personal_mv_ratings'),1);
});
test('two detail tabs can refresh, keep zero, and clear only the confirmed work revision',async()=>{
 const h=harness(),control=await h.api.ownControl('owner');
 const secondWork={...h.work,id:'recNeighbor'};
 h.seed('works',secondWork.id,{fldhBWXBZE:secondWork.url,fld2wy1cqw:secondWork.groupIds});
 const catalog={...h.catalog,works:[h.work,secondWork]};
 const read=id=>h.api.personalMvRatingsForOwner('owner',control,catalog,id);
 const first=await h.request(),oldDraft=await h.request({score:9});
 await h.api.savePersonalMvRating('owner',first);
 await h.api.savePersonalMvRating('owner',await h.request({workId:secondWork.id,score:7}));
 await assert.rejects(h.api.savePersonalMvRating('owner',oldDraft),bad('EDIT_CONFLICT',409));
 const refreshed=await read(h.work.id);
 assert.equal(refreshed.entries.length,1);assert.equal(refreshed.entries[0].score,0);
 await h.api.savePersonalMvRating('owner',await h.request({revision:refreshed.entries[0].revision,score:null}));
 assert.equal((await read(h.work.id)).entries[0].score,null);
 assert.equal((await read(secondWork.id)).entries[0].score,7);
 assert.equal((await read(null)).entries.length,2);
 assert.equal(count(h.sql,'idol_saves'),3);h.sql.close();
});
test('a new native relation, source revision or owner epoch between read and write wins atomically',async()=>{
 for(const race of ['snapshot','work','member','relation']){
  const h=harness(),input=await h.request();
  h.model.beforeBatch=()=>{
   if(race==='snapshot')h.sql.exec('UPDATE idol_storage_control SET epoch=epoch+1');
   else if(race==='relation')h.seed('ratings','recRace',{fld58b7Cvs:[input.workId],fldNSoSjTU:[input.memberId]});
   else h.sql.prepare("UPDATE idol_native_records SET revision='changed' WHERE record_id=?").run(race==='work'?input.workId:input.memberId);
  };
  await assert.rejects(h.api.savePersonalMvRating('owner',input),bad('EDIT_CONFLICT'));
  assert.equal(count(h.sql,'idol_saves'),0);assert.equal(count(h.sql,'idol_personal_mv_ratings'),0);
 }
});
test('the write route rejects unauthenticated, other-account and cross-origin input before opening a score',async()=>{
 const h=harness(),url='https://site.test/api/personal-mv-ratings';
 const post=(body,origin='https://site.test',contentType='application/json')=>h.api.POST(new Request(url,{method:'POST',headers:{origin,'content-type':contentType},body}));
 const body=JSON.stringify(await h.request());
 assert.equal((await post(body)).status,401);
 h.model.user={userId:'visitor',email:'visitor@example.test'};assert.equal((await post(body)).status,403);
 // Use the configured owner predicate but a synthetic partition throughout.
 h.model.user=fixtureOwner();
 assert.equal((await post(body,'https://different.test')).status,403);
 assert.equal((await post(body,'https://site.test','text/plain')).status,400);
 assert.equal((await post(' '.repeat(4100))).status,413);
 assert.equal((await post('{')).status,400);assert.equal(count(h.sql,'idol_saves'),0);
 assert.equal((await post(body)).status,200);assert.equal(count(h.sql,'idol_saves'),1);
});

test('the additive migration preserves old rows and exact journals and personal MV writes never count as stage-target writes',async()=>{
 const legacy=new DatabaseSync(':memory:'),migrations=fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort();
 for(const name of migrations.filter(f=>!f.startsWith('0011_')))legacy.exec(fs.readFileSync('drizzle/'+name,'utf8'));
 legacy.exec("INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES('s:ratings:recLegacy','s','ratings','recLegacy','{\"fld7E8yx1a\":0}','stable',1,0)");
 legacy.exec("INSERT INTO idol_saves(id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at) VALUES('previous','owner','ratings','recLegacy','legacy','done','{}','{}','{}',0,0)");
 const legacyData=()=>JSON.stringify(['idol_saves','idol_native_records'].map(table=>legacy.prepare('SELECT * FROM '+table).all()));
 const before=legacyData();legacy.exec(fs.readFileSync('drizzle/0011_personal_mv_ratings.sql','utf8'));
 assert.equal(legacyData(),before);assert.equal(count(legacy,'idol_personal_mv_ratings'),0);legacy.close();
 const h=harness();
 h.sql.prepare("UPDATE idol_native_fields SET fields_json=? WHERE table_key='works'").run(JSON.stringify([tableSchema('fld641ausT')]));
 const check=async()=>JSON.parse(Buffer.from((await h.api.stageOwnerPreflight('owner',[h.work.id])).payloadBase64,'base64').toString());
 const original=await check();await h.api.savePersonalMvRating('owner',await h.request());const latest=await check();
 assert.deepEqual(latest.works,original.works);assert.deepEqual(latest.stageVideos,original.stageVideos);
 assert.deepEqual(latest.journalCheck,{complete:true,totalRows:1,matches:[]});
 h.sql.prepare("INSERT INTO idol_saves(id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at) VALUES('stage-operation','owner','works',?,'stage','done','{}','{}','{}',1,1)").run(h.work.id);
 assert.equal((await check()).journalCheck.matches[0].record_id,h.work.id);
});

test('real downloads recover native-v2 rows and durable receipts offline and keep frozen, replaced source and former snapshot scores distinct',async()=>{
 const h=harness();h.model.user=fixtureOwner();
 const download=async()=>{const res=await h.api.downloadBackup();assert.equal(res.status,200);return res.json();};
 const original=await download();assert.equal(original.formatVersion,'idol.native-data-export.v1');assert.equal('personalMvRatings' in original,false);
 await h.api.savePersonalMvRating('owner',await h.request());
 await h.api.savePersonalMvRating('owner',await h.request({revision:1,stylingScore:8.5}));
 const newest=await download();assert.equal(newest.formatVersion,'idol.native-data-export.v2');
 const unchanged=structuredClone(newest.tables);assert.deepEqual(unchanged,original.tables);
 h.sql.exec("UPDATE idol_storage_control SET mode='frozen',epoch=2");
 assert.equal((await h.read()).writable,false);assert.equal((await h.read()).entries.length,1);
 await assert.rejects(h.api.savePersonalMvRating('owner',await h.request({revision:2,score:9})),bad('STORAGE_CHANGING'));
 assert.deepEqual((await download()).personalMvRatings,newest.personalMvRatings);
 h.sql.exec("UPDATE idol_storage_control SET mode='native',epoch=3");
 const inputs={...h.catalog,works:[{...h.work,url:'https://youtu.be/NEWvideo012'}]};
 assert.deepEqual((await h.api.personalMvRatingsForOwner('owner',await h.api.ownControl('owner'),inputs)).entries,[]);
 h.sql.exec("UPDATE idol_storage_control SET active_snapshot='another-snapshot',epoch=4");
 for(const name of ['works','ratings','members','groups'])h.sql.prepare('INSERT INTO idol_native_fields VALUES(?,?,?,?)').run('another-snapshot:'+name,'another-snapshot',name,'[]');
 assert.equal((await h.read()).entries.length,0);assert.deepEqual((await download()).personalMvRatings,newest.personalMvRatings);
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'personal-mv-native-')),input=path.join(folder,'synthetic.json'),output=path.join(folder,'restored.sqlite');
 try{
  const run=data=>{fs.writeFileSync(input,JSON.stringify(data));return child.spawnSync(process.platform==='win32'?'python':'python3',['-B','scripts/archive/restore_personal_mv_ratings.py',input,output],{encoding:'utf8'});};
  const ok=run(newest);assert.equal(ok.status,0,ok.stderr);
  const saved=new DatabaseSync(output);
  assert.deepEqual([...saved.prepare('SELECT work_id,member_id,score,styling_score,revision FROM idol_personal_mv_ratings').all()].map(r=>({...r})),
   [{work_id:h.work.id,member_id:h.member.id,score:0,styling_score:8.5,revision:2}]);assert.equal(count(saved,'saves'),2);saved.close();
  assert.notEqual(run(newest).status,0,'existing local recovery is preserved');fs.unlinkSync(output);
  for(const blob of [{...newest,personalMvRatings:[]},{...newest,journal:newest.journal.slice(1)},{...newest,personalMvRatings:[{...newest.personalMvRatings[0],score:10}]}]){
   assert.notEqual(run(blob).status,0);assert.equal(fs.existsSync(output),false);
  }
  assert.equal(run(original).status,0);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});

test('the production archive and manifest restore legacy records, private zero and every committed receipt together',async()=>{
 const {gzipSync,gunzipSync}=require('node:zlib'),{createHash}=require('node:crypto');
 const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
 for(const includePersonal of [false,true]){
  const h=harness(),id=crypto.randomUUID();
  for(const [table,ids] of Object.entries({works:['fldhBWXBZE','fld2wy1cqw'],members:['fldf1alCIu']})){
   h.sql.prepare('UPDATE idol_native_fields SET fields_json=? WHERE table_key=?').run(JSON.stringify(ids.map(tableSchema)),table);
  }
  if(includePersonal){
   await h.api.savePersonalMvRating('owner',await h.request());
   await h.api.savePersonalMvRating('owner',await h.request({revision:1,stylingScore:8.5}));
  }
  let run=await h.api.createArchive('owner',id);
  for(let i=0;i<10&&run.status!=='download-ready';i++)run=await h.api.stepArchive('owner',id);
  assert.equal(run.status,'download-ready');
  const manifest=await h.api.backupManifest('owner',id),bytes=h.blobs.get('archives/'+id+'/data.json.gz');
  assert.equal(manifest.complete,true);assert.equal(manifest.data.sha256,digest(bytes));
  const data=JSON.parse(gunzipSync(bytes));h.api.validateArchive(data);
  assert.equal(data.formatVersion,'idol.native-archive.v'+(includePersonal?'2':'1'));
  const check=async(tamper=false)=>{
   const folder=fs.mkdtempSync(path.join(os.tmpdir(),'idol-synthetic-archive-'));
   try{
    let payload=bytes,index=manifest;
    if(tamper){
     payload=gzipSync(JSON.stringify({...data,journal:data.journal.slice(1)}));
     const {manifestHash,...body}=manifest;body.data={...body.data,byteLength:payload.length,sha256:digest(payload)};
     index={...body,manifestHash:await h.api.hash(body)};
    }
    fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(index));
    fs.writeFileSync(path.join(folder,'data.json.gz'),payload);
    const result=child.spawnSync(process.platform==='win32'?'python':'python3',['-B','scripts/archive/verify_restore.py',folder],{encoding:'utf8'});
    if(tamper){assert.notEqual(result.status,0);assert.equal(fs.existsSync(path.join(folder,'restore-report.json')),false);return;}
    assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.completeBackup,true);assert.equal(report.restoredRecords,2);assert.equal(report.sqliteIntegrity,'ok');
    assert.equal(report.journalRows,includePersonal?2:0);assert.equal(report.personalMvRatings??0,includePersonal?1:0);
    const restored=new DatabaseSync(path.join(folder,'restore-verification.sqlite'));
    assert.equal(count(restored,'records'),2);assert.equal(count(restored,'saves'),report.journalRows);
    if(includePersonal)assert.deepEqual({...restored.prepare('SELECT score,styling_score,revision FROM idol_personal_mv_ratings').get()},{score:0,styling_score:8.5,revision:2});
    restored.close();
   }finally{fs.rmSync(folder,{recursive:true,force:true});}
  };
  await check();if(includePersonal)await check(true);
 }
});

test('all 51 groups give eligible members scoring controls on their own photo cards, including seven BILLIONAIRE release portraits',t=>{
 const {api}=harness(),snapshot=require('../data/snapshot.json');
 const source=api.projectCatalog(snapshot.tables,'live',snapshot.capturedAt);
 // Keep only the approved IDs, member links and public media for these renders.
 const stripped={...source,groups:source.groups.map(g=>({...g,note:''})),members:source.members.map(m=>({...m,favorite:null,note:''})),
  works:source.works.map(w=>({...w,score:null,stageScore:null,note:'',watched:''})),
  ratings:source.ratings.map(r=>({...r,score:null,stylingScore:null,note:'',memory:''}))};
 const owner={...api.projectBrowserCatalog(stripped),personalMvRatings:{scope:'a'.repeat(64),writable:true,entries:[]}};
 const guest=api.projectPublicCatalog(owner);
 const noop=()=>{},render=(work,data,canEdit,initialView='mv')=>renderToStaticMarkup(React.createElement(api.PublicAccessProvider,{canEdit},
  React.createElement(api.WorkDetail,{work,data,onMember:noop,onGroup:noop,onSaved:noop,onBack:noop,onVersion:noop,initialView})));
 const blank=()=>({works:0,placeholders:0,absent:0,missingVideo:0,existingOnly:0,canSelect:0,noExisting:0,stagePages:0});
 const groups=new Set(),placeholderGroups=new Set(),counts=blank();
 const groupCounts=new Map(owner.groups.map(group=>[group.id,{id:group.id,name:group.name,...blank()}]));
 const stageLeaks=[];
 const photoAudit={eligibleWorks:0,visibleCards:0,chosenRosterCards:0,uniqueWorkMembers:0,externalReadOnlyCredits:0,missingControl:0,missingImage:0};
 const missing=[];
 for(const [index,work] of owner.works.entries()){
  const add=key=>{counts[key]++;for(const id of new Set(work.groupIds))groupCounts.get(id)[key]++;};
  if(work.placeholder){add('placeholders');work.groupIds.forEach(id=>placeholderGroups.add(id));assert.equal(api.videoId(work.url),null);continue;}
  work.groupIds.forEach(id=>groups.add(id));add('works');
  const absent=!!api.mvMemberAbsence(work),hasVideo=!!api.videoId(work.url);
  const previous=owner.ratings.filter(r=>r.workIds.includes(work.id));
  const existing=new Set(previous.flatMap(row=>row.memberIds));
  const exactGuest=require('../data/public-work-credits.json').records.find(c=>c.workId===work.id&&c.videoId===api.videoId(work.url)&&work.groupIds.includes(c.groupId)&&c.kind==='named_artist_credit');
  const eligible=owner.members.filter(m=>(exactGuest?.memberIds.includes(m.id)||work.groupIds.some(id=>m.groupIds.includes(id)||m.formerGroupIds?.includes(id)))&&!existing.has(m.id));
  const canChoose=!absent&&hasVideo&&eligible.length>0;
  const privatePage=render(work,owner,true),publicPage=render(guest.works[index],guest,false);
  if(!absent&&hasVideo){
   photoAudit.eligibleWorks++;
   const pictures=parse(privatePage),picker=pictures.querySelector('.personal-mv-picker select');
   const choices=picker?picker.querySelectorAll('option[value]').map(el=>el.getAttribute('value')).filter(Boolean):[];
   const eligibleIds=new Set([...eligible.map(m=>m.id),...existing]);
   const initialCards=pictures.querySelectorAll('[data-photo-member]').filter(card=>{
    if(eligibleIds.has(card.getAttribute('data-photo-member')))return true;
    // A public collaborator may be outside this work's owner-write roster.
    assert.equal(card.querySelector('.credit-score-action,.editor-open'),null);
    photoAudit.externalReadOnlyCredits++;
    return false;
   });
   const memberIds=new Set(initialCards.map(card=>card.getAttribute('data-photo-member')));
   assert.deepEqual(new Set(choices),new Set(eligible.filter(m=>!memberIds.has(m.id)).map(m=>m.id)),work.id);
   assert.deepEqual(new Set([...choices,...memberIds]),new Set([...eligible.map(m=>m.id),...existing]),work.id);
   // A saved synthetic zero renders the same roster-photo card used after a selection.
   const entries=choices.map(memberId=>({workId:work.id,videoId:api.videoId(work.url),memberId,score:0,stylingScore:null,revision:1}));
   const allCards=entries.length?parse(render(work,{...owner,personalMvRatings:{...owner.personalMvRatings,entries}},true)):pictures;
   const extraCards=allCards.querySelectorAll('[data-roster-score-member]');
   assert.equal(extraCards.length,choices.length);
   for(const card of [...initialCards,...extraCards]){
    const memberId=card.getAttribute('data-photo-member')??card.getAttribute('data-roster-score-member');
    if(!card.querySelector('.credit-score-action,.editor-open')){photoAudit.missingControl++;missing.push([work.id,memberId,'action']);}
    if(!card.querySelector('img[src]')){photoAudit.missingImage++;missing.push([work.id,memberId,'portrait']);}
   }
   for(const card of extraCards)assert.match(card.text,/成员资料照.*表现 0/);
   photoAudit.visibleCards+=initialCards.length;photoAudit.chosenRosterCards+=extraCards.length;photoAudit.uniqueWorkMembers+=new Set([...choices,...memberIds]).size;
  }
  assert.equal(/添加成员评分|class="credit-score-action"/.test(publicPage),false,work.id);
  assert.equal(/公开原发行阵容|人工看片确认的MV出镜成员|这里不提供成员评分|既有具名照片|个人评分记录待补|exclusive_performance_video|ost_promotion_video/.test(privatePage+publicPage),false,work.id);
  if(absent){add('absent');assert.equal(privatePage.includes('class="credit-score-action"'),false,work.id);}
  else if(!hasVideo)add('missingVideo');else if(canChoose)add('canSelect');else add('existingOnly');
  if(!previous.length)add('noExisting');
  if(work.stage||work.stageSupplement){
   const stagePage=render(guest.works[index],guest,false,'stage');
   if(/新鲜owner|完整[0-9]*条?保存日志|代理未独立|私人写入|本轮未找到/.test(stagePage))stageLeaks.push(work.id);
   add('stagePages');
  }
  if(work.id==='rec28ldfRTrLku'){
   assert.equal(previous.length,0);assert.equal(eligible.length,7);
   assert.equal((privatePage.match(/class="credit-score-action"/g)||[]).length,7);
   assert.equal(privatePage.includes('添加成员评分'),false);
   for(const card of parse(privatePage).querySelectorAll('[data-photo-member]')){
    const action=card.querySelector('[data-score-kind="personal"]');
    assert.equal(action.getAttribute('data-score-member'),card.getAttribute('data-photo-member'));
    assert.ok(card.querySelector('img[src]')&&action.querySelector('button[aria-expanded="false"]'));
   }
   assert.equal((publicPage.match(/class="mv-identity-frame"/g)||[]).length,7);
   assert.ok(privatePage.includes('《DRIP》发行阵容')&&publicPage.includes('《DRIP》发行阵容'));
   assert.equal(privatePage.includes('MV 出镜成员'),false);
  }
 }
 assert.deepEqual(stageLeaks,[]);assert.equal(groups.size,50);assert.equal(new Set([...groups,...placeholderGroups]).size,51);assert.equal(owner.works.length,614);
 if(process.env.IDOL_MV_COVERAGE_PATH){
  const output=path.resolve(process.env.IDOL_MV_COVERAGE_PATH);
  const report={snapshotCapturedAt:snapshot.capturedAt,groupCount:groupCounts.size,catalogWorks:owner.works.length,
   scope:'Local React server render with public identities, synthetic owner scope, and cleared personal values. Multi-group works count once globally and once per listed group.',
   mvDetailRenders:2*counts.works,stageDetailRenders:counts.stagePages,publicCreditRecords:require('../data/public-work-credits.json').records.length,
   existingRelationshipCount:owner.ratings.length,workCounts:counts,photoAudit,groups:[...groupCounts.values()]};
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 }
 t.diagnostic('Rendering counts '+JSON.stringify({counts,photoAudit,missing:missing.slice(0,20)}));
 assert.equal(photoAudit.eligibleWorks,599);assert.equal(photoAudit.missingControl,0);assert.equal(photoAudit.missingImage,0);
});
