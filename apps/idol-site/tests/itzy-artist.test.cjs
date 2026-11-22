const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),crypto=require('node:crypto'),{renderToStaticMarkup}=require('react-dom/server');
const {assertMemberWorkCard} = require('./helpers/member-work-card-contract.cjs');
const content=JSON.parse(fs.readFileSync('data/itzy-artist.json')),group=content.groupId;
function fixture(){const m={id:'recM',name:'YEJI',stageName:'YEJI',groupIds:[group],cnName:'',country:'',birthDate:'',status:'在团',role:'',social:[{platform:'instagram',url:'https://www.instagram.com/example/',countLabel:'10.2万',observedAt:'2026-10-11'}]};const work=(id,video,score)=>({id,name:id,song:id,groupIds:[group],score,stageScore:null,note:'',watched:'已观看',version:'原版',videoType:'官方MV',releaseDate:'2026-01-01',url:'https://youtube.com/watch?v='+video,stage:null,stageSupplement:null});return {groups:[{id:group,name:'ITZY'}],members:[m],works:[work('recSticky','6Ycn9qZK09I',0),work('recWho','EmeW6li6bbo',null),work('recSweat','aFrQIJ5cbRc',8)],ratings:[{id:'recR',memberIds:[m.id],workIds:['recSticky'],score:0,stylingScore:8,photo:null,recognition:'',note:'',memory:''}]};}
function setup(url,data=fixture(),canEdit=true){
 const cache={},mockReact={...React,useEffect:()=>{},useMemo:f=>f(),useSyncExternalStore:()=>url};let calls=0;mockReact.useState=i=>[++calls===1?data:calls===3?false:i,()=>{}];
 function load(file){if(cache[file])return cache[file];const out={};cache[file]=out;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Date})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='@/components/public-access')return {useCanEdit:()=>canEdit};if(name==='react')return mockReact;if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('./'))return load(require('node:path').join(require('node:path').dirname(file),name)+'.ts');return require(name);},out);return out;}return {load,render:()=>renderToStaticMarkup(React.createElement(load('components/itzy-artist.tsx').default,{content}))};
}
test('ITZY existing stable group and return context are bounded',()=>{const {load}=setup('/artists/itzy'),n=load('lib/idol/artist-navigation.ts');assert.equal(n.ITZY_GROUP_ID,'recvxyEBDZqxjD');assert.equal(n.groupArtistUrl(group),'/artists/itzy');assert.equal(n.artistReturnLabel('/artists/itzy?section=works'),'ITZY');assert.equal(n.safeArtistReturn('/artists/itzy?section=works&format=stage'),'/artists/itzy?section=works&format=stage');assert.equal(n.safeArtistReturn('/artists/itzy?format=other'),null);assert.equal(n.safeArtistReturn('https://evil.test/artists/itzy'),null);});
test('ITZY search queue and format roundtrip',()=>{const {load}=setup('/artists/itzy'),p=load('lib/idol/artist-preview.ts'),r=p.artistRoute('/artists/itzy?section=works&queue=tonight&q=Sticky&format=stage');assert.equal(p.artistRouteUrl(r,'/artists/itzy'),'/artists/itzy?section=works&queue=tonight&q=Sticky&format=stage');assert.match(p.artistWorkUrl({id:'recX'},true,p.artistRouteUrl(r,'/artists/itzy')),/format%3Dstage/);});
test('ITZY overview shows actual library MV scores including zero and null',()=>{const s=setup('/artists/itzy').render();assert.match(s,/recWho/);assert.match(s,/recSweat/);assert.match(s,/recSticky/);assert.match(s,/未评分/);assert.match(s,/8\.0 \/ 10/);assert.match(s,/0\.0 \/ 10/);assert.doesNotMatch(s,/实时粉丝|核验流程|sourceKey/);});
test('ITZY collection cannot invent stage sources or mix member scores',()=>{const s=setup('/artists/itzy?section=works').render();assert.match(s,/0\.0 \/ 10/);assert.match(s,/未评分/);assert.match(s,/returnTo=%2Fartists%2Fitzy%3Fsection%3Dworks/);const stage=setup('/artists/itzy?section=works&format=stage').render();assert.match(stage,/没有符合条件/);assert.doesNotMatch(stage,/class="iz-work"/);});
test('ITZY member summaries preserve zero, dimension sample counts and exact MV photo absence', () => {
 assertMemberWorkCard(setup, fixture, 'itzy', '暂无对应图片');
});

