const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),crypto=require('node:crypto'),{renderToStaticMarkup}=require('react-dom/server');
const {assertMemberWorkCard} = require('./helpers/member-work-card-contract.cjs');
const content=JSON.parse(fs.readFileSync('data/kiiikiii-artist.json')),group=content.groupId;
function fixture(){const m={id:'recM',name:'JIYU',stageName:'JIYU',groupIds:[group],cnName:'',country:'',birthDate:'',status:'在团',role:'',social:[{platform:'instagram',url:'https://www.instagram.com/example/',countLabel:'10.2万',observedAt:'2026-10-11'}]};const work=(id,video,score)=>({id,name:id,song:id,groupIds:[group],score,stageScore:null,note:'',watched:'已观看',version:'原版',videoType:'官方MV',releaseDate:'2026-01-01',url:'https://youtube.com/watch?v='+video,stage:null,stageSupplement:null});return {groups:[{id:group,name:'KiiiKiii'}],members:[m],works:[work('recSticky','hAEfi_SKTEU',0),work('recWho','zhHB4dZTChw',null),work('recSweat','UsbRoaH6y-Q',8)],ratings:[{id:'recR',memberIds:[m.id],workIds:['recSticky'],score:0,stylingScore:8,photo:null,recognition:'',note:'',memory:''}]};}
function setup(url,data=fixture(),displayContent=content){
 const cache={},mockReact={...React,useEffect:()=>{},useMemo:f=>f(),useSyncExternalStore:()=>url};let calls=0;mockReact.useState=i=>[++calls===1?data:calls===3?false:i,()=>{}];
 function load(file){if(cache[file])return cache[file];const out={};cache[file]=out;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Date})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='react')return mockReact;if(name==='./feishu')return {AppError:class extends Error{}};if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('./'))return load(require('node:path').join(require('node:path').dirname(file),name)+'.ts');return require(name);},out);return out;}return {load,render:()=>renderToStaticMarkup(React.createElement(load('components/kiiikiii-artist.tsx').default,{content:displayContent}))};
}
test('KiiiKiii existing stable group and return context are bounded',()=>{const {load}=setup('/artists/kiiikiii'),n=load('lib/idol/artist-navigation.ts');assert.equal(n.KIIIKIII_GROUP_ID,'rec28ldfRTiBUk');assert.equal(n.groupArtistUrl(group),'/artists/kiiikiii');assert.equal(n.artistReturnLabel('/artists/kiiikiii?section=works'),'KiiiKiii');assert.equal(n.safeArtistReturn('/artists/kiiikiii?section=works&format=stage'),'/artists/kiiikiii?section=works&format=stage');assert.equal(n.safeArtistReturn('/artists/kiiikiii?format=other'),null);assert.equal(n.safeArtistReturn('https://evil.test/artists/kiiikiii'),null);});
test('KiiiKiii search queue and format roundtrip',()=>{const {load}=setup('/artists/kiiikiii'),p=load('lib/idol/artist-preview.ts'),r=p.artistRoute('/artists/kiiikiii?section=works&queue=tonight&q=Sticky&format=stage');assert.equal(p.artistRouteUrl(r,'/artists/kiiikiii'),'/artists/kiiikiii?section=works&queue=tonight&q=Sticky&format=stage');assert.match(p.artistWorkUrl({id:'recX'},true,p.artistRouteUrl(r,'/artists/kiiikiii')),/format%3Dstage/);});
test('KiiiKiii featured release cards show actual MV scores including zero and null',()=>{const s=setup('/artists/kiiikiii').render();assert.match(s,/recWho/);assert.match(s,/recSweat/);assert.match(s,/recSticky/);assert.match(s,/未评分/);assert.match(s,/8\.0 \/ 10/);assert.match(s,/0\.0 \/ 10/);assert.doesNotMatch(s,/实时粉丝|核验流程|sourceKey/);});
test('KiiiKiii collection cannot invent stage sources or mix member scores',()=>{const s=setup('/artists/kiiikiii?section=works').render();assert.match(s,/0\.0 \/ 10/);assert.match(s,/未评分/);assert.match(s,/returnTo=%2Fartists%2Fkiiikiii%3Fsection%3Dworks/);const stage=setup('/artists/kiiikiii?section=works&format=stage').render();assert.match(stage,/没有符合条件/);assert.doesNotMatch(stage,/class="kk-work"/);});
test('KiiiKiii member summaries preserve zero, dimension sample counts and exact MV photo absence', () => {
 assertMemberWorkCard(setup, fixture, 'kiiikiii', '暂无对应图片');
});

