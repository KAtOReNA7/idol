const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),crypto=require('node:crypto'),{renderToStaticMarkup}=require('react-dom/server');
const {assertMemberWorkCard} = require('./helpers/member-work-card-contract.cjs');
const content=JSON.parse(fs.readFileSync('data/lesserafim-artist.json')),group=content.groupId;
function fixture(){const m={id:'recM',name:'SAKURA',stageName:'SAKURA',groupIds:[group],cnName:'',country:'',birthDate:'',status:'在团',role:'',social:[{platform:'instagram',url:'https://www.instagram.com/example/',countLabel:'10.2万',observedAt:'2026-10-11'}]};const work=(id,video,score)=>({id,name:id,song:id,groupIds:[group],score,stageScore:null,note:'',watched:'已观看',version:'原版',videoType:'官方MV',releaseDate:'2026-01-01',url:'https://youtube.com/watch?v='+video,stage:null,stageSupplement:null});return {groups:[{id:group,name:'LE SSERAFIM'}],members:[m],works:[work('recSticky','pyf8cbqyfPs',0),work('recWho','n6B5gQXlB-0',null),work('recSweat','bNKXxwOQYB8',8)],ratings:[{id:'recR',memberIds:[m.id],workIds:['recSticky'],score:0,stylingScore:8,photo:null,recognition:'',note:'',memory:''}]};}
function setup(url,data=fixture(),canEdit=true){
 const cache={},mockReact={...React,useEffect:()=>{},useMemo:f=>f(),useSyncExternalStore:()=>url};let calls=0;mockReact.useState=i=>[++calls===1?data:calls===3?false:i,()=>{}];
 function load(file){if(cache[file])return cache[file];const out={};cache[file]=out;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Date})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='@/components/public-access')return {useCanEdit:()=>canEdit};if(name==='react')return mockReact;if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('./'))return load(require('node:path').join(require('node:path').dirname(file),name)+'.ts');return require(name);},out);return out;}return {load,render:()=>renderToStaticMarkup(React.createElement(load('components/lesserafim-artist.tsx').default,{content}))};
}