test('ITZY five portraits preserve named official provenance and existing private media identities',()=>{assert.equal(content.profile.members.length,5);assert.deepEqual(Object.keys(content.memberVisuals),content.profile.members);for(const v of Object.values(content.memberVisuals)){assert.equal(v.identitySourceUrl,'https://itzy.jype.com/profile');assert.match(v.sourcePhotoUrl,/^https:\/\/d1meds70430yck.cloudfront.net\/artists\/itzy\/profiles\//);assert.equal(v.previousImage,'/api/media?table=members&record='+v.recordId+'&index=0');assert.ok(fs.existsSync('public'+v.image));}});
test('ITZY missing performance records are unknown, never invented zero',()=>{assert.equal(content.wins,null);assert.ok(content.releases.every(r=>r.circle===null));const s=setup('/artists/itzy?section=records').render();assert.match(s,/暂无完整记录/);assert.match(s,/完整音乐节目一位记录暂缺|一位记录尚不完整/);assert.doesNotMatch(s,/0<em/);});
test('ITZY reads only the authenticated catalog and retains shared member math',()=>{const s=fs.readFileSync('components/itzy-artist.tsx','utf8');assert.match(s,/readArtistCatalog\('itzy', controller\.signal\)/);assert.doesNotMatch(s,/method:'POST'|localStorage|sessionStorage|api\/save|api\/manage/);assert.match(s,/memberWorks\(data,m.id\)/);assert.match(s,/memberWorkSummary\(items\)/);});
test('ITZY social dates are retained historical observations',()=>{for(const s of content.social)assert.match(s.observedAt,/^2026-10-09/);assert.equal(content.social.length,4);});
test('ITZY styles are scoped and preserve photos without cropping',()=>{for(const f of ['app/artists/itzy/itzy-artist.css']){const s=fs.readFileSync(f,'utf8');assert.match(s,/object-fit:contain/);assert.match(s,/prefers-reduced-motion/);assert.doesNotMatch(s,/(?:^|\})\s*(?:body|html|:root)\s*\{/);}});

test('ITZY queue counts follow the active format and search',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/itzy?section=works&format=stage',d).render();assert.match(s,/全部作品<span>1<\/span>/);const empty=setup('/artists/itzy?section=works&format=stage&q=recWho',d).render();assert.match(empty,/全部作品<span>0<\/span>/);assert.match(empty,/没有符合条件/);});
test('ITZY member MV links expose the work key for return focus',()=>{const s=setup('/artists/itzy?section=members&member=recM').render();assert.match(s,/data-member-work-trigger="recSticky"/);assert.match(s,/returnTo=%2Fartists%2Fitzy%3Fsection%3Dmembers%26member%3DrecM/);});

test('ITZY displays its dated public accounts with one unit and retains earlier observations in the archive',async()=>{
 const {parse}=require('next/dist/compiled/node-html-parser');
 const {formatFollowerCount}=await import('../lib/idol/follower-count.mjs');
 const records=require('../data/group-statistics-completion-evidence.json').groups.itzy.social;
 const accounts=parse(setup('/artists/itzy').render()).querySelectorAll('.group-info-social article');
 assert.ok(accounts.length>0);
 for(const card of accounts){
  const a=card.querySelector('a'),record=records.find(row=>row.url===a.getAttribute('href'));
  assert.ok(record,card.text);
  assert.equal(a.querySelector('strong').text,formatFollowerCount(String(record.observedValue)));
  assert.equal(card.querySelector('small').text,(record.platform==='youtube'?'订阅':'粉丝')+' · '+record.observedAt.slice(0,10));
 }
 assert.equal(content.social[0].display,'约1926万');assert.equal(content.social[1].display,'约6.5M');
});

test('ITZY uses its official wordmark, full group photograph, and accessible five-member layout',()=>{
 const page=setup('/artists/itzy').render(),css=fs.readFileSync('app/artists/itzy/itzy-artist.css','utf8');
 assert.match(page,/class="iz-hero-image"/);assert.match(page,/<h1><img[^>]+src="\/artist\/itzy\/identity\/official-logo.png"[^>]+alt="ITZY"/);
 assert.match(page,/旗下五人女团/);assert.doesNotMatch(page,/ARTIST FILE 05|公开可读，只有本人可编辑/);
 assert.match(css,/#e5efe8/);assert.match(css,/repeat\(5,minmax\(0,1fr\)\)/);assert.match(css,/:focus-visible/);
});

test('ITZY hero is a verified uncropped official five-person group photograph',()=>{assert.equal(content.hero.identitySourceUrl,'https://itzy.jype.com/gallery');assert.match(content.hero.sourcePhotoUrl,/cloudfront.net\/artists\/itzy\/galleries\//);assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+content.hero.image)).digest('hex'),content.hero.sha256);assert.deepEqual(content.hero.dimensions,[1800,1202]);assert.match(content.hero.dateMeaning,/publication date not asserted/);});

test('ITZY member MV cards offer exact available stages with independent return focus keys',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/itzy?section=members&member=recM',d).render();assert.match(s,/data-member-work-trigger="recSticky:stage"/);assert.match(s,/video=stage/);assert.match(s,/returnTo=%2Fartists%2Fitzy%3Fsection%3Dmembers%26member%3DrecM/);const absent=setup('/artists/itzy?section=members&member=recM').render();assert.doesNotMatch(absent,/data-member-work-trigger="recSticky:stage"/);});

test('member roster and detail visibly render Chinese first without renaming identity',()=>{const d=fixture(),m=d.members[0];m.cnName='测试中文名（音译）';const before=JSON.stringify(d);for(const url of ['/artists/itzy?section=members','/artists/itzy?section=members&member='+m.id]){const html=setup(url,d).render();assert.ok(html.includes('测试中文名 · '+m.stageName));assert.ok(html.includes('member-display-name'));assert.ok(!html.includes('测试中文名（音译）'));}assert.equal(JSON.stringify(d),before);});


test('ITZY keeps a long bilingual member name legible without decorative numbering',()=>{
 const d=fixture(),base=d.members[0];
 d.members=content.profile.members.map((stageName,i)=>({...base,id:'recLongName'+i,stageName,cnName:i===3?'李彩领':'测试中文名'}));
 const before=JSON.stringify(d),html=setup('/artists/itzy?section=members',d).render();
 assert.match(html,/<span class="member-display-name">李彩领 · CHAERYEONG<\/span>/);
 assert.doesNotMatch(html,/class="iz-member-index"/);
 assert.equal(JSON.stringify(d),before);
 const css=fs.readFileSync('app/artists/itzy/itzy-artist.css','utf8'),globalCss=fs.readFileSync('app/globals.css','utf8');
 const name=globalCss.match(/\.member-display-name\{([^}]+)\}/)[1];
 assert.match(name,/min-width:0/);assert.match(name,/overflow-wrap:anywhere/);assert.match(name,/white-space:normal/);
 assert.doesNotMatch(name,/text-overflow:ellipsis|overflow:hidden/);
 assert.match(css,/\.iz-roster strong svg\{[^}]*flex-shrink:0/);
});

test('visitors see one link per recording and a stage filter opens the selected performance directly',()=>{
 const {parse}=require('next/dist/compiled/node-html-parser'),data=fixture();
 const item=data.works[0];item.stage={videoId:'validstage1',url:'https://youtu.be/validstage1',title:'本场节目',channel:'节目',kind:'打歌',publishedDate:'2025-02-03'};
 const base='/artists/itzy?section=works',page=parse(setup(base,data,false).render());
 const card=page.querySelector('.iz-work'),urls=card.querySelectorAll('a').map(a=>a.getAttribute('href'));
 assert.equal(urls.length,new Set(urls).size);assert.equal(page.querySelector('.iz-score'),null);
 const stage=parse(setup(base+'&format=stage',data,true).render()).querySelector('.iz-work');
 const links=stage.querySelectorAll('a');assert.equal(links.length,1);assert.match(links[0].getAttribute('href'),/video=stage/);
 assert.match(stage.text,/2025-02-03 · 本场节目/);assert.match(stage.text,/我的舞台分/);assert.doesNotMatch(stage.text,/我的 MV 分/);
});