test('five historical named portraits retain publication bytes and previous private routes',()=>{const bindings=JSON.parse(fs.readFileSync('data/kiiikiii-portraits.json'));assert.equal(bindings.length,5);assert.deepEqual(bindings.map(x=>x.stageName),content.profile.members);for(const b of bindings){const v=content.memberVisuals[b.stageName];assert.equal(v.image,b.url);assert.equal(v.previousImage,'/api/media?table=members&record='+b.memberId+'&index=0');assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+b.url)).digest('hex'),b.sha256);assert.match(b.identityFragment,new RegExp(b.stageName[0]+b.stageName.slice(1).toLowerCase()));assert.equal(b.publishedAt,'2025-02-17');}assert.equal(content.releases.length,6);});
test('KiiiKiii missing performance records are unknown, never invented zero',()=>{assert.equal(content.wins,null);assert.ok(content.releases.every(r=>r.circle===null));const s=setup('/artists/kiiikiii?section=records').render();assert.match(s,/暂无完整记录/);assert.match(s,/完整音乐节目一位记录暂缺|一位记录尚不完整/);assert.doesNotMatch(s,/0<em/);});
test('KiiiKiii reads only the authenticated catalog and retains shared member math',()=>{const s=fs.readFileSync('components/kiiikiii-artist.tsx','utf8');assert.match(s,/readArtistCatalog\('kiiikiii', controller\.signal\)/);assert.doesNotMatch(s,/method:'POST'|localStorage|sessionStorage|api\/save|api\/manage/);assert.match(s,/memberWorks\(data,m.id\)/);assert.match(s,/memberWorkSummary\(items\)/);});
test('KiiiKiii social dates are retained historical observations',()=>{for(const s of content.social)assert.match(s.observedAt,/^2026-10-09/);assert.equal(content.social.length,4);});
test('KiiiKiii styles are scoped and preserve photos without cropping',()=>{for(const f of ['app/artists/kiiikiii/kiiikiii-artist.css','app/kiiikiii-experience.css']){const s=fs.readFileSync(f,'utf8');assert.match(s,/object-fit:contain/);assert.match(s,/prefers-reduced-motion/);assert.doesNotMatch(s,/(?:^|\})\s*(?:body|html|:root)\s*\{/);}});

test('KiiiKiii queue counts follow the active format and search',()=>{const d=fixture();d.works[0].stage={videoId:'validstage1'};const s=setup('/artists/kiiikiii?section=works&format=stage',d).render();assert.match(s,/全部作品<span>1<\/span>/);const empty=setup('/artists/kiiikiii?section=works&format=stage&q=recWho',d).render();assert.match(empty,/全部作品<span>0<\/span>/);assert.match(empty,/没有符合条件/);});
test('KiiiKiii member MV links expose the work key for return focus',()=>{const s=setup('/artists/kiiikiii?section=members&member=recM').render();assert.match(s,/data-member-work-trigger="recSticky"/);assert.match(s,/returnTo=%2Fartists%2Fkiiikiii%3Fsection%3Dmembers%26member%3DrecM/);});

