const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),esbuild=require('esbuild');
const source=esbuild.buildSync({stdin:{contents:`export * from './lib/idol/ifeye-native'; export * from './lib/idol/ifeye-runtime/model.mjs';export {readIfeyeNavigationFocus,restoreIfeyeNavigationFocus} from './lib/idol/ifeye-runtime/host.mjs'; export {safeArtistReturn} from './lib/idol/artist-navigation';export {routeUrl} from './lib/idol/journey';export {projectCatalog} from './lib/idol/catalog';export {projectArtistCatalog} from './lib/idol/artist-catalog';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+source+'\n})')(name=>name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name),mod,mod.exports);
const api=mod.exports,design=api.design,snapshot=require('../data/snapshot.json');
const actual=api.projectArtistCatalog(api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt),design.group.id),clone=()=>structuredClone(actual);
const videoHash=v=>'#/works?type='+(v.type==='MV'?'mv':'stage')+'&detail='+encodeURIComponent(v.key);
const request=v=>({action:'open-rating',groupId:design.group.id,workId:v.id,videoId:v.videoId,videoType:v.videoType,slotType:v.type,returnTo:videoHash(v)});
const services=c=>({bindings:api.ifeyeNativeBindings(c),routeUrl:api.routeUrl,safeArtistReturn:api.safeArtistReturn});
const mv=design.works.find(v=>v.type==='MV'),stage=design.works.find(v=>v.type==='STAGE');


test('ten original images keep exact bytes and identity; resolver rejects altered metadata',()=>{
 const assets=require('../data/ifeye-assets.json');assert.equal(assets.length,10);
 for(const a of assets){const b=fs.readFileSync('public'+a.url);assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);
 const ctx={slug:'ifeye',groupId:design.group.id,identity:a};assert.deepEqual(api.ifeyeAssetResolver({},ctx),a);
 for(const key of ['assetKey','groupId','sha256','bytes','width','height'])assert.equal(api.ifeyeAssetResolver({},{...ctx,identity:{...a,[key]:typeof a[key]==='number'?a[key]+1:'wrong'}}),null);}
});
test('six members and all seven exact video slots connect without changing user records',()=>{
 const before=JSON.stringify(actual);assert.equal(api.validIfeyeCatalog(actual),true);assert.equal(api.ifeyeNativeBindings(actual).length,13);
 for(const m of design.members){assert.ok(api.boundIfeyeMember(actual,m.id));assert.ok(api.nativeHref(design,{action:'open-member',groupId:design.group.id,memberId:m.id,returnTo:'#/person/'+m.id},services(actual)));}
 for(const v of design.works){assert.ok(api.boundIfeyeWork(actual,v));const href=api.nativeHref(design,request(v),services(actual));assert.ok(href,v.key);const u=new URL(href,'https://test.invalid');assert.equal(u.searchParams.get('work'),v.id);assert.equal(u.searchParams.get('video'),v.type==='STAGE'?'stage':null);assert.equal(u.searchParams.get('returnTo'),api.artistUrl(design,videoHash(v)));}
 assert.equal(JSON.stringify(actual),before);
});
test('ifeye type filters and every finite route round-trip with exact IDs and search',()=>{
 const hashes=['#/home','#/members?q=Kasia','#/works?type=release&q=As','#/works?type=mv&q=ok','#/works?type=stage','#/timeline',...design.members.map(m=>'#/person/'+m.id),...design.releases.map(r=>'#/works?type=release&detail='+encodeURIComponent(r.key)),...design.works.map(videoHash),...design.events.map(e=>'#/timeline?event='+e.id)];
 for(const hash of hashes){const url=api.artistUrl(design,hash);assert.ok(url,hash);assert.ok(api.safeArtistReturn(url),url);assert.equal(api.artistUrl(design,api.readReviewUrl(design,url)),url);}
 const detail=videoHash(mv)+'&q=NERDY&return='+encodeURIComponent('#/works?type=mv&q=NERDY'),url=api.artistUrl(design,detail);assert.ok(api.readReviewUrl(design,url).includes('return='));
 for(const value of ['https://evil.invalid/artists/ifeye','/artists/izna','/artists/ifeye?section=works&format=stage&media='+mv.key,'/artists/ifeye?section=members&member=recUnknown','/artists/ifeye?section=members&q='+('x'.repeat(201))])assert.equal(api.readReviewUrl(design,value),null);
});
test('ambiguous records, wrong exact versions and unbound stages fail closed',()=>{
 for(const change of [c=>c.works.push({...c.works[0]}),c=>c.works[0].url='https://example.com',c=>c.works[0].videoType='other',c=>c.groups[0].id='recOther']){const c=clone();change(c);assert.equal(api.boundIfeyeWork(c,mv),null);}
 const c=clone();c.works.find(w=>w.id===stage.id).stage.scoreBinding=null;assert.equal(api.nativeHref(design,request(stage),services(c)),null);assert.ok(api.nativeHref(design,{...request(stage),action:'open-work'},services(c)));
 for(const r of design.releases)assert.equal(api.nativeHref(design,{action:'open-release',groupId:design.group.id,releaseKey:r.key,returnTo:'#/works?type=release'},services(actual)),null);
});
test('nine public cast links and six existing notebook pairs stay distinct; Hazy stays partial and stages remain unassigned',()=>{
 assert.equal(design.members.length,6);assert.equal(design.releases.length,3);assert.equal(design.works.length,7);
 assert.equal(design.works.reduce((n,v)=>n+api.ifeyeVideoMemberIds(actual,v).length,0),6);
 const hazy=design.works.find(v=>v.videoId==='e-bwzm8-xnU');assert.equal(hazy.participantStatus,'partial');assert.equal(api.ifeyeVideoMemberIds(actual,hazy).length,0);
 assert.deepEqual(api.ifeyeVideoMemberIds(actual,mv),[]);for(const v of design.works.filter(v=>v.type==='STAGE'))assert.deepEqual(api.ifeyeVideoMemberIds(actual,v),[]);
 const c=clone(),ruok=design.works.find(v=>v.videoId==='tGMy0z1akLs'),pair=c.ratings.find(r=>r.workIds[0]===ruok.id);c.ratings.push({...pair,id:'recDuplicatePair'});assert.ok(!api.ifeyeVideoMemberIds(c,ruok).includes(pair.memberIds[0]));
 assert.equal(design.publicContent.members.recvxAPQCFuwFz.status,'');assert.ok(design.events.find(e=>e.id==='e-ifeye-sasha-return-plan').announcementDate);assert.equal(design.events.find(e=>e.id==='e-ifeye-sasha-return-plan').eventDate,null);
});
test('cross-document return focus stays within exact native action and public route',()=>{
 const route=videoHash(mv),url=api.artistUrl(design,route),value={url,route,y:300,focus:{kind:'native',value:'open-rating'}};
 assert.deepEqual(api.publicPosition(design,value,url),value);assert.equal(api.publicPosition(design,{...value,note:'private'},url),null);
 let focused;const main={focus:()=>focused='main'},button={dataset:{ifeyeNativeFocus:'open-rating'},disabled:false,closest:()=>null,focus:()=>focused='rating'};
 const root={ownerDocument:{activeElement:{shadowRoot:{activeElement:button}}},contains:n=>n===button,querySelectorAll:()=>[button],querySelector:()=>main};
 assert.deepEqual(api.readIfeyeNavigationFocus(root),value.focus);assert.equal(api.restoreIfeyeNavigationFocus(root,value.focus),true);assert.equal(focused,'rating');button.disabled=true;assert.equal(api.restoreIfeyeNavigationFocus(root,value.focus),false);
});
