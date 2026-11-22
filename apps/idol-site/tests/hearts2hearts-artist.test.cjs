const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),crypto=require('node:crypto'),{renderToStaticMarkup}=require('react-dom/server');
const {assertMemberWorkCard} = require('./helpers/member-work-card-contract.cjs');
const content=JSON.parse(fs.readFileSync('data/hearts2hearts-artist.json')),group=content.groupId;
function fixture(){const m={id:'recM',name:'JIWOO',stageName:'JIWOO',groupIds:[group],cnName:'',country:'',birthDate:'',status:'在团',role:'',social:[{platform:'instagram',url:'https://www.instagram.com/example/',countLabel:'10.2万',observedAt:'2026-10-11'}]};const work=(id,video,score)=>({id,name:id,song:id,groupIds:[group],score,stageScore:null,note:'',watched:'已观看',version:'原版',videoType:'官方MV',releaseDate:'2026-01-01',url:'https://youtube.com/watch?v='+video,stage:null,stageSupplement:null});return {groups:[{id:group,name:'Hearts2Hearts'}],members:[m],works:[work('recSticky','gNUMxMuxH20',0),work('recWho','chl0R8C4NJ8',null),work('recSweat','1VqxWNwgf5Q',8)],ratings:[{id:'recR',memberIds:[m.id],workIds:['recSticky'],score:0,stylingScore:8,photo:null,recognition:'',note:'',memory:''}]};}
function setup(url,data=fixture()){
 const cache={},mockReact={...React,useEffect:()=>{},useMemo:f=>f(),useSyncExternalStore:()=>url};let calls=0;mockReact.useState=i=>[++calls===1?data:calls===3?false:i,()=>{}];
 function load(file){if(cache[file])return cache[file];const out={};cache[file]=out;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Date})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='react')return mockReact;if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name==='@/data/runtime/hearts2hearts-figma-assets.json')return {default:JSON.parse(fs.readFileSync('data/runtime/hearts2hearts-figma-assets.json'))};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('./'))return load(require('node:path').join(require('node:path').dirname(file),name)+'.ts');return require(name);},out);return out;}return {load,render:()=>renderToStaticMarkup(React.createElement(load('components/hearts2hearts-artist.tsx').default,{content}))};
}
test('the pending MV directory renders distinct clickable previews for FOCUS and STYLE versions',()=>{
 const versions=require('../data/stages/inventory.json').works.filter(row=>row.groupIds.includes(group)&&['FOCUS','STYLE'].includes(row.song));
 assert.equal(versions.length,4);
 const data=fixture(),seed=data.works[0];
 data.works=versions.map(row=>({...seed,id:row.recordId,name:row.name,song:row.song,version:row.version||'',videoType:row.mv.videoType,url:row.mv.url,score:null,watched:''}));
 data.ratings=[];
 const html=setup('/artists/hearts2hearts?section=works&format=mv&queue=tonight',data).render();
 const cards=[...html.matchAll(/<article class="h2h-work" data-work-id="([^"]+)">([\s\S]*?)<\/article>/g)];
 assert.equal(cards.length,versions.length);
 for(const [,id,body] of cards){
  const version=versions.find(row=>row.recordId===id);
  const imageLink=body.match(/<a class="h2h-work-image"[^>]*>([\s\S]*?)<\/a>/)[0];
  assert.ok(imageLink.includes('work='+id));
  assert.ok(imageLink.includes('/artist/mv-identity-20261025/covers/'+version.mv.videoId+'.jpg'));
 }
});
test('Hearts2Hearts existing stable group and return context are bounded',()=>{const {load}=setup('/artists/hearts2hearts'),n=load('lib/idol/artist-navigation.ts');assert.equal(n.HEARTS2HEARTS_GROUP_ID,'rec28ldfRTiBAq');assert.equal(n.groupArtistUrl(group),'/artists/hearts2hearts');assert.equal(n.artistReturnLabel('/artists/hearts2hearts?section=works'),'Hearts2Hearts');assert.equal(n.safeArtistReturn('/artists/hearts2hearts?section=works&format=stage'),'/artists/hearts2hearts?section=works&format=stage');assert.equal(n.safeArtistReturn('/artists/hearts2hearts?format=other'),null);assert.equal(n.safeArtistReturn('https://evil.test/artists/hearts2hearts'),null);});
test('Hearts2Hearts search queue and format roundtrip',()=>{const {load}=setup('/artists/hearts2hearts'),p=load('lib/idol/artist-preview.ts'),r=p.artistRoute('/artists/hearts2hearts?section=works&queue=tonight&q=Sticky&format=stage');assert.equal(p.artistRouteUrl(r,'/artists/hearts2hearts'),'/artists/hearts2hearts?section=works&queue=tonight&q=Sticky&format=stage');assert.match(p.artistWorkUrl({id:'recX'},true,p.artistRouteUrl(r,'/artists/hearts2hearts')),/format%3Dstage/);});
test('Hearts2Hearts work cards show actual MV scores including zero and null',()=>{const s=setup('/artists/hearts2hearts?section=works').render();assert.match(s,/recWho/);assert.match(s,/recSweat/);assert.match(s,/recSticky/);assert.match(s,/未评分/);assert.match(s,/8\.0 \/ 10/);assert.match(s,/0\.0 \/ 10/);assert.doesNotMatch(s,/实时粉丝|核验流程|sourceKey/);});
test('Hearts2Hearts collection cannot invent stage sources or mix member scores',()=>{const s=setup('/artists/hearts2hearts?section=works').render();assert.match(s,/0\.0 \/ 10/);assert.match(s,/未评分/);assert.match(s,/returnTo=%2Fartists%2Fhearts2hearts%3Fsection%3Dworks/);const stage=setup('/artists/hearts2hearts?section=works&format=stage').render();assert.match(stage,/没有符合条件/);assert.doesNotMatch(stage,/class="h2h-work"/);});
test('Hearts2Hearts member summaries preserve zero, dimension sample counts and exact MV photo absence', () => {
 assertMemberWorkCard(setup, fixture, 'hearts2hearts', null);
});