test('KiiiKiii registration includes authenticated projection without adding mutations',()=>{const {load}=setup('/artists/kiiikiii');assert.equal(load('lib/idol/artist-catalog.ts').requestedArtist(new URLSearchParams('artist=kiiikiii')),group);const c=fs.readFileSync('lib/idol/artist-catalog.ts','utf8');assert.doesNotMatch(c,/INSERT |UPDATE |DELETE |fetch\(/);});
test('KiiiKiii retains its independent index and its exact single-group work theme',()=>{
 const registry=require('../data/artist-timeline-registry.json');
 const {workExperience}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-experience.ts');
 const group=registry.find(row=>row.slug==='kiiikiii');
 const elsewhere=registry.find(row=>row.slug==='nmixx');
 assert.match(fs.readFileSync('components/group-detail.tsx','utf8'),/g.id===KIIIKIII_GROUP_ID.*?kiiikiii-index-card/);
 const data={works:[{id:'kiii-work',groupIds:[group.groupId]}]};
 for(const artistReturn of [undefined,group.path,elsewhere.path]) {
  assert.equal(workExperience(data,{work:'kiii-work',artistReturn}).className,'kiiikiii-experience');
 }
});
test('KiiiKiii format stage includes verified alternatives and queue counts match rendered cards',()=>{const d=fixture();d.works[1].stageSupplement={alternatives:[{videoId:'abcdefghijk'}]};const html=setup('/artists/kiiikiii?section=works&format=stage',d).render();assert.match(html,/全部作品<span>1<\/span>/);assert.equal((html.match(/class="kk-work"/g)||[]).length,1);assert.match(html,/其他现场/);});
test('KiiiKiii official release and social dates never claim realtime or complete charts',()=>{assert.equal(content.asOf,'2026-10-15');assert.equal(content.releases[0].date,'2026-08-10');assert.equal(content.releases[0].title,'WhyKiiiKiii');assert.equal(content.profile.debutDate,'2025-03-24');assert.match(content.releaseCoverage.scope,/MV 上线日期不同/);const html=setup('/artists/kiiikiii?section=records').render();assert.doesNotMatch(html,/0 次|实时|全量已核/);});

test('KiiiKiii official hero uses the verified full banner bytes with retained attribution',()=>{assert.equal(content.hero.identitySourceUrl,'https://www.universal-music.co.jp/kiiikiii/biography/');assert.deepEqual(content.hero.dimensions,[1200,460]);assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+content.hero.image)).digest('hex'),content.hero.sha256);assert.match(fs.readFileSync('components/group-detail.tsx','utf8'),/src="\/artist\/kiiikiii\/hero.png"/);});

test('KiiiKiii MV filter excludes Track Film and Lyric Video without changing their original scores',()=>{const d=fixture();d.works[1].videoType='曲目短片';d.works[1].song='Delulu';d.works[1].url='https://youtube.com/watch?v=BTlj6Sls7KE';d.works[2].videoType='歌词视频';const all=setup('/artists/kiiikiii?section=works',d).render(),mv=setup('/artists/kiiikiii?section=works&format=mv',d).render(),featured=setup('/artists/kiiikiii',d).render();assert.equal((all.match(/class="kk-work"/g)||[]).length,3);assert.equal((mv.match(/class="kk-work"/g)||[]).length,1);assert.match(mv,/全部作品<span>1<\/span>/);assert.match(featured,/<h3>Delulu<\/h3>/);assert.doesNotMatch(featured,/at-background/);assert.doesNotMatch(featured,/MV · Delulu|进入 MV/);assert.equal(d.works[2].score,8);});

test('KiiiKiii known sales cannot turn unknown music-show wins into zero',()=>{const c=JSON.parse(JSON.stringify(content));c.releases[0].circle={copies:100,asOf:'2026-10-15',sourceUrl:'https://example.test/synthetic',cumulativeComplete:false};const html=setup('/artists/kiiikiii?section=records',fixture(),c).render();assert.match(html,/待整理/);assert.match(html,/空白不代表零次/);assert.doesNotMatch(html,/>0<em> 次/);});

