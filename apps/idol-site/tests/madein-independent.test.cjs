/* Real component SSR with public identity metadata and synthetic private values. */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react'), jsx = require('react/jsx-runtime');
const {renderToStaticMarkup} = require('react-dom/server');
const content = JSON.parse(fs.readFileSync('data/madein-artist.json'));
const publicMembers = JSON.parse(fs.readFileSync('tests/fixtures/madein-public-identities.json'));
const publicWorks = JSON.parse(fs.readFileSync('tests/fixtures/madein-public-works.json'));
const baseline = JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json'));
const timeline = JSON.parse(fs.readFileSync('data/artist-timelines/madein.json'));
function scene() {
 const memberSeed=baseline.members.find(m=>m.groupIds.includes(content.groupId));
 const workSeed=baseline.works.find(w=>w.groupIds.includes(content.groupId));
 return {...baseline,members:publicMembers.map(m=>({...memberSeed,...m})),ratings:[],works:publicWorks.map(w=>({...workSeed,...w,score:0,groupIds:[content.groupId]}))};
}
function renderer(data, url = '/artists/madein', options = {}, pageContent = content) {
  const cache = new Map(), elements = [], navigations = [], stateWrites = [];
  const history = {state:{artistScroll:{path:url,y:321}},pushState(state,unused,to){this.state=state;navigations.push(to);},replaceState(state,unused,to){this.state=state;navigations.push(to);}};
  const hooks = {...React,useEffect:()=>{},useLayoutEffect:()=>{},useSyncExternalStore:()=>url,
    useState:initial=>[initial,value=>stateWrites.push(value)]};
  const track = original => (type,props,...rest) => {elements.push({type,props});return original(type,props,...rest);};
  function load(file) {
    file=path.resolve(file);if(cache.has(file))return cache.get(file);
    if(file.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(file,'utf8'))};
    const out={};cache.set(file,out);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout,Event,
      requestAnimationFrame:fn=>{fn();return 1;},window:{history,scrollY:321,location:new URL(url,'https://site.invalid'),dispatchEvent:()=>{}},document:{getElementById:()=>({focus:()=>{},scrollIntoView:()=>{}})}})(name=>{
      if(name==='react')return hooks;
      if(name==='react/jsx-runtime')return {...jsx,jsx:track(jsx.jsx),jsxs:track(jsx.jsxs)};
      if(name==='@/components/use-artist-scroll')return {useArtistScroll:()=>()=>{}};
      if(name==='@/components/photo-lightbox')return {PhotoLightbox:()=>null};
      if(name==='@/components/artist-timeline-host')return {useArtistTimelineHostOptions:()=>({catalog:data,input:timeline,...options}),ArtistTimelineHost:()=>React.createElement('section',{'data-timeline-host':content.groupId})};
      const image=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(image!==undefined)return image;
      const dep=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(dep!==undefined)return dep;
      if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');
      if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');
      if(name.endsWith('.css'))return {};
      if(name.startsWith('@/')||name.startsWith('.')){const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>target+ext).find(p=>fs.existsSync(p))??target);}
      return require(name);
    },out);return out;
  }
  const module=load('components/candidate/madein-design.tsx');
  return {html:renderToStaticMarkup(React.createElement(module.default,{content:pageContent})),module,elements,navigations,load,history,stateWrites};
}
const urls = html => [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
const memberIds = html => [...html.matchAll(/data-artist-member-trigger="([^"]+)"/g)].map(m=>m[1]);
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
test('Figma photographic home retains all seven identities, three featured works and links to complete library',()=>{
 const data=scene(),before=JSON.stringify(data);freeze(data);const {html}=renderer(data);
 assert.deepEqual(memberIds(html),['rec28ldbniBgam','rec28ldbniBghr','rec28ldbniBgoz','rec28ldbniBgvC','rec28ldbniBgCI','rec28ldbniBgJR','rec28ldbniBgYn']);
 assert.equal((html.match(/data-work-id=/g)||[]).length,3);
 for(const id of ['rec28ldfRTrPen','rec28ldfRTrCLV','rec28ldfRTrCHR'])assert.ok(html.includes('work='+id));
 assert.match(html,/group-display.webp/);assert.match(html,/super-obvious-mv.jpg/);assert.match(html,/全部作品 →/);
 assert.equal((html.match(/data-timeline-host=/g)||[]).length,1);
 const library=renderer(data,'/artists/madein?section=works').html;for(const w of publicWorks)assert.ok(library.includes('work='+w.id));
 assert.doesNotMatch(html,/CandidateComposition|madein-atelier|roster=history|现役|WORK IN PROGRESS/);assert.equal(JSON.stringify(data),before);
});

test('every member deep link uses shared Chinese identity and exact MADEIN return without a historical roster query',()=>{
 for(const m of publicMembers){const url='/artists/madein?section=members&member='+m.id;const {html}=renderer(scene(),url);assert.ok(html.includes(m.cnName));const target=urls(html).find(h=>h.startsWith('/?')&&h.includes('member='+m.id));assert.equal(new URL(target,'https://site.invalid').searchParams.get('returnTo'),url);}
 assert.match(renderer(scene(),'/artists/madein?member=recUnknown').html,/这个成员不在本团档案中/);
});
test('GAEUN uses identity-checked historical photo with credit, never the six-person current portrait grid',()=>{
 const m=publicMembers.find(m=>m.stageName==='GAEUN'),url='/artists/madein?section=members&member='+m.id;
 const data=scene();data.members.find(x=>x.id===m.id).photo=null;
 const html=renderer(data,url).html;assert.match(html,/gaeun-202407-profile.jpg/);assert.match(html,/2024年历史资料照/);assert.match(html,/©2024 143ENTERTAINMENT/);assert.match(html,/已离团/);
 data.members.find(x=>x.id===m.id).photo={table:'members',recordId:'recWrong',index:0};assert.doesNotMatch(renderer(data,url).html,/record=recWrong/);
 data.members.find(x=>x.id===m.id).stageName='SYNTHETIC_DRIFT';assert.doesNotMatch(renderer(data,url).html,/gaeun-202407-profile.jpg/);
 assert.equal((renderer(scene()).html.match(/class="portrait-card"/g)||[]).length,6);
});

test('personal summaries retain cross-group works and unique zero dimensions while group catalog excludes them',()=>{
 const data=scene(),m=data.members[0];const extra={...data.works[0],id:'recSyntheticSolo',name:'合成旧团独唱',song:'合成旧团独唱',groupIds:['recSyntheticOther'],score:9};data.works.push(extra);
 data.ratings=[{id:'recSyntheticRating',memberIds:[m.id],workIds:[extra.id],score:0,stylingScore:0,note:'synthetic',memory:'',photo:null,recognition:''}];
 const before=JSON.stringify(data);freeze(data);const html=renderer(data,'/artists/madein?section=members&member='+m.id).html;
 assert.ok(html.includes('data-member-work-trigger="recSyntheticSolo"'));assert.match(html,/表现 0.0 · 造型 0.0/);assert.match(html,/作品综合分<strong>0.0/);
 assert.ok(!renderer(data,'/artists/madein?section=works').html.includes('合成旧团独唱'));assert.equal(JSON.stringify(data),before);
});
test('zero/null scores, explicit watched states and unknown queues preserve original values and context',()=>{
 const data=scene();for(const [i,value] of ['已观看','未观看','','synthetic-unknown'].entries()){data.works[i].watched=value;data.works[i].score=null;}data.works[4].score=0;
 const before=JSON.stringify(data),url='/artists/madein?section=works&queue=tonight&q=&format=mv',r=renderer(data,url);
 assert.ok(!r.html.includes('data-work-id="'+data.works[0].id+'"'));
 for(const i of [1,2,3])assert.ok(r.html.includes('data-work-id="'+data.works[i].id+'"'));
 assert.match(r.html,/观看未标记/);assert.match(renderer(data,'/artists/madein?section=works').html,/<b>0.0<\/b>/);
 for(const href of urls(r.html).filter(h=>h.startsWith('/?')&&h.includes('work='))){assert.equal(new URL(href,'https://site.invalid').searchParams.get('returnTo'),'/artists/madein?section=works&queue=tonight&format=mv');}
 assert.equal(JSON.stringify(data),before);
});
test('loading/error/missing group and missing release targets never manufacture private rows',()=>{
 assert.match(renderer(null,'/artists/madein',{loading:true}).html,/正在打开/);
 assert.match(renderer(null,'/artists/madein',{error:'synthetic-read-failure'}).html,/synthetic-read-failure/);
 const data=scene();data.groups=[];assert.match(renderer(data).html,/暂未找到团体资料/);
 const empty=scene();empty.works=[];assert.match(renderer(empty).html,/作品记录暂不可用/);assert.equal((renderer(empty).html.match(/data-work-id=/g)||[]).length,0);
});
test('Figma static assets are local nonempty originals with explicit design-slot geometry',()=>{
 const html=renderer(scene()).html;for(const tag of [...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0])){const src=tag.match(/src="([^"]+)"/)[1];assert.ok(src.startsWith('/artist/madein/'));assert.ok(fs.statSync('public'+src).size>0);assert.match(tag,/width="\d+"/);assert.match(tag,/height="\d+"/);}
 const crypto=require('node:crypto');for(const [file,hash] of Object.entries({'rise-cover.jpg':'eb3441ab17f2b36e4734942d857ef3d7b3a115742f4b3bae7a685243cc1682e5','girl-meets-boy-cover.jpg':'93c884485b9538f259cdfe2a74cab54819b4c72fea76df35344f62322d4a1ca1','madein-forever-cover.jpg':'f5a6c1710a7810c323a21088c0686b8d5f03c229a9982b66df8867218ab8b658','gaeun-202407-profile.jpg':'e0c9e66ff941979e4061904fc9f84f90ebf977ec3cc6b833b80126a191d802c1'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/artist/madein/figma-20261017/'+file)).digest('hex'),hash);
 assert.doesNotMatch(html,/figma.com\/api\/mcp\/asset/);
});

test('source stays read-only, whole-response personal math, existing return/scroll and single production host',()=>{
 const source=fs.readFileSync('components/candidate/madein-design.tsx','utf8');
 assert.match(source,/memberWorks\(state.data,m.id\)/);assert.match(source,/artistCollection\(state.data,content.groupId\)/);assert.match(source,/useArtistScroll/);assert.match(source,/newArtistHistoryState/);
 assert.equal((source.match(/<ArtistTimelineHost\s/g)||[]).length,1);assert.doesNotMatch(source,/CandidateArtistExperience|CandidateComposition|\/api\/save|method:\s*['"](?:POST|PUT)|roster:\s*['"]history/);
 const css=fs.readFileSync('app/artists/madein/madein-artist.css','utf8');require('postcss').parse(css).walkRules(rule=>{for(const selector of rule.selectors)assert.ok(selector.startsWith('.madein-independent'),selector);});
});
test('work editorial drift suppresses featured imagery while ordinary library records remain reachable',()=>{
 for(const field of ['song','url','duplicate']){const data=scene(),w=data.works.find(w=>w.id==='rec28ldfRTrPen');if(field==='duplicate')data.works.push({...w});else w[field]='synthetic-drift';const html=renderer(data).html;assert.match(html,/作品记录暂不可用/);assert.doesNotMatch(html,/super-obvious-mv.jpg/);const library=renderer(data,'/artists/madein?section=works').html;assert.ok(library.includes('data-work-id="'+w.id+'"'));assert.ok(library.includes('work='+w.id));assert.doesNotMatch(library,/super-obvious-mv.jpg/);}
 const data=scene();data.works.find(w=>w.id==='rec28ldfRTrPen').groupIds=['recOther'];assert.ok(!renderer(data).html.includes('work=rec28ldfRTrPen'));
});

test('member period claims require exact stable name and affiliation; unknown members remain reachable',()=>{
 const data=scene();const m=data.members[0];m.stageName='SYNTHETIC_DRIFT';const html=renderer(data,'/artists/madein?section=members&member='+m.id).html;
 assert.doesNotMatch(html,/Girl Meets Boy 时期成员|RISE 时期成员/);assert.ok(html.includes('member='+m.id));
 data.members.push({...m,id:'recSyntheticNew',stageName:'SYNTHETIC_NEW',cnName:'合成新成员'});assert.ok(renderer(data).html.includes('recSyntheticNew'));
 assert.doesNotMatch(renderer(data,'/artists/madein?section=members&member=recSyntheticNew').html,/时期成员/);
});
test('portrait navigation retains exact member origin and clears unrelated history; menu and filters are interactive',()=>{
 const r=renderer(scene());const trigger=r.elements.find(e=>e.type==='button'&&e.props['data-artist-member-trigger']===publicMembers[0].id);trigger.props.onClick();assert.equal(r.navigations.at(-1),'/artists/madein?section=members&member='+publicMembers[0].id);assert.equal(r.history.state.madeinMemberOrigin.path,'/artists/madein');assert.equal(r.history.state.madeinMemberOrigin.y,321);assert.ok(!r.history.state.madeinEditorial);assert.ok(!r.history.state.timelineReturn);
 const menu=r.elements.find(e=>e.props['aria-controls']==='mi-navigation');assert.equal(menu.props['aria-expanded'],false);assert.equal(typeof menu.props.onClick,'function');
 const roster=renderer(scene(),'/artists/madein?section=members');const filters=roster.elements.filter(e=>e.type==='button'&&'aria-pressed' in e.props);assert.equal(filters.length,4);filters[2].props.onClick();assert.equal(roster.stateWrites.at(-1),'暂停活动');
});

test('records retains personal work filtering, no fake MV missing-image copy, verified image fallbacks reserve dimensions',()=>{
 const html=renderer(scene(),'/artists/madein?section=records').html;assert.match(html,/<h2>我的记录/);assert.match(html,/看过待评分/);assert.match(html,/高分重温/);
 const detail=renderer(scene(),'/artists/madein?section=members&member='+publicMembers[0].id).html;assert.doesNotMatch(detail,/本 MV 个人造型图暂缺|LOVE, AFRAID/);
 const source=fs.readFileSync('components/candidate/madein-design.tsx','utf8');assert.match(source,/fallbackStyle=\{dims\?/);assert.match(source,/madeinRosterFocus/);assert.match(source,/safeArtistReturn\(origin.path\)/);
});
test('320 and 390 responsive contracts preserve complete portraits, wrapping names and usable menu targets',()=>{
 const css=require('postcss').parse(fs.readFileSync('app/artists/madein/madein-artist.css','utf8'));const decls=(selector,media)=>{let found;css.walkRules(rule=>{if(rule.selectors.includes(selector)&&(!media||rule.parent.type==='atrule'&&rule.parent.params===media))found=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));});return found;};
 assert.equal(decls('.madein-independent .portrait-grid','(max-width:600px)')['grid-template-columns'],'repeat(2,minmax(0,1fr))');
 assert.equal(decls('.madein-independent .menu-toggle','(max-width:600px)')['min-height'],'44px');assert.equal(decls('.madein-independent .member-identity h1')['overflow-wrap'],'anywhere');
 assert.equal(decls('.madein-independent .hero-caption','(max-width:600px)').position,'static');assert.equal(decls('.madein-independent .mi-main').padding,'0');
 assert.equal(decls('.madein-independent .portrait-open>img')['object-fit'],'contain');assert.equal(decls('.madein-independent .hero-image img')['aspect-ratio'],'1440/733.68');
});

test('portrait failure keeps a real grid ratio box instead of an inline collapsing span',()=>{
 const {elements}=renderer(scene());const picture=elements.find(e=>e.props?.src===content.portraits[publicMembers[0].id].image&&e.props.fallbackStyle);
 assert.ok(picture);assert.equal(picture.props.fallbackStyle.display,'grid');assert.equal(picture.props.fallbackStyle.placeItems,'center');assert.equal(picture.props.fallbackStyle.aspectRatio,'2 / 3');assert.equal(picture.props.fallbackStyle.width,'100%');assert.equal(picture.props.fallbackStyle.minHeight,0);
});

test('completed roster focus token is consumed before a later lightbox close can steal focus',()=>{
 const text=fs.readFileSync('components/candidate/madein-design.tsx','utf8');const ast=ts.createSourceFile('madein.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let effect;
 function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='useEffect'&&node.arguments[0]?.getText(ast).includes('madeinRosterFocus'))effect=node.arguments[0].getText(ast);ts.forEachChild(node,visit);}visit(ast);assert.ok(effect);
 const saved={path:'/artists/madein',key:'recSyntheticMember'},history={state:{madeinRosterFocus:saved,artistScroll:{path:'/artists/madein',y:321},madeinEditorial:{path:'/artists/madein',track:'rec28ldfRTrPi9'}},replaceState(next){this.state=next;}};
 let focused=0,callback;const details={open:false};const target={dataset:{artistMemberTrigger:saved.key},closest:()=>details,focus:()=>{focused++;}};
 const context={state:{data:{}},route:{member:null},lightbox:null,returnTo:'/artists/madein',window:{history,location:{href:'https://site.invalid/artists/madein'}},document:{querySelectorAll:()=>[target],querySelector:()=>null},requestAnimationFrame:f=>{callback=f;return 1;},cancelAnimationFrame(){}};
 const code=ts.transpileModule('const run='+effect+';run();',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,context);callback();assert.equal(focused,1);assert.equal(details.open,true);assert.equal(history.state.madeinRosterFocus,undefined);assert.equal(history.state.artistScroll.y,321);assert.equal(history.state.madeinEditorial.track,'rec28ldfRTrPi9');
 callback=null;vm.runInNewContext(code,{...context});assert.equal(callback,null);assert.equal(focused,1,'lightbox close must leave its own restored image trigger focused');
 history.state.madeinRosterFocus=saved;vm.runInNewContext(code,{...context});history.state.madeinRosterFocus={path:'/artists/madein?section=members',key:saved.key};callback();assert.equal(focused,1,'a changed entry path cancels the scheduled focus');assert.ok(history.state.madeinRosterFocus);
 history.state.madeinRosterFocus=saved;vm.runInNewContext(code,{...context,document:{querySelectorAll:()=>[target],querySelector:()=>({})}});callback();assert.equal(focused,1,'a live modal blocks scheduled focus');assert.ok(history.state.madeinRosterFocus);
});

test('new hero and portrait lightboxes resolve full originals while old derivative helper stays guarded',()=>{
 const r=renderer(scene()),map=r.load('lib/idol/madein-photo-display.ts').madeinDisplayPhoto;
 const hero=r.elements.find(e=>e.type==='button'&&e.props.className==='hero-image photo');hero.props.onClick();assert.equal(r.stateWrites.at(-1).src,'/artist/madein/batch-b-20261016/group-original.jpg');
 const detail=renderer(scene(),'/artists/madein?section=members&member='+publicMembers[0].id);const button=detail.elements.find(e=>e.type==='button'&&e.props.children==='查看原图 ↗');button.props.onClick();assert.equal(detail.stateWrites.at(-1).src,'/artist/madein/batch-b-20261016/mashiro-original.jpg');
 const manifest=JSON.parse(fs.readFileSync('research/madein-independent/display-derivatives.json'));for(const a of manifest.assets)assert.equal(map(a.originalPath),a.displayPath);
 for(const src of ['__proto__','/api/media?table=members&record=recSynthetic&index=0','/artist/madein/independent-20261016/girl-meets-boy-press-03.jpg',manifest.assets[0].originalPath+'?changed=1','https://example.invalid'+manifest.assets[0].originalPath])assert.equal(map(src),src);
});

test('q95 byte provenance and retained original source mapping are exact',()=>{
 const crypto=require('node:crypto'),manifest=JSON.parse(fs.readFileSync('research/madein-independent/display-derivatives.json')),originals=JSON.parse(fs.readFileSync('data/madein-editorial-images.json')),sizes=JSON.parse(fs.readFileSync('data/madein-image-dimensions.json'));
 assert.equal(manifest.assets.length,3);let originalBytes=0,displayBytes=0;
 for(const a of manifest.assets){for(const kind of ['original','display']){const bytes=fs.readFileSync('public'+a[kind+'Path']);assert.equal(bytes.length,a[kind+'Bytes']);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a[kind+'SHA256']);}assert.ok(Object.values(originals).includes(a.originalPath));assert.ok(!Object.values(originals).includes(a.displayPath));assert.deepEqual(sizes[a.displayPath],sizes[a.originalPath]);assert.equal(a.lossy,true);originalBytes+=a.originalBytes;displayBytes+=a.displayBytes;}
 assert.equal(originalBytes,3262328);assert.equal(displayBytes,1248542);assert.equal(originalBytes-displayBytes,manifest.savingBytes);assert.equal(fs.readdirSync('public/artist/madein/independent-20261016/display-q95').length,3);
});
test('failed display retry retains derivative request and original identity without contaminating lightbox',()=>{
 const r=renderer(scene()),p=r.load('lib/idol/image-presentation.ts'),manifest=JSON.parse(fs.readFileSync('research/madein-independent/display-derivatives.json'));
 for(const a of manifest.assets){let state=p.createImagePresentation(a.displayPath,a.originalPath);state=p.commitImageResult(state,0,'error');state=p.retryImagePresentation(state,0,1000);assert.equal(state.status,'loading');assert.equal(state.source,a.displayPath);assert.equal(state.identityKey,a.originalPath);assert.equal(p.imageAttemptSource(state.source,state.attempt),a.displayPath);assert.notEqual(p.imageInputKey(a.displayPath,a.originalPath),p.imageInputKey(a.originalPath,a.originalPath));}
});

test('full Chinese names survive both portrait cards and member identities without truncation',()=>{
 const data=scene(),m=data.members[0];m.cnName='超长中文姓名用于窄屏完整展示验证';m.name=m.cnName;
 const roster=renderer(data,'/artists/madein?section=members').html;const profile=renderer(data,'/artists/madein?section=members&member='+m.id).html;
 assert.ok(roster.includes(m.cnName));assert.ok(profile.includes(m.cnName));const css=fs.readFileSync('app/artists/madein/madein-artist.css','utf8');assert.doesNotMatch(css,/text-overflow:\s*ellipsis|line-clamp/);
});
test('stage image is bound to its exact Super Obvious formal-stage video, never to another stage',()=>{
 const data=scene(),w=data.works.find(w=>w.id==='rec28ldfRTrPen');w.stage={videoId:'eucm0SOw4QQ',url:'https://www.youtube.com/watch?v=eucm0SOw4QQ',title:'M COUNTDOWN EP.916',channel:'Mnet K-POP'};
 const html=renderer(data,'/artists/madein?section=works').html;assert.match(html,/super-obvious-ep916-figma-render.png/);assert.ok(urls(html).some(h=>h.includes('work='+w.id)&&h.includes('video=stage')));
 w.stage.videoId='differentSource';assert.doesNotMatch(renderer(data,'/artists/madein?section=works').html,/super-obvious-ep916-figma-render.png/);
});
test('SATURN library uses the exact production stage image without mutating personal records',()=>{
 const data=scene(),work=data.works.find(w=>w.id==='rec28ldfRTrCHR');work.stage=JSON.parse(fs.readFileSync('data/stage-videos.json')).rec28ldfRTrCHR;
 const before=JSON.stringify(data);freeze(data);
 const html=renderer(data,'/artists/madein?section=works&format=stage').html;
 assert.match(html,/saturn-the-show-250311-original.jpg/);assert.match(html,/<img[^>]*width="640"[^>]*height="360"[^>]*alt="SATURN · THE SHOW 250311"/);assert.equal(JSON.stringify(data),before);
 for(const change of [{videoId:'other'},{url:'https://www.youtube.com/watch?v=other'},{clip:{startSeconds:1,endSeconds:5}}]){
 const drift=structuredClone(data);drift.works.find(w=>w.id===work.id).stage={...work.stage,...change};assert.doesNotMatch(renderer(drift,'/artists/madein?section=works&format=stage').html,/saturn-the-show-250311-original.jpg/);
 }
});


test('nullable or empty hero sources never open a broken lightbox; valid sources still open originals',()=>{
 for(const image of [null,'',content.hero.image]){
  const pageContent={...content,hero:{...content.hero,image}};
  const data=scene(),before=JSON.stringify({data,pageContent});freeze(data);freeze(pageContent);
  const r=renderer(data,undefined,{},pageContent);
  const trigger=r.elements.find(e=>e.type==='button'&&e.props['aria-label']==='放大MADEIN团体照');
  assert.ok(trigger);assert.equal(trigger.props.disabled,!image);
  trigger.props.onClick();
  if(image){assert.equal(r.stateWrites.length,1);assert.equal(r.stateWrites[0].label,'MADEIN');assert.equal(r.stateWrites[0].src,image.replace('/batch-b-20261016-webp-v1/','/batch-b-20261016/').replace('-display.webp','-original.jpg'));}
  else assert.equal(r.stateWrites.length,0);
  assert.equal(JSON.stringify({data,pageContent}),before);
 }
});

test('historical Kep1er works retain qualified photos and original references inside MADEIN personal details',()=>{
 for(const name of ['MASHIRO','YESEO']){
  const data=scene();data.mode='live';const m=data.members.find(m=>m.stageName===name);assert.ok(m);
  const work={...data.works[0],id:'recHistoricalWaDaDa',song:'WA DA DA',name:'WA DA DA',groupIds:['recHistoricalKep1er'],url:'https://www.youtube.com/watch?v=n0j5NPptyM0',score:0};data.works.push(work);
  const rating={id:'recHistoricalRating',memberIds:[m.id],workIds:[work.id],score:0,stylingScore:null,recognition:'',note:'',memory:'',photo:{table:'ratings',recordId:'recHistoricalRating',fieldId:'photos',index:1,sourceKind:'mv_look_photo',approvedLookIdentity:{sameLook:true,memberId:m.id,workId:work.id,videoId:'n0j5NPptyM0'}}};
  rating.referencePhoto={...rating.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};data.ratings.push(rating);
  const url='/artists/madein?section=members&member='+m.id,before=JSON.stringify(data),result=renderer(data,url),html=result.html;
  assert.match(html,/<details class="personal-records">/);assert.match(html,/WA DA DA/);assert.match(html,/class="photo mv-look-native"/);assert.match(html,/本MV同造型照片/);assert.doesNotMatch(html,/高清/);
  assert.match(html,/record=recHistoricalRating&amp;index=1/);assert.doesNotMatch(html,/<img[^>]+record=recHistoricalRating[^>]+index=0/);assert.match(html,/原MV截图/);
  assert.match(html,/data-member-work-trigger="recHistoricalWaDaDa"/);assert.ok(html.includes('returnTo='+encodeURIComponent(url)));assert.match(html,/表现 0.0 · 造型 未评分/);
  assert.equal(JSON.stringify(data),before);assert.deepEqual(m.groupIds,[content.groupId]);
  rating.referencePhoto.kind='本 MV 合照拼图';assert.doesNotMatch(renderer(data,url).html,/原MV截图/);
  rating.referencePhoto.kind='本 MV 截图';rating.referencePhoto.recordId='another';assert.doesNotMatch(renderer(data,url).html,/原MV截图/);
  rating.photo.sourceKind='mv_still';rating.photo.kind='本 MV 截图';rating.photo.nativeIdentity={memberId:m.id,workId:work.id};
  const legacy=renderer(data,url).html;assert.match(legacy,/record=recHistoricalRating&amp;index=1/);assert.doesNotMatch(legacy,/mv-look-native|本MV同造型照片|原MV截图/);
  rating.photo=null;const missing=renderer(data,url).html;assert.match(missing,/WA DA DA/);assert.doesNotMatch(missing,/record=recHistoricalRating|mv-look-native|原MV截图/);
 }
});