test('Hearts2Hearts official eight portraits preserve provenance and all local asset hashes',()=>{assert.equal(content.profile.members.length,8);assert.deepEqual(Object.keys(content.memberVisuals),content.profile.members);for(const v of [content.hero,...content.releases]){assert.ok(fs.existsSync('public'+v.image));assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+v.image)).digest('hex'),v.sha256);}for(const v of Object.values(content.memberVisuals))assert.equal(v.identitySourceUrl,'https://hearts2heartsofficial.jp/profile/');});
test('Hearts2Hearts missing performance records are unknown, never invented zero',()=>{assert.equal(content.wins,null);assert.ok(content.releases.every(r=>r.circle===null));const s=setup('/artists/hearts2hearts?section=records').render();assert.doesNotMatch(s,/0 次一位|销量 0|总销量 0/);assert.doesNotMatch(s,/0<em/);});
test('Hearts2Hearts reads only the authenticated catalog and retains shared member math',()=>{const s=fs.readFileSync('components/hearts2hearts-artist.tsx','utf8');assert.match(s,/readArtistCatalog\('hearts2hearts', controller\.signal\)/);assert.doesNotMatch(s,/method:'POST'|localStorage|sessionStorage|api\/save|api\/manage/);assert.match(s,/memberWorks\(data,m.id\)/);assert.match(s,/memberWorkSummary\(items\)/);});
test('Hearts2Hearts social dates are retained historical observations',()=>{for(const s of content.social)assert.match(s.observedAt,/^2026-10-09/);assert.equal(content.social.length,4);});
test('Hearts2Hearts styles are scoped and preserve photos without cropping',()=>{for(const f of ['app/artists/hearts2hearts/hearts2hearts-artist.css','app/hearts2hearts-experience.css']){const s=fs.readFileSync(f,'utf8');assert.match(s,/object-fit:contain/);assert.match(s,/prefers-reduced-motion/);assert.doesNotMatch(s,/(?:^|\})\s*(?:body|html|:root)\s*\{/);}});

test('Hearts2Hearts queue counts follow the active format and search',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/hearts2hearts?section=works&format=stage',d).render();assert.match(s,/全部作品<span>1<\/span>/);const empty=setup('/artists/hearts2hearts?section=works&format=stage&q=recWho',d).render();assert.match(empty,/全部作品<span>0<\/span>/);assert.match(empty,/没有符合条件/);});
test('Hearts2Hearts member MV links expose the work key for return focus',()=>{const s=setup('/artists/hearts2hearts?section=members&member=recM').render();assert.match(s,/data-member-work-trigger="recSticky"/);assert.match(s,/returnTo=%2Fartists%2Fhearts2hearts%3Fsection%3Dmembers%26member%3DrecM/);});

test('Hearts2Hearts independent index hero and watch theme retain existing collaboration priority',()=>{const group=fs.readFileSync('components/group-detail.tsx','utf8');assert.match(group,/hearts2hearts-index-card/);assert.match(group,/\/artist\/hearts2hearts\/figma-hero.jpg/);const page=fs.readFileSync('app/page.tsx','utf8');assert.match(page,/nmixxExperience\?'nmixx-experience':hearts2heartsExperience\?'hearts2hearts-experience'/);const heading=page.split('\n').find(l=>l.includes('className="hearts2hearts-work-heading"'));assert.match(heading,/STAYC_GROUP_ID,NMIXX_GROUP_ID\]/);});

