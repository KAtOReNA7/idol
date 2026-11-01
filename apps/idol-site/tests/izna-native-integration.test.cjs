const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),esbuild=require('esbuild');
const source=esbuild.buildSync({stdin:{contents:`export * from './lib/idol/izna-native'; export * from './lib/idol/izna-runtime/model.mjs';export {readIznaNavigationFocus,restoreIznaNavigationFocus} from './lib/idol/izna-runtime/host.mjs'; export {safeArtistReturn} from './lib/idol/artist-navigation';export {routeUrl} from './lib/idol/journey';export {projectCatalog} from './lib/idol/catalog';export {projectArtistCatalog} from './lib/idol/artist-catalog';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+source+'\n})')(name=>name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name),mod,mod.exports);
const api=mod.exports,design=api.design,snapshot=require('../data/snapshot.json');
const actual=api.projectArtistCatalog(api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt),design.group.id),clone=()=>structuredClone(actual);
const videoHash=v=>'#/works?kind='+v.type+'&detail='+encodeURIComponent(v.key);
const request=v=>({action:'open-rating',groupId:design.group.id,workId:v.id,videoId:v.videoId,videoType:v.videoType,slotType:v.type,returnTo:videoHash(v)});
const services=c=>({bindings:api.iznaNativeBindings(c),routeUrl:api.routeUrl,safeArtistReturn:api.safeArtistReturn});
const mv=design.works.find(v=>v.type==='MV'),stage=design.works.find(v=>v.type==='STAGE');

test('all 20 original assets retain exact bytes and strict group/size/digest resolver identity',()=>{
 const assets=require('../data/izna-assets.json');assert.equal(assets.length,20);
 for(const asset of assets){const bytes=fs.readFileSync('public'+asset.url);assert.equal(bytes.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  const context={slug:'izna',groupId:design.group.id,identity:asset};assert.deepEqual(api.iznaAssetResolver({},context),asset);
  for(const key of ['assetKey','groupId','sha256','bytes','width','height'])assert.equal(api.iznaAssetResolver({},{...context,identity:{...asset,[key]:typeof asset[key]==='number'?asset[key]+1:'wrong'}}),null);
 }
 assert.equal(assets.filter(a=>a.url.includes('/native-v3/')).length,12);
});
test('candidate source stays byte-exact outside the approved opening, public information, and original-asset metadata',()=>{
 const base='../../handoffs/codex-20261022/astra-izna-ifeye-v3/source';
 const read=(file,current)=>fs.readFileSync(current?'lib/idol/izna-runtime/'+file:base+'/lib/idol/design-review/astra-izna-ifeye-runtime/'+file,'utf8');
 assert.equal(read('focus.mjs',true),read('focus.mjs',false));
 function unchangedRuntime(source){
  for(const prefix of ['const assetQualityPolicies=Object.freeze([','const canonicalAssetIdentityRows=Object.freeze([']){
   const start=source.indexOf(prefix)+prefix.length,end=source.indexOf('},{',start)+1,row=JSON.parse(source.slice(start,end));
   assert.equal(row.slug,'izna');assert.ok(['groups/izna/assets/hero.jpg','groups/izna/assets/group-original.png'].includes(row.key||row.assetKey));
   source=source.slice(0,start)+'IZNA_HERO_METADATA'+source.slice(end);
  }
  return source;
 }
 assert.equal(unchangedRuntime(read('runtime.mjs',true)),unchangedRuntime(read('runtime.mjs',false)));
 function unchangedRenderer(source,current){
  if(current){const importLine="import {nativeMvImage,nativeMvCoverHtml} from '../native-mv-cover.mjs';\n";assert.ok(source.startsWith(importLine));source=source.replace(importLine,'');assert.ok(source.includes('image:displayAsset(nativeMvImage(row))'));source=source.replace('image:displayAsset(nativeMvImage(row))','image:displayAsset(row.image)');const coverLine='  const cover=nativeMvCoverHtml(asset,alt,kind,eager);if(cover)return cover;\n';assert.ok(source.includes(coverLine));source=source.replace(coverLine,'');}
  if(current){const review=JSON.parse(fs.readFileSync('../../docs/codex/evidence/20261029-member-layout/native-movement.json')).find(r=>r.file.endsWith('/izna.mjs'));const start=source.indexOf(' function person('),end=source.indexOf('\n function ',start+1);assert.equal(crypto.createHash('sha256').update(source.slice(start,end)).digest('hex'),review.reviewedPersonSha256);source=source.slice(0,start)+review.previousPersonFunction+source.slice(end);}
  if(current){assert.ok(source.startsWith("import {renderGroupInformation} from '../group-information.mjs';\n"));source=source.replace("import {renderGroupInformation} from '../group-information.mjs';\n",'');assert.ok(source.includes('return {group,accounts:raw.publicAccounts??[],'));source=source.replace('return {group,accounts:raw.publicAccounts??[],','return {group,');}
  if(current){const helper=source.indexOf(' // The separate text control'),end=source.indexOf(' function home(){',helper);assert.ok(helper>0&&end>helper);source=source.slice(0,helper)+source.slice(end);}
  const hero=source.indexOf(current?'<section class="home-hero"':'<section class="night-hero"'),chapter=source.indexOf('<section class="chapter home-members">',hero);assert.ok(hero>0&&chapter>hero);
  source=source.slice(0,hero)+'APPROVED_HOME_HERO'+source.slice(chapter);
  const header=source.indexOf(current?"${page==='home'?`":'<header class="site-header">',source.indexOf(' function renderPage()'));
  const end=source.indexOf(current?'</header>`}':'</header>',header)+(current?11:9);assert.ok(header>0&&end>header);
  return source.slice(0,header)+'APPROVED_HOME_HEADER'+source.slice(end);
 }
 assert.equal(unchangedRenderer(read('izna.mjs',true),true),unchangedRenderer(read('izna.mjs',false),false));
 const oldCss=fs.readFileSync(base+'/public/design-review/astra/izna.css','utf8'),css=fs.readFileSync('public/artist/izna/native-v3/izna.css','utf8');
 assert.equal(css.slice(0,oldCss.length),oldCss);
 const addedCss=css.slice(oldCss.length).replace(/\/\*[\s\S]*?\*\//g,'').trim();assert.ok(addedCss);
 for(const rule of addedCss.split('}').filter(rule=>rule.trim()))for(const selector of rule.split('{')[0].split(','))assert.match(selector.trim(),/^\[data-astra-group="izna"\](?:\[data-astra-max-width~="767"\])? \.home-/);
});
test('7 members and 15 exact video slots bind to the current catalog without changing records',()=>{
 const before=JSON.stringify(actual);assert.equal(api.validIznaCatalog(actual),true);assert.equal(api.iznaNativeBindings(actual).length,22);
 for(const m of design.members){assert.ok(api.boundIznaMember(actual,m.id));const ret='#/person/'+m.id;const href=api.nativeHref(design,{action:'open-member',groupId:design.group.id,memberId:m.id,returnTo:ret},services(actual));const u=new URL(href,'https://test.invalid');assert.equal(u.searchParams.get('member'),m.id);assert.equal(u.searchParams.get('returnTo'),api.artistUrl(design,ret));}
 for(const v of design.works){assert.ok(api.boundIznaWork(actual,v));const href=api.nativeHref(design,request(v),services(actual));assert.ok(href);const u=new URL(href,'https://test.invalid');assert.equal(u.searchParams.get('work'),v.id);assert.equal(u.searchParams.get('video'),v.type==='STAGE'?'stage':null);assert.equal(u.searchParams.get('returnTo'),api.artistUrl(design,videoHash(v)));}
 assert.equal(JSON.stringify(actual),before);
});
test('all finite public pages round trip and retain search, exact member/video/release and event identity',()=>{
 const hashes=['#/home','#/members?q=%E8%8C%89','#/works?kind=release&q=N%2Fa','#/works?kind=MV&q=IZNA','#/timeline',...design.members.map(m=>'#/person/'+m.id),...design.releases.map(r=>'#/works?kind=release&detail='+encodeURIComponent(r.key)),...design.works.map(videoHash),...design.events.map(e=>'#/timeline?event='+e.id)];
 for(const hash of hashes){const url=api.artistUrl(design,hash);assert.ok(url);assert.ok(api.safeArtistReturn(url));assert.equal(api.artistUrl(design,api.readReviewUrl(design,url)),url);}
 assert.equal(api.readReviewUrl(design,'/artists/izna?section=members&member='+design.members[0].id),'#/person/'+design.members[0].id);
 const filtered=videoHash(mv)+'&q=IZNA&return='+encodeURIComponent('#/works?kind=MV&q=IZNA');const href=api.nativeHref(design,{...request(mv),returnTo:filtered},services(actual));assert.ok(new URL(href,'https://test.invalid').searchParams.get('returnTo').includes('q=IZNA'));
});
test('foreign, ambiguous, conflicting and unbounded routes fail closed without widening shared sanitizer',()=>{
 for(const value of ['https://evil.invalid/artists/izna','//evil.invalid','/artists/ifeye','/artists/izna/index.html','/artists/izna#/home','/artists/izna?section=works&section=members','/artists/izna?section=members&member=recUnknown','/artists/izna?section=works&release=unknown','/artists/izna?section=works&format=stage&media='+mv.key,'/artists/izna?section=works&format=mv&release='+design.releases[0].key,'/artists/izna?section=overview&member='+design.members[0].id,'/artists/izna?section=updates&event=unknown','/artists/izna?section=members&q='+('x'.repeat(201))])assert.equal(api.readReviewUrl(design,value),null,value);
 assert.equal(api.safeArtistReturn('/artists/izna#/home'),null);assert.equal(api.safeArtistReturn('/artists/ifeye?media='+mv.key),null);
});
test('cross-document native returns retain the bounded public origin and copied detail URLs retain search',()=>{
 const origin='#/works?kind=MV&q=Mamma',detail=videoHash(mv)+'&return='+encodeURIComponent(origin),url=api.artistUrl(design,detail);
 assert.equal(new URL(url,'https://site.invalid').searchParams.get('q'),'Mamma');
 const rebuilt=api.readReviewUrl(design,url);assert.equal(new URL(rebuilt.slice(1),'https://site.invalid').searchParams.get('return'),origin);
 const focus={kind:'href',value:api.artistUrl(design,origin)},position={url,route:detail,y:450,focus};
 assert.deepEqual(api.publicPosition(design,JSON.parse(JSON.stringify(position)),url),position);
 assert.deepEqual(api.publicPosition(design,position,api.safeArtistReturn(url)),position);
 for(const action of ['open-member','open-work','open-rating']){const nativePosition={...position,focus:{kind:'native',value:action}};assert.deepEqual(api.publicPosition(design,nativePosition,url),nativePosition);}
 for(const action of ['open-release','delete','save','https://evil.invalid'])assert.equal(api.publicPosition(design,{...position,focus:{kind:'native',value:action}},url).focus,null);
 for(const invalid of [{...position,route:'#/home'},{...position,url:'/artists/ifeye'},{...position,y:-1},{...position,note:'private'},{...position,route:detail+'&credentials=x'}])assert.equal(api.publicPosition(design,invalid,url),null);
 const member='#/person/'+design.members[0].id+'?return='+encodeURIComponent('#/members?q=MAI');const memberUrl=api.artistUrl(design,member);
 assert.equal(api.safeArtistReturn(memberUrl),memberUrl);assert.equal(new URL(api.readReviewUrl(design,memberUrl).slice(1),'https://site.invalid').searchParams.get('return'),'#/members?q=MAI');
 const fromWork='#/person/'+design.members[0].id+'?return='+encodeURIComponent(origin);
 assert.equal(new URL(api.artistUrl(design,fromWork),'https://site.invalid').searchParams.get('q'),null);
});
test('unknown descriptors, duplicate records, wrong video types and cross-work sources disable native entries',()=>{
 for(const v of [{...mv,key:'unknown'},{...mv,videoId:'aaaaaaaaaaa'},{...mv,videoType:'other'},{...mv,id:'recUnknown'}])assert.equal(api.boundIznaWork(actual,v),null);
 const cases=[c=>c.works.push({...c.works[0]}),c=>c.works.push({...c.works[0],id:'recDuplicateVideo'}),c=>c.works[0].groupIds=['recOther'],c=>c.works[0].url='https://example.com',c=>c.works[0].videoType='歌词视频',c=>c.groups[0].id='recOther'];
 for(const change of cases){const c=clone();change(c);assert.equal(api.boundIznaWork(c,mv),null);assert.equal(api.nativeHref(design,request(mv),services(c)),null);}
 for(const change of [c=>c.works[0].stage.url='https://www.youtube.com/watch?v=aaaaaaaaaaa',c=>c.works[0].stage.kind='different',c=>c.works[0].stage.clip={startSeconds:0,endSeconds:10,sourceDurationSeconds:20}]){const c=clone();change(c);assert.equal(api.boundIznaWork(c,stage),null);}
});
test('native return focus crosses the Shadow DOM boundary and waits for an enabled exact-action button',()=>{
 let focused=null;const main={focus:()=>{focused='main';}},button={dataset:{iznaNativeFocus:'open-rating'},disabled:false,closest:()=>null,focus:()=>{focused='open-rating';}};
 const doc={activeElement:{shadowRoot:{activeElement:button}}},root={ownerDocument:doc,contains:node=>node===button,querySelectorAll:()=>[button],querySelector:()=>main};
 const key=api.readIznaNavigationFocus(root);assert.deepEqual(key,{kind:'native',value:'open-rating'});
 assert.equal(api.restoreIznaNavigationFocus(root,key),true);assert.equal(focused,'open-rating');
 button.disabled=true;assert.equal(api.restoreIznaNavigationFocus(root,key),false);assert.equal(focused,'main');
 button.disabled=false;assert.equal(api.restoreIznaNavigationFocus(root,key),true);assert.equal(focused,'open-rating');
 assert.equal(api.restoreIznaNavigationFocus(root,{kind:'native',value:'save'}),true);assert.equal(focused,'main');
 button.closest=()=>({});assert.equal(api.restoreIznaNavigationFocus(root,key),false);assert.equal(focused,'main');
});
test('the shared SASS video keeps distinct MV/stage scoring slots and an unbound stage disables only rating',()=>{
 const pair=design.works.filter(v=>v.videoId==='xZ5Ej-tLEjM');assert.equal(pair.length,2);
 const hrefs=pair.map(v=>api.nativeHref(design,request(v),services(actual)));assert.ok(hrefs.every(Boolean));assert.notEqual(...hrefs);
 const c=clone();c.works.find(w=>w.id===stage.id).stage.scoreBinding=null;
 assert.equal(api.nativeHref(design,request(stage),services(c)),null);
 assert.ok(api.nativeHref(design,{...request(stage),action:'open-work'},services(c)));
 assert.ok(api.nativeHref(design,request(mv),services(c)));
});
test('only 12 independently evidenced MV/member relations display, while all 37 existing record rows stay intact',()=>{
 assert.equal(actual.ratings.length,37);assert.equal(design.works.reduce((n,v)=>n+api.iznaVideoMemberIds(actual,v).length,0),12);
 assert.deepEqual(api.iznaVideoMemberIds(actual,mv),[]);
 for(const v of design.works.filter(v=>v.type==='STAGE'))assert.deepEqual(api.iznaVideoMemberIds(actual,v),[]);
 const proved=design.works.find(v=>v.memberIds.length),c=clone(),pair={id:'recPair',memberIds:[design.members[0].id],workIds:[proved.id]};c.ratings=[pair];assert.deepEqual(api.iznaVideoMemberIds(c,proved),[design.members[0].id]);
 for(const rows of [[pair,pair],[pair,{...pair,id:'recSecond'}],[{...pair,memberIds:design.members.map(m=>m.id)}],[{...pair,workIds:[proved.id,'recOther']}],[{...pair,id:'bad-id'}],[null]]){c.ratings=rows;assert.deepEqual(api.iznaVideoMemberIds(c,proved),[]);}
 const display=api.prepareIznaDisplayData(actual);assert.equal(display.members.length,7);assert.equal(display.works.filter(v=>v.type==='STAGE').reduce((n,v)=>n+v.memberIds.length,0),0);
 for(const key of ['score','stageScore','ratings','watched','note','favorite'])assert.ok(!JSON.stringify(display).includes('"'+key+'":'));
});
test('eight editorial releases stay read-only and malformed catalog data cannot acquire native authority',()=>{
 assert.equal(design.releases.length,8);assert.ok(design.releases.every(r=>r.recordId===null));
 for(const r of design.releases)assert.equal(api.nativeHref(design,{action:'open-release',groupId:design.group.id,releaseKey:r.key,releaseRecordId:'recInvented',returnTo:'#/works?kind=release&detail='+encodeURIComponent(r.key)},services(actual)),null);
 for(const change of [c=>c.works[0].stage.scoreBinding.initializedAt={},c=>c.works[0].score=NaN,c=>c.works[0].watched=null,c=>c.members[0].groupIds=null,c=>c.scope={type:'artist',groupId:'recOther'}]){const c=clone();change(c);assert.equal(api.validIznaCatalog(c),false);assert.deepEqual(api.iznaNativeBindings(c),[]);}
});