test('the group information section associates KiiiKiii social counts with their source and observation date',async()=>{
 const records=require('../data/group-statistics-completion-evidence.json').groups.kiiikiii.social;
 const {formatFollowerCount}=await import('../lib/idol/follower-count.mjs');
 const html=setup('/artists/kiiikiii').render();
 const social=html.match(/<div class="group-info-social"[^>]*>([\s\S]*?)<\/div>/)[1];
 for(const row of records.filter(a=>a.accountExists&&a.observedValue>0&&a.observedAt)) {
  assert.ok(social.includes(row.url),row.platform);
  assert.ok(social.includes('<strong>'+formatFollowerCount(String(row.observedValue))+'</strong>'),row.platform);
  assert.ok(social.includes(row.observedAt.slice(0,10)),row.platform);
 }
 assert.doesNotMatch(social,/<strong>[^<]*(?:粉丝|订阅|followers|subscribers)/i);
});

test('member roster and detail visibly render Chinese first without renaming identity',()=>{
 const data=fixture(),member=data.members[0];member.cnName='测试中文名（音译）';
 const before=JSON.stringify(data);
 const roster=setup('/artists/kiiikiii?section=members',data).render();
 assert.ok(roster.includes('测试中文名 / '+member.stageName));
 const details=setup('/artists/kiiikiii?section=members&member='+member.id,data).render();
 assert.match(details,/<h1><span class="member-display-name">测试中文名<\/span><\/h1><p class="kk-stage-name">JIYU<\/p>/);
 assert.ok(!roster.includes('测试中文名（音译）')&&!details.includes('测试中文名（音译）'));
 assert.equal(JSON.stringify(data),before);
});
test('the debut home opens the full group photograph and links directly to the matching recording',()=>{
 const data=fixture(),work=data.works[0];
 work.id=content.debutCampaign.workId;work.song='I DO ME';
 const html=setup('/artists/kiiikiii',data).render();
 for(const file of [content.debutCampaign.logo,content.debutCampaign.group,content.debutCampaign.jar]) {
  assert.ok(html.includes('src="'+file+'"'));
  assert.ok(fs.existsSync('public'+file));
 }
 assert.ok(html.includes('href="'+content.debutCampaign.groupOriginal+'"'));
 assert.match(html,/<a[^>]+href="[^"]*work=rec28ldfRTrAb0[^"]*"[^>]*class="kk-campaign-work"|<a[^>]+class="kk-campaign-work"[^>]*href="[^"]*work=rec28ldfRTrAb0/);
 assert.ok(html.indexOf('kk-campaign-work') < html.indexOf('>专辑</h2>'));
 const source=fs.readFileSync('app/artists/kiiikiii/kiiikiii-artist.css','utf8');
 assert.ok(source.includes('Inter-Latin-Variable.woff2')&&source.includes('overflow-wrap:anywhere'));
});

test('kiiikiii approved looks retain native dimensions, exact private primary and qualified individual reference',()=>{
 const d=fixture();d.mode='live';const r=d.ratings[0];r.personalPhotoEligible=true;
 r.photo={table:'ratings',recordId:r.id,fieldId:'photos',index:4,sourceKind:'mv_look_photo'};
 r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 const url='/artists/kiiikiii?section=members&member=recM',before=JSON.stringify(d),html=setup(url,d).render();
 assert.match(html,/mv-look-native/);assert.match(html,/本MV同造型照片/);assert.doesNotMatch(html,/高清/);
 assert.match(html,/record=recR&amp;index=4/);assert.doesNotMatch(html,/<img[^>]+table=ratings[^>]+index=0/);assert.match(html,/原MV截图/);
 assert.match(html,/data-member-work-trigger="recSticky"/);assert.equal(JSON.stringify(d),before);
 r.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(setup(url,d).render(),/原MV截图/);
 r.referencePhoto.kind='本 MV 截图';r.referencePhoto.recordId='another';assert.doesNotMatch(setup(url,d).render(),/原MV截图/);
 r.photo.sourceKind='mv_still';const legacy=setup(url,d).render();assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
 r.personalPhotoEligible=false;assert.doesNotMatch(setup(url,d).render(),/record=recR/);
});

