const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const design=require('../data/wooah-editorial.json');
// Bundle the real projection, page and routing helpers in memory. No DB, network,
// save API, fixture import into storage, or emitted bundle is involved.
const source=esbuild.buildSync({stdin:{contents:`export * from './lib/idol/wooah-editorial'; export * from './lib/idol/wooah-return-focus'; export * from './lib/idol/wooah-timeline'; export {projectCatalog} from './lib/idol/catalog'; export {projectArtistCatalog} from './lib/idol/artist-catalog'; export {default as Page,readWooahTimelineOrigin} from './components/wooah/editorial'; export {ArtistTimelineHostProvider} from './components/artist-timeline-host'; export {PublicAccessProvider} from './components/public-access';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};
vm.runInThisContext('(function(require,module,exports){'+source+'\n})')(name=>name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name),mod,mod.exports);
const api=mod.exports,snapshot=require('../data/snapshot.json');
const actual=api.projectArtistCatalog(api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt),design.groupId);
const synthetic=JSON.parse(fs.readFileSync('../../handoffs/codex-20261022/combined-integration/tests/fixtures/wooah.synthetic-catalog.json','utf8'));
const route=patch=>api.wooahRouteUrl({...api.emptyWooahRoute,...patch});
const memberRoute=member=>route({section:'members',member:member.id});
const videoRoute=video=>route({section:'works',media:video.key,format:video.kind});
const releaseRoute=release=>route({section:'works',release:release.key});
const mv=design.videos.find(v=>v.kind==='mv'),stage=design.videos.find(v=>v.kind==='stage'),nana=design.members.find(m=>m.name==='NANA'),songyee=design.members.find(m=>m.name==='SONGYEE');
const pair=(id='recSyntheticOne',member=nana.id,work=mv.workId)=>({id,memberIds:[member],workIds:[work]});
function render(path,data=synthetic,{canEdit=false,loading=false,error=''}={}){
 return renderToStaticMarkup(React.createElement(api.PublicAccessProvider,{canEdit},React.createElement(api.ArtistTimelineHostProvider,{value:{catalog:data,loading,error,serverRoute:path}},React.createElement(api.Page))));
}

test('all six member IDs and 24 exact videos bind to the current snapshot without modifying records',()=>{
 const before=JSON.stringify(actual);
 assert.equal(api.validWooahCatalog(actual),true);
 assert.equal(design.videos.filter(v=>v.kind==='mv').length,14);
 assert.equal(design.videos.filter(v=>v.kind==='stage').length,10);
 for(const member of design.members){assert.ok(api.boundWooahMember(actual,member.id));const href=api.wooahMemberRecordHref(actual,member,memberRoute(member));assert.ok(href);const u=new URL(href,'https://test.invalid');assert.equal(u.searchParams.get('member'),member.id);assert.equal(u.searchParams.get('returnTo'),memberRoute(member));}
 for(const video of design.videos){assert.ok(api.boundWooahWork(actual,video));const href=api.wooahRecordHref(actual,video,videoRoute(video));assert.ok(href);const u=new URL(href,'https://test.invalid');assert.equal(u.searchParams.get('work'),video.workId);assert.equal(u.searchParams.get('video'),video.kind==='stage'?'stage':null);assert.equal(u.searchParams.get('returnTo'),videoRoute(video));}
 assert.deepEqual(api.boundWooahMember(actual,songyee.id).groupIds,[]);
 assert.ok(api.boundWooahMember(actual,songyee.id).formerGroupIds.includes(design.groupId));
 assert.equal(JSON.stringify(actual),before);
});

test('bidirectional MV relations retain six debut members, five later members and only one SONGYEE work',()=>{
 const before=JSON.stringify(actual);
 for(const member of design.members){const videos=api.wooahMemberVideos(actual,member.id);assert.equal(videos.length,member.historical?1:11);for(const video of videos){assert.equal(video.kind,'mv');assert.ok(api.wooahVideoMembers(actual,video).some(m=>m.id===member.id));}}
 assert.equal(api.wooahVideoMembers(actual,mv).length,6);
 assert.deepEqual(api.wooahMemberVideos(actual,songyee.id).map(v=>v.key),[mv.key]);
 const counts=design.videos.filter(v=>v.kind==='mv').map(v=>api.wooahVideoMembers(actual,v).length);
 assert.equal(counts.filter(n=>n===5).length,10);assert.equal(counts.filter(n=>n===0).length,3);
 for(const video of design.videos.filter(v=>v.kind==='stage'))assert.deepEqual(api.wooahVideoMembers(actual,video),[]);
 assert.equal(JSON.stringify(actual),before);
});

test('mixed, malformed, unknown and duplicate relations never infer participation',()=>{
 const copy=()=>structuredClone(synthetic);
 const invalid=[null,{},pair('',nana.id),pair('bad-id',nana.id),{...pair(),memberIds:[nana.id,songyee.id]},{...pair(),workIds:[mv.workId,'recForeign']},{...pair(),memberIds:nana.id},{...pair(),workIds:null},pair('recUnknownMember','recMissing'),pair('recUnknownWork',nana.id,'recMissing')];
 for(const row of invalid){const c=copy();c.ratings=[row];assert.deepEqual(api.wooahVideoMembers(c,mv),[]);assert.deepEqual(api.wooahMemberVideos(c,nana.id),[]);}
 for(const rows of [[pair(),pair()],[pair(),pair('recSecond')],[pair(),{...pair(),memberIds:[songyee.id]}],[pair(),{id:'recSyntheticOne'}]]){const c=copy();c.ratings=rows;assert.deepEqual(api.wooahVideoMembers(c,mv),[]);}
 const c=copy();c.ratings=[pair(),null,{id:'recUnrelated',memberIds:null,workIds:null}];assert.deepEqual(api.wooahVideoMembers(c,mv).map(m=>m.id),[nana.id]);
 c.members.push({...c.members.find(m=>m.id===nana.id)});assert.deepEqual(api.wooahVideoMembers(c,mv),[]);assert.equal(api.wooahMemberRecordHref(c,nana,memberRoute(nana)),null);
});

test('unknown video descriptors, duplicate native identities and wrong sources disable record links and relations',()=>{
 for(const changed of [{...mv,key:'unknown'},{...mv,url:'https://example.com'},{...mv,videoId:'aaaaaaaaaaa'},{...mv,workId:'recMissing'}]){assert.equal(api.boundWooahWork(actual,changed),null);assert.deepEqual(api.wooahVideoMembers(actual,changed),[]);}
 const mutators=[c=>c.works.push({...c.works.find(w=>w.id===mv.workId)}),c=>c.works.push({...c.works.find(w=>w.id===mv.workId),id:'recDuplicateVideo'}),c=>c.works.find(w=>w.id===mv.workId).groupIds=['recForeign'],c=>c.works.find(w=>w.id===mv.workId).url='https://www.youtube.com/watch?v=aaaaaaaaaaa',c=>c.groups[0].id='recForeign'];
 for(const mutate of mutators){const c=structuredClone(synthetic);c.ratings=[pair()];mutate(c);assert.equal(api.boundWooahWork(c,mv),null);assert.equal(api.wooahRecordHref(c,mv,videoRoute(mv)),null);assert.deepEqual(api.wooahVideoMembers(c,mv),[]);}
 for(const mutate of [c=>c.works.find(w=>w.id===stage.workId).stage.videoId='aaaaaaaaaaa',c=>c.works.find(w=>w.id===stage.workId).stage.url='https://www.youtube.com/watch?v=aaaaaaaaaaa',c=>c.works.find(w=>w.id===stage.workId).stage.clip={startSeconds:0,endSeconds:10,sourceDurationSeconds:20}]){const c=structuredClone(synthetic);mutate(c);assert.equal(api.boundWooahWork(c,stage),null);}
});

test('zero, null and decimal scores remain independent for MV/stage; unbound stage scores never enter queues',()=>{
 const c=structuredClone(synthetic),work=c.works.find(w=>w.id===mv.workId);
 work.score=0;work.stageScore=9.1;work.watched='已观看';
 assert.equal(api.wooahVideoScore(c,mv),0);assert.equal(api.wooahVideoScore(c,stage),9.1);
 assert.equal(api.wooahVideoInQueue(c,mv,'rewatch'),false);assert.equal(api.wooahVideoInQueue(c,stage,'rewatch'),true);
 work.score=null;assert.equal(api.wooahVideoScore(c,mv),null);assert.equal(api.wooahVideoInQueue(c,mv,'unrated'),true);
 work.stage.scoreBinding=null;assert.equal(api.wooahVideoScore(c,stage),null);for(const queue of ['tonight','rewatch','unrated'])assert.equal(api.wooahVideoInQueue(c,stage,queue),false);
 work.stageScore=NaN;assert.equal(api.validWooahCatalog(c),false);
});

test('finite return/focus routes preserve query context and reject foreign or conflicting destinations',()=>{
 const origin=route({section:'works',format:'mv',queue:'unrated',search:'woo!ah!'}),destination=videoRoute(mv);
 const focus={path:origin,href:destination,key:'media-title:'+mv.key};assert.deepEqual(api.readWooahLinkFocus(focus,origin),focus);
 const memberFocus={path:destination,href:memberRoute(songyee),key:'member:'+songyee.id};assert.deepEqual(api.readWooahLinkFocus(memberFocus,destination),memberFocus);
 for(const value of ['https://example.com','//example.com','/artists/genblue','/artists/wooah?section=members&member=recMissing','/artists/wooah?section=works&format=stage&media='+mv.key,'/artists/wooah?section=works&section=members','/artists/wooah#fragment','/artists/wooah?unsupported=1']){assert.equal(api.readWooahRoute(value),null);assert.equal(api.wooahRecordHref(synthetic,mv,value),null);}
 assert.equal(api.readWooahLinkFocus({...focus,key:'member:'+songyee.id},origin),null);
 assert.equal(api.readWooahLinkFocus({...focus,href:'/artists/genblue'},origin),null);
 const timeline=route({section:'updates'});
 for(const event of api.wooahTimelineEvents()){
  const release=api.wooahTimelineRelease(event.id),media=api.wooahTimelineMedia(event.id),target=release??media;if(!target)continue;
  const value={path:timeline,eventId:event.id,targetKind:release?'release':'media',targetKey:target.key};assert.deepEqual(api.readWooahTimelineOrigin(value,timeline),value);
  assert.equal(api.readWooahTimelineOrigin({...value,targetKey:'unknown'},timeline),null);
  if(release)assert.deepEqual(api.readWooahTimelineOrigin({path:timeline,eventId:event.id,releaseKey:release.key},timeline),value);
 }
 assert.equal(api.readWooahTimelineOrigin({path:timeline,eventId:'missing',targetKind:'media',targetKey:mv.key},timeline),null);
});

test('49 real React route states render independently with synthetic data and existing native destinations',()=>{
 const routes=[...['overview','members','works','records','updates'].map(section=>route({section})),...design.members.map(memberRoute),...design.releases.map(releaseRoute),...design.videos.map(videoRoute),...['mv','stage'].flatMap(format=>['tonight','rewatch','unrated'].map(queue=>route({section:'works',format,queue})))];
 assert.equal(routes.length,49);
 for(const path of routes){const html=render(path);assert.ok(html.includes('data-artist="wooah"'));assert.ok(!html.includes('这个页面地址暂不可用'));assert.ok(!html.includes('时间轴暂时无法显示'));}
 const home=render(route({}));for(const member of design.members)assert.ok(home.includes(member.displayName));
 const c=structuredClone(synthetic);c.ratings=[pair(),pair('recSyntheticSongyee',songyee.id)];
 const memberHtml=render(memberRoute(songyee),c),mvHtml=render(videoRoute(mv),c);
 assert.ok(memberHtml.includes('data-member-mv-id="'+songyee.id+'"'));assert.ok(memberHtml.includes('media-title:'+mv.key));
 assert.ok(mvHtml.includes('data-mv-members="'+mv.key+'"'));assert.ok(mvHtml.includes('member:'+songyee.id));
 assert.ok(!render(videoRoute(stage),c).includes('data-mv-members='));
 assert.ok(mvHtml.includes('查看作品记录'));assert.ok(render(videoRoute(mv),c,{canEdit:true}).includes('打开评分与观看记录'));
 const release=render(releaseRoute(design.releases[0]),c);assert.ok(!release.includes('/?view=works'));assert.ok(!release.includes('打开评分与观看记录'));
});

test('failed/foreign/malformed catalog keeps editorial pages and recovery available without borrowed records',()=>{
 for(const data of [null,{},[],{...synthetic,groups:[{id:'recForeign'}]},{...synthetic,works:[null]}]){
  const html=render(videoRoute(mv),data,{error:'读取暂时失败'});assert.ok(html.includes('重新读取'));assert.ok(html.includes('前往官方视频'));assert.ok(html.includes('评分与观看记录入口暂不可用'));assert.ok(!html.includes('href="/?view=works'));
 }
 const malformed=structuredClone(synthetic);malformed.ratings=[null,{}, {memberIds:null,workIds:null}];const html=render(memberRoute(nana),malformed);assert.ok(html.includes('暂无已确认的成员 MV 关联。'));
 assert.ok(render('/artists/wooah?section=members&member=recMissing').includes('这个页面地址暂不可用'));
});