test('Hearts2Hearts reuses all eight existing original portraits by verified byte identity', () => {
 const evidence = JSON.parse(fs.readFileSync('data/hearts2hearts-artist-evidence.json'));
 const portraitNames = [];
 for (const [name, portrait] of Object.entries(content.memberVisuals)) {
  assert.equal(portrait.storageReuse.sameOriginalBytes, true);
  assert.equal(portrait.sha256, portrait.originalSha256);
  assert.equal(portrait.sha256, portrait.storageReuse.verifiedStoredSha256);
  assert.equal(portrait.previousMediaRoute, '/api/media?table=members&record=' + evidence.stableIds.memberIds[name] + '&index=0');
  assert.deepEqual(portrait.dimensions, [1000, 1000]);
  const bytes = fs.readFileSync('public' + portrait.image);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), portrait.originalSha256);
  portraitNames.push(portrait.image.split('/').pop());
 }
 const groupPath = '/artist/hearts2hearts/';
 assert.equal(portraitNames.length, 8);
 assert.deepEqual(fs.readdirSync('public' + groupPath + 'portraits').sort(), portraitNames.sort());
 const expected = new Set(['figma-hero.jpg', 'hero.webp', 'iconic-heart-regular.jpg', 'iconic-heart.webp',
  'lemon-tang.webp', 'logo.svg', 'moonride.webp', 'portraits']);
 const editions = require('../data/mv-recognition-editions.json');
 for (const edition of Object.values(editions)) {
  for (const { preview } of Object.values(edition.portraits)) {
   if (preview.startsWith(groupPath)) expected.add(preview.slice(groupPath.length).split('/')[0]);
  }
 }
 assert.deepEqual(fs.readdirSync('public' + groupPath).sort(), [...expected].sort());
});

test('Hearts2Hearts MV format includes collaboration and remix MVs but excludes lyric and performance videos',()=>{const d=fixture();d.works[1].videoType='歌词视频';d.works[2].videoType='官方表演视频';for(const type of ['特别合作MV','混音版MV'])d.works.push({...d.works[2],id:'rec'+d.works.length,videoType:type});const mv=setup('/artists/hearts2hearts?section=works&format=mv',d).render();assert.match(mv,/全部作品<span>3<\/span>/);assert.equal((mv.match(/class="h2h-work"/g)||[]).length,3);const all=setup('/artists/hearts2hearts?section=works',d).render();assert.equal((all.match(/class="h2h-work"/g)||[]).length,5);for(const w of d.works)w.url='';const empty=setup('/artists/hearts2hearts?section=works&format=mv',d).render();assert.match(empty,/全部作品<span>0<\/span>/);});

test('social unit presentation handles observed counts with units without changing source data',()=>{const original=JSON.stringify(content.social);try{const samples=['约587.1万粉丝','约492.3K Followers','约418万订阅','约8.5M subscribers'];content.social.forEach((s,i)=>{s.display=samples[i];});const before=JSON.stringify(content.social),html=setup('/artists/hearts2hearts').render(),social=html.match(/<section class="h2h-social"[^>]*>([\s\S]*?)<\/section>/)[1];for(const n of ['约587.1万','约492.3K','约418万','约8.5M'])assert.ok(social.includes('<strong>'+n+'</strong>'));assert.doesNotMatch(social,/<strong>[^<]*(?:粉丝|订阅|followers|subscribers)/i);assert.equal(JSON.stringify(content.social),before);}finally{content.social=JSON.parse(original);}});

test('member roster and detail visibly render Chinese with stage name without renaming identity',()=>{const d=fixture(),m=d.members[0];m.cnName='测试中文名（音译）';const before=JSON.stringify(d);for(const url of ['/artists/hearts2hearts?section=members','/artists/hearts2hearts?section=members&member='+m.id]){const html=setup(url,d).render();assert.ok(html.includes('测试中文名'));assert.ok(html.includes(m.stageName));assert.ok(html.includes('member-display-name'));assert.ok(!html.includes('测试中文名（音译）'));}assert.equal(JSON.stringify(d),before);});