test('LE SSERAFIM stable route, filters and stage return stay bounded',()=>{const {load}=setup('/artists/lesserafim'),n=load('lib/idol/artist-navigation.ts'),p=load('lib/idol/artist-preview.ts');assert.equal(n.groupArtistUrl(group),'/artists/lesserafim');assert.equal(n.artistReturnLabel('/artists/lesserafim'),'LE SSERAFIM');assert.equal(n.safeArtistReturn('https://evil.test/artists/lesserafim'),null);const url='/artists/lesserafim?section=works&format=stage';assert.equal(p.artistRouteUrl(p.artistRoute(url),'/artists/lesserafim'),url);assert.equal(n.safeArtistReturn(url),url);});
test('LE SSERAFIM work scores retain zero and null; no invented stage',()=>{const s=setup('/artists/lesserafim?section=works').render();assert.match(s,/0\.0 \/ 10/);assert.match(s,/未评分/);const stage=setup('/artists/lesserafim?section=works&format=stage').render();assert.match(stage,/没有符合条件/);});
test('LE SSERAFIM member dimensions remain distinct and missing MV photo never uses portrait', () => {
 assertMemberWorkCard(setup, fixture, 'lesserafim', '认人图待补');
});
test('LE SSERAFIM official five-person hero and named portrait evidence',()=>{assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+content.hero.image)).digest('hex'),content.hero.sha256);assert.equal(Object.keys(content.memberVisuals).length,5);assert.match(content.hero.sourceUrl,/sourcemusic.com\/artist\/profile/);assert.match(content.hero.caption,/五人团体合照/);for(const [name,v] of Object.entries(content.memberVisuals)){assert.match(v.sourcePhotoUrl,/officialsite.cds-jp.online/);const original=JSON.parse(fs.readFileSync('../../docs/codex/lesserafim-original-transport-20261025.json')).assets.find(a=>a.url===v.sourcePhotoUrl);assert.equal(v.image,original.image);assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+v.image)).digest('hex'),original.sha256);assert.match(v.identitySourceUrl,/le-sserafim.jp\/profile\//);}});
test('LE SSERAFIM keeps its official directory scope and omits unknown sales or win totals',()=>{const s=setup('/artists/lesserafim?section=records').render();assert.match(s,/SOURCE MUSIC 韩国官网收录的 11 项发行/);assert.doesNotMatch(s,/待完整核验|暂不展示总计|销量与音乐节目一位数据尚不完整|0<em/);assert.equal(content.wins,null);for(const x of content.social)assert.match(x.observedAt,/^2026-10-09/);});
test('LE SSERAFIM uses only authenticated read and preserves exact MV source model',()=>{const s=fs.readFileSync('components/lesserafim-artist.tsx','utf8');assert.match(s,/readArtistCatalog\('lesserafim', controller\.signal\)/);assert.doesNotMatch(s,/method:'POST'|api\/save|api\/manage|localStorage|sessionStorage/);assert.match(s,/memberWorks\(data,m.id\)/);});

test('LE SSERAFIM queue counts follow the active stage filter and current search',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/lesserafim?section=works&format=stage',d).render();assert.match(s,/全部作品<span>1<\/span>/);const empty=setup('/artists/lesserafim?section=works&format=stage&q=recWho',d).render();assert.match(empty,/全部作品<span>0<\/span>/);assert.match(empty,/没有符合条件/);});

test('LE SSERAFIM member MV links expose stable work IDs for keyboard-focus restoration',()=>{const s=setup('/artists/lesserafim?section=members&member=recM').render();assert.match(s,/data-member-work-trigger="recSticky"/);assert.match(s,/returnTo=%2Fartists%2Flesserafim%3Fsection%3Dmembers%26member%3DrecM/);});

test('LE SSERAFIM entire official discography is represented with unknown metrics intact',()=>{assert.equal(content.releases.length,11);assert.equal(new Set(content.releases.map(r=>r.id)).size,11);for(const r of content.releases){assert.equal(r.circle,null);assert.equal(r.hanteoFirstWeek,null);assert.match(r.sourceUrl,/sourcemusic.com\/artist\/discography\/LE%20SSERAFIM\//);}const s=setup('/artists/lesserafim?section=records').render();for(const r of content.releases)assert.ok(s.includes(r.title.replaceAll('&','&amp;').replaceAll("'",'&#x27;'))||s.includes(r.title));});
test('LE SSERAFIM member stage keeps its distinct return-focus identity',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/lesserafim?section=members&member=recM',d).render();assert.match(s,/data-member-work-trigger="recSticky:stage"/);assert.match(s,/video=stage/);});
test('LE SSERAFIM uses its SOURCE MUSIC artist wordmark, full group image and responsive controls',()=>{
 const page=setup('/artists/lesserafim').render(),css=fs.readFileSync('app/artists/lesserafim/lesserafim-artist.css','utf8');
 assert.match(page,/<h1><img[^>]+src="\/artist\/lesserafim\/identity\/official-logo.png"[^>]+alt="LE SSERAFIM"/);
 assert.match(page,/SOURCE MUSIC 官网五人团体合照/);assert.doesNotMatch(page,/<h2>SOURCE<br|class="lf-roster-number"|公开可读，只有本人可编辑/);
 assert.match(css,/#0d1721/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/focus-visible/);
});

test('member roster and detail visibly render Chinese first without renaming identity',()=>{const d=fixture(),m=d.members[0];m.cnName='测试中文名（音译）';const before=JSON.stringify(d);for(const url of ['/artists/lesserafim?section=members','/artists/lesserafim?section=members&member='+m.id]){const html=setup(url,d).render();assert.ok(html.includes('测试中文名 · '+m.stageName));assert.ok(html.includes('member-display-name'));assert.ok(!html.includes('测试中文名（音译）'));}assert.equal(JSON.stringify(d),before);});

test('five LE SSERAFIM members show their own name before their portrait, original and official source',async()=>{
 const {parse}=require('next/dist/compiled/node-html-parser');
 const {registry,artistCatalog,renderArtist}=require('./fixtures/current-artist-pages.cjs');
 const group=registry.find(candidate=>candidate.slug==='lesserafim');
 const catalog=artistCatalog(group);
 const current=catalog.members.filter(member=>member.groupIds.includes(group.groupId)&&content.memberVisuals[member.stageName]);
 assert.equal(current.length,5);
 for(const member of current){
  const page=parse(await renderArtist(group,{section:'members',member:member.id},catalog));
  const identity=page.querySelector('[data-member-module="identity"]');
  assert.equal(identity.getAttribute('data-member-id'),member.id);
  const parts=identity.childNodes.filter(node=>node.nodeType===1);
  assert.ok(parts[0].querySelector('h1').text.includes(member.stageName));
  const picture=content.memberVisuals[member.stageName];
  assert.equal(parts[1].querySelector('img').getAttribute('src'),picture.image);
  const controls=parts[1].querySelectorAll('a[data-original-photo]');
  assert.deepEqual(controls.map(link=>link.getAttribute('href')),[picture.image,picture.image]);
  const source=parts[1].querySelector('details');
  assert.equal(source.hasAttribute('open'),false);
  assert.equal(source.querySelector('a').getAttribute('href'),picture.identitySourceUrl);
  assert.equal(parts[2].getAttribute('data-member-module'),'basic');
 }
});

test('LE SSERAFIM approved originals use native frames and qualified reference without changing private scores or links',()=>{
 const d=fixture();d.mode='live';const r=d.ratings[0];r.personalPhotoEligible=true;
 r.photo={table:'ratings',recordId:r.id,fieldId:'photos',index:3,sourceKind:'mv_look_photo'};
 r.referencePhoto={...r.photo,index:1,sourceKind:'mv_still',kind:'本 MV 截图'};
 const before=JSON.stringify(d),s=setup('/artists/lesserafim?section=members&member=recM',d).render();
 assert.match(s,/class="mv-identity-frame"[^>]+aria-label="[^"]*本MV同造型照片原图"[^>]+aria-haspopup="dialog"/);assert.match(s,/本MV同造型照片/);assert.match(s,/原MV截图/);
 assert.match(s,/src="\/api\/media\?table=ratings&amp;record=recR&amp;index=3"/);assert.doesNotMatch(s,/src="[^\"]*index=1/);
 assert.match(s,/data-member-work-trigger="recSticky"/);assert.match(s,/>0\.0<\/b>/);assert.match(s,/>8\.0<\/b>/);assert.equal(JSON.stringify(d),before);
 r.photo.sourceKind='mv_still';assert.doesNotMatch(setup('/artists/lesserafim?section=members&member=recM',d).render(),/mv-look-native|本MV同造型照片|原MV截图/);
 r.photo.sourceKind='mv_look_photo';r.referencePhoto.table='members';assert.doesNotMatch(setup('/artists/lesserafim?section=members&member=recM',d).render(),/原MV截图/);
});

test('visitors see one link per recording and a stage filter opens the selected performance directly',()=>{
 const {parse}=require('next/dist/compiled/node-html-parser'),data=fixture();
 const item=data.works[0];item.stage={videoId:'validstage1',url:'https://youtu.be/validstage1',title:'本场节目',channel:'节目',kind:'打歌',publishedDate:'2025-02-03'};
 const base='/artists/lesserafim?section=works',page=parse(setup(base,data,false).render());
 const card=page.querySelector('.lf-work'),urls=card.querySelectorAll('a').map(a=>a.getAttribute('href'));
 assert.equal(urls.length,new Set(urls).size);assert.equal(page.querySelector('.lf-score'),null);
 const stage=parse(setup(base+'&format=stage',data,true).render()).querySelector('.lf-work');
 const links=stage.querySelectorAll('a');assert.equal(links.length,1);assert.match(links[0].getAttribute('href'),/video=stage/);
 assert.match(stage.text,/2025-02-03 · 本场节目/);assert.match(stage.text,/我的舞台分/);assert.doesNotMatch(stage.text,/我的 MV 分/);
});

test('the overview keeps the latest and previously featured official releases together after every MV card',()=>{
 const {parse}=require('next/dist/compiled/node-html-parser'),page=parse(setup('/artists/lesserafim').render());
 const ordered=page.querySelectorAll('.lf-work,.lf-album-cover');
 const firstAlbum=ordered.findIndex(el=>el.classNames.includes('lf-album-cover'));
 assert.ok(firstAlbum>0);
 assert.ok(ordered.slice(firstAlbum).every(el=>el.classNames.includes('lf-album-cover')));
 const expected=content.releases.filter((r,i)=>i<3||content.featuredReleaseIds.includes(r.id));
 assert.deepEqual(ordered.slice(firstAlbum).map(el=>el.closest('a').getAttribute('href')),
  expected.map(r=>r.id==='12'?'/artists/lesserafim/releases/easy?from=overview':r.sourceUrl));
});