test('member search retains stable ordinals and detail return search',()=>{const d=fixture();d.members.push({...d.members[0],id:'recM2',stageName:'LEESOL',cnName:'李修旻'});const html=setup('/artists/kiiikiii?section=members&q=李修',d).render();assert.match(html,/MEMBER 02/);assert.doesNotMatch(html,/MEMBER 01/);assert.match(html,/1 位成员/);const empty=setup('/artists/kiiikiii?section=members&q=absent',d).render();assert.match(empty,/没有符合条件的成员/);const detail=setup('/artists/kiiikiii?section=members&member=recM&q=JIYU',d).render();assert.match(detail,/q%3DJIYU/);assert.match(detail,/查看 JIYU 原图/);});
test('release detail preserves search and uses exact work-video bindings, no phantom recordings',()=>{const d=fixture();const html=setup('/artists/kiiikiii?section=records&q=UNCUT&release=uncut-gem',d).render();assert.match(html,/PLAY THIS RELEASE/);assert.match(html,/recSticky/);assert.doesNotMatch(html,/recWho|recSweat/);assert.match(html,/q%3DUNCUT%26release%3Duncut-gem/);const absent=setup('/artists/kiiikiii?section=records&release=to-me-from-me',d).render();assert.match(absent,/尚未收录这张发行的相关影像/);assert.doesNotMatch(absent,/<a[^>]+href="[^"]*work=/);assert.match(setup('/artists/kiiikiii?section=records&release=unknown',d).render(),/未找到这张发行/);});
test('only the six known release IDs can return from shared records',()=>{const {load}=setup('/artists/kiiikiii'),{safeArtistReturn}=load('lib/idol/artist-navigation.ts');for(const r of content.releases){const url='/artists/kiiikiii?section=records&q=test&release='+r.id;assert.equal(safeArtistReturn(url),url);}for(const url of ['/artists/kiiikiii?section=records&release=unknown','/artists/kiiikiii?release=uncut-gem&release=uncut-gem','https://evil.test/artists/kiiikiii?release=uncut-gem','/artists/kiiikiii?release=uncut-gem#bad','/artists/kiiikiii?release=uncut-gem&media=x'])assert.equal(safeArtistReturn(url),null);});
test('the original I DO ME cut shows its exact STARSHIP preview in the work directory',()=>{
 const data=fixture();data.works[0].id='rec28ldfRTrAb0';
 const source='/artist/mv-identity-20261025/covers/hAEfi_SKTEU.jpg';
 const html=setup('/artists/kiiikiii?section=works',data).render();
 assert.ok(html.includes('src="'+source+'"'));assert.match(html,/对应视频封面/);
 data.works[0].url='https://youtube.com/watch?v=otherVideo1';
 assert.ok(!setup('/artists/kiiikiii?section=works',data).render().includes(source));
});

test('each native member route receives only its own I DO ME release photograph and retains the original',async()=>{
 const {registry,artistCatalog,renderArtist}=require('./fixtures/current-artist-pages.cjs');
 const {parse}=require('next/dist/compiled/node-html-parser');
 const artist=registry.find(item=>item.slug==='kiiikiii');
 const catalog=artistCatalog(artist);
 const edition=require('../data/mv-recognition-editions.json')['kiiikiii-uncut-gem-2025'];
 const binding=edition.works[0];
 const work=catalog.works.find(item=>item.id===binding.workId);
 assert.ok(work.url.includes(binding.videoId));
 for(const memberId of binding.memberIds){
  const rating={id:'recSyntheticDebutRating',memberIds:[memberId],workIds:[work.id],score:null,stylingScore:null,photo:null,recognition:'',note:'',memory:''};
  const html=await renderArtist(artist,{section:'members',member:memberId},{...catalog,ratings:[rating]});
  assert.ok(html.includes('src="'+edition.portraits[memberId].preview+'"'),memberId);
  const previous=parse(html).querySelector('button.mv-identity-previous');
  assert.equal(previous?.text,'查看原作品图',memberId);
  assert.equal(previous.getAttribute('aria-haspopup'),'dialog');
  for(const [other,photo] of Object.entries(edition.portraits)){
   if(other!==memberId)assert.ok(!html.includes('src="'+photo.preview+'"'),other);
  }
 }
});
