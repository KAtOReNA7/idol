const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const exportsObject={};
const code=ts.transpileModule(fs.readFileSync('components/work-video-player.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext('(function(exports,require){'+code+'})')(exportsObject,require);
const {WorkVideoPlayer}=exportsObject;
const source={workId:'recDemoWork',view:'mv',url:'https://www.youtube.com/watch?v=DemoVideo01',videoId:'DemoVideo01',embedUrl:'https://www.youtube.com/embed/DemoVideo01?autoplay=1',title:'合成作品'};
const render=props=>renderToStaticMarkup(React.createElement(WorkVideoPlayer,{...source,...props}));
test('MV renders a cover and explicit play control without an iframe',()=>{const html=render();assert.doesNotMatch(html,/<iframe/);assert.match(html,/合成作品 视频封面/);assert.match(html,/播放视频/);assert.doesNotMatch(html,/youtube\.com\/embed\//);});
test('stage clip is also dormant until user activation',()=>{const html=render({view:'stage',embedUrl:source.embedUrl+'&start=20&end=40'});assert.doesNotMatch(html,/<iframe|start=20/);assert.match(html,/播放舞台视频/);});
test('a bounded stage never inherits the full-event thumbnail and its work reference stays visible',()=>{
 const clip={view:'stage',url:source.url+'&t=20',sourceKey:source.videoId+'@20-40',embedUrl:source.embedUrl+'&start=20&end=40'};
 assert.doesNotMatch(render(clip),/<img|在原站观看/);
 const reference=render({...clip,posterSrc:'/artist/fixture/mv.jpg',posterLabel:'关联作品 MV 封面',posterIsReference:true});
 assert.match(reference,/class="work-preview-label">关联作品 MV 封面</);
 assert.doesNotMatch(reference,/i\.ytimg\.com|<iframe/);
});
test('matching public previews survive a video change, a range and multipart stage selection',()=>{
 const {approvedStagePoster,stagePreviewFallback,publicVideoPreview}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/lib/idol/approved-video-poster');
 const stages=require('../data/stage-videos.json'),inventory=require('../data/stages/inventory.json').works;
 const work=id=>({id,url:inventory.find(row=>row.recordId===id).mv.url});
 const meow=work('rec28ldfRTrB45'),source=stages[meow.id];
 const tile=stagePreviewFallback(meow,source);
 assert.equal(tile.src,'/artist/stage-video-previews/118STdpg-fY.webp');
 assert.equal(stagePreviewFallback(meow,{...source,url:'https://youtu.be/XXXXXXXXXXX'}),null);
 assert.equal(publicVideoPreview(source.url+'&t=21',''), '');
 for(const id of ['recvxyHuKMEruy','recvxyOz5Xr6ek']){
  const current=work(id),clip=stages[id],reference=stagePreviewFallback(current,clip);
  assert.equal(reference.workReference,true);
  assert.ok(reference.src.includes(new URL(current.url).searchParams.get('v')));
  assert.equal(stagePreviewFallback({...current,id:'wrong'},clip),null);
 }
 const id='recvxyH5pzoMAf',bounded=stages[id];
 assert.ok(approvedStagePoster(id,bounded).src);
 assert.equal(approvedStagePoster(id,{...bounded,bilibili:{...bounded.bilibili,cid:'999'}}),null);
});
test('unsupported external source keeps an explicit control and text cover',()=>{const html=render({videoId:null,embedUrl:null,url:'https://example.invalid/video'});assert.doesNotMatch(html,/<iframe|<img/);assert.match(html,/video-cover-fallback/);assert.match(html,/合成作品/);assert.match(html,/播放视频/);});
test('title is safely escaped in cover content',()=>{const html=render({videoId:null,title:'<合成 & 标题>'});assert.match(html,/&lt;合成 &amp; 标题&gt;/);assert.doesNotMatch(html,/<合成/);});


// Synthetic React state transitions. These prove event separation, not browser/CDN recovery.
function sessionHarness(props={}){
 const values=[],listeners=new Set(),timers=new Map(),messages=[];
 let cursor=0,opens=0,now=0,nextTimer=0,dependencies,cleanup,effect,frame,frameKey,frameRef;
 const win={
  open(){opens++;},
  addEventListener(type,listener){if(type==='message')listeners.add(listener);},
  removeEventListener(type,listener){if(type==='message')listeners.delete(listener);},
  setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,at:now+ms});return id;},
  clearTimeout(id){timers.delete(id);},
 };
 const mockReact={...React,
  useEffect(fn,deps){if(!dependencies||deps.some((v,i)=>!Object.is(v,dependencies[i]))){dependencies=deps;effect=fn;}},
  useRef(initial){const i=cursor++;return values[i]??(values[i]={current:initial});},
  useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next;}];}
 };
 const e={},js=ts.transpileModule(fs.readFileSync('components/work-video-player.tsx','utf8')+'\nexport {VideoSession};',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(exports,require){'+js+'})',{window:win})(e,name=>name==='react'?mockReact:require(name));
 function render(){
  cursor=0;
  const tree=e.VideoSession({...source,...props}),element=node(tree,'iframe');
  if(element?.key!==frameKey){
   frameRef?.(null);frameKey=element?.key;frameRef=element?.props.ref;
   frame=element?{focus(){},contentWindow:{postMessage:(data,origin)=>messages.push({data,origin})}}:null;
   frameRef?.(frame);
  }
  if(effect){cleanup?.();cleanup=effect();effect=undefined;}
  return tree;
 }
 return {render,opens:()=>opens,frame:()=>frame,timers,listeners,messages,
  advance(ms){now+=ms;for(const [id,t] of timers)if(t.at<=now){timers.delete(id);t.fn();}},
  message(data,origin='https://rutube.ru',source=frame?.contentWindow){for(const listener of listeners)listener({data,origin,source});},
  unmount(){frameRef?.(null);cleanup?.();}
 };
}
function nodes(tree){if(!tree||typeof tree!=='object')return [];return [tree,...React.Children.toArray(tree.props?.children).flatMap(nodes)];}
const node=(tree,type,className)=>nodes(tree).find(n=>n.type===type&&(!className||n.props.className===className));
test('BILLIONAIRE uses one manually activated OK player for the original edit and matching stage score',()=>{
 const {workPlayback}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-playback.ts');
 const id='rec28ldfRTrLku',video='Gz_yRl6703c',stage=require('../data/stage-videos.json')[id];
 const selected=workPlayback(id,video,'mv',null);
 assert.deepEqual(selected,{label:'OK Video',embedUrl:'https://ok.ru/videoembed/9392431106679',credit:'OK Video · 😍НОВОЕ ❤️ ЛУЧШЕЕ⭐МУЗ КЛИПЫ⭐ 转载'});
 assert.equal(workPlayback(id,video,'stage',stage).embedUrl,selected.embedUrl);
 assert.equal(stage.scoreBinding.videoId,video);
 for(const other of [null,{...stage,reusesOriginalVideo:false},{...stage,url:'https://example.org'},{...stage,clip:{startSeconds:0,endSeconds:20,sourceDurationSeconds:164}}]){
  assert.equal(workPlayback(id,video,'stage',other),null);
 }
 assert.equal(workPlayback(id,'MN2RlOy8y8k','mv',null),null);
 assert.equal(workPlayback('toString',video,'mv',null),null);
 const player=sessionHarness({workId:id,videoId:video,embedUrl:selected.embedUrl,playbackCredit:selected.credit,playbackLabel:selected.label});
 const initial=player.render(),frames=nodes(initial).filter(n=>n.type==='iframe');
 assert.equal(frames.length,1);assert.equal(frames[0].props.src,selected.embedUrl);
 assert.match(frames[0].props.allow,/^autoplay 'none';/);
 assert.equal(frames[0].props.allowFullScreen,true);
 assert.equal(node(initial,'button','video-play'),undefined);
 assert.match(renderToStaticMarkup(initial),/设置.*Качество（画质）.*Другое（其他）.*最高可用画质/);
 assert.doesNotMatch(renderToStaticMarkup(initial),/2160p/);
 assert.equal(player.timers.size,0);assert.equal(player.messages.length,0);assert.equal(player.opens(),0);
});
test('cover failure offers one explicit retry of the unchanged image without playback',()=>{
 for(const view of ['mv','stage']){
  const h=sessionHarness({view}),initial=h.render(),src=node(initial,'img').props.src;
  assert.equal(node(initial,'button','video-cover-retry'),undefined);
  node(initial,'img').props.onError();const failed=h.render();
  assert.ok(node(failed,'div','video-cover-fallback'));assert.equal(node(failed,'img'),undefined);
  node(failed,'button','video-cover-retry').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});const retried=h.render();
  assert.equal(node(retried,'img').props.src,src);assert.equal(node(retried,'iframe'),undefined);assert.equal(h.opens(),0);
  assert.equal(node(retried,'button','video-cover-retry'),undefined);
  // A second failure is terminal for the cover in this session, never an automatic loop.
  node(retried,'img').props.onError();const failedAgain=h.render();
  assert.ok(node(failedAgain,'div','video-cover-fallback'));assert.equal(node(failedAgain,'button','video-cover-retry'),undefined);
  assert.match(renderToStaticMarkup(failedAgain),/封面仍未加载，可直接播放视频/);
  node(failedAgain,'button','video-play').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});assert.equal(node(h.render(),'iframe').props.src,source.embedUrl);
 }
});
test('retry state keeps rendering the cover and external-only videos never offer a cover retry',()=>{
 const h=sessionHarness();node(h.render(),'img').props.onError();node(h.render(),'button','video-cover-retry').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});
 assert.ok(node(h.render(),'img'));assert.ok(node(h.render(),'img'));assert.equal(node(h.render(),'iframe'),undefined);
 const external=sessionHarness({videoId:null,embedUrl:null,url:'https://example.invalid/video'}),tree=external.render();
 assert.equal(node(tree,'button','video-cover-retry'),undefined);assert.equal(external.opens(),0);
 node(tree,'button','video-play').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});assert.equal(external.opens(),1);
});
test('retry scope follows existing media-session identity, not title or scoring state',()=>{
 const key=p=>WorkVideoPlayer({...source,...p}).key;
 for(const change of [{workId:'other'},{view:'stage'},{url:source.url+'&t=20'},{videoId:'other'},{embedUrl:source.embedUrl+'&start=20&end=40'}])assert.notEqual(key(change),key({}));
 assert.equal(key({title:'新标题'}),key({}));
 const fresh=sessionHarness();node(fresh.render(),'img').props.onError();assert.ok(node(fresh.render(),'button','video-cover-retry'));
});
test('reloading an active MV or ranged stage remounts only its exact embed after an explicit click',()=>{
 for(const view of ['mv','stage']){
  const embedUrl=source.embedUrl+(view==='stage'?'&start=20&end=40':'');
  const session=sessionHarness({view,embedUrl});
  assert.equal(node(session.render(),'button','video-reload'),undefined);
  node(session.render(),'button','video-play').props.onClick();
  const initial=node(session.render(),'iframe');
  assert.equal(node(session.render(),'iframe').key,initial.key);
  node(session.render(),'button','video-reload').props.onClick();
  const next=node(session.render(),'iframe');
  assert.notEqual(next.key,initial.key);
  assert.equal(next.props.src,embedUrl);
  assert.equal(next.props.title,initial.props.title);
  assert.equal(session.opens(),0);
 }
});
test('native retry button is keyboard-activatable without custom key interception',()=>{
 const h=sessionHarness();node(h.render(),'img').props.onError();const retry=node(h.render(),'button','video-cover-retry');
 assert.equal(retry.type,'button');assert.equal(retry.props.type,'button');assert.equal(retry.props.children,'重试封面');
 assert.equal(retry.props.disabled,undefined);assert.equal(retry.props.tabIndex,undefined);assert.equal(retry.props.onKeyDown,undefined);
 // Native Enter/Space activation dispatches click; exercise its shared handler.
 const active={ownerDocument:{}};
 active.ownerDocument.activeElement=active;
 let focused=false;
 node(h.render(),'button','video-play').props.ref.current={focus(){focused=true;}};
 retry.props.onClick({currentTarget:active});
 assert.equal(focused,true);
 assert.ok(node(h.render(),'img'));assert.equal(node(h.render(),'iframe'),undefined);
});
test('simulated React key remount resets retry state while a same-key render does not',()=>{
 let mountedKey,h;
 const renderSession=props=>{const key=WorkVideoPlayer({...source,...props}).key;if(key!==mountedKey){mountedKey=key;h=sessionHarness(props);}return h.render();};
 for(const props of [{},{view:'stage'},{workId:'another'},{embedUrl:source.embedUrl+'&start=20&end=40'}]){
  node(renderSession(props),'img').props.onError();
  node(renderSession(props),'button','video-cover-retry').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});
  node(renderSession(props),'img').props.onError();
  assert.equal(node(renderSession(props),'button','video-cover-retry'),undefined);
  assert.equal(node(renderSession({...props,title:'标题变化'}),'button','video-cover-retry'),undefined);
 }
});

test('explicit contain posters occupy the player box without intrinsic grid overflow',()=>{
 const h=sessionHarness({posterSrc:'/fixture/four-by-three.jpg',posterFit:'contain',posterLabel:'MV 预览图'});
 const img=node(h.render(),'img');
 assert.equal(img.props.style.position,'absolute');assert.equal(img.props.style.inset,0);
 for(const key of ['width','height','maxWidth','maxHeight'])assert.equal(img.props.style[key],'100%');
 assert.equal(img.props.style.objectFit,'contain');
 assert.equal(node(sessionHarness().render(),'img').props.style,undefined);
 assert.equal(node(h.render(),'iframe'),undefined);
 node(h.render(),'button','video-play').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});assert.equal(node(h.render(),'iframe').props.src,source.embedUrl);
});

test('small verified posters remain centered at their native size and retain retry/play behavior',()=>{
 const h=sessionHarness({posterSrc:'/fixture/preview-490.png',posterFit:'contain',posterSize:{width:490,height:266}});
 const initial=node(h.render(),'img');
 assert.equal(initial.props.style.maxWidth,490);assert.equal(initial.props.style.maxHeight,266);assert.equal(initial.props.style.margin,'auto');
 assert.equal(initial.props.style.width,'100%');assert.equal(initial.props.style.height,'100%');assert.equal(initial.props.style.objectFit,'contain');
 node(h.render(),'img').props.onError();node(h.render(),'button','video-cover-retry').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});
 assert.equal(node(h.render(),'img').props.src,initial.props.src);assert.deepEqual(node(h.render(),'img').props.style,initial.props.style);
 assert.equal(node(h.render(),'iframe'),undefined);assert.equal(h.opens(),0);
 node(h.render(),'button','video-play').props.onClick({currentTarget:{ownerDocument:{activeElement:null}}});assert.equal(node(h.render(),'iframe').props.src,source.embedUrl);
});

test('each confirmed work selects one exact player and preserves stage score identity',()=>{
 const {workPlayback}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-playback.ts');
 const {stageSourceKey,stageSourceMatchesUrl}=require('./helpers/public-artist-loader.cjs')('lib/idol/stage-source.ts');
 const mappings=require('../data/verified-work-players.json'),stages=require('../data/stage-videos.json');
 const okByWork={
  rec28ldfRTrLku:{video:'Gz_yRl6703c',player:'9392431106679',uploader:'😍НОВОЕ ❤️ ЛУЧШЕЕ⭐МУЗ КЛИПЫ⭐'},
  recvxyOz5X2J0A:{video:'js1CtxSY38I',player:'10326677850722',uploader:'HYBE LABELS'},
  recvxyOz5XSxiH:{video:'jOTfBlKSQYY',player:'5970279860834',uploader:'Владимир Горбатовский'}
 };
 const vimeoByWork={
  rec28ldfRTrzPI:{video:'Vk5-c_v4gMU',player:'930729644',credit:'COLORGRAF · 调色制作'},
  recvxyHuKMFzlZ:{video:'38xYeot-ciM',player:'1054517686',credit:'Yunah Sheep · 导演与剪辑'}
 };
 for(const [id,mapping] of Object.entries(mappings)){
  const video=mapping.original, route=workPlayback(id,video,'mv',null);
  assert.equal(route.fallbackPlayers,undefined,id);
  const vimeo=vimeoByWork[id];
  const ok=okByWork[id];
  if(ok){
   assert.equal(video,ok.video,id);
   assert.equal(route.label,'OK Video',id);
   assert.equal(route.embedUrl,`https://ok.ru/videoembed/${ok.player}`,id);
   assert.equal(route.credit,`OK Video · ${ok.uploader} 转载`,id);
  }else if(vimeo){
   assert.equal(video,vimeo.video,id);
   assert.equal(route.label,'Vimeo',id);
   assert.equal(route.embedUrl,`https://player.vimeo.com/video/${vimeo.player}?autoplay=1&muted=1&dnt=1&playsinline=1&quality=4k`,id);
   assert.equal(route.credit,`Vimeo · ${vimeo.credit}`,id);
  }else{
   assert.equal(route.label,'RUTUBE',id);
   assert.equal(route.embedUrl,`https://rutube.ru/play/embed/${mapping.rutube}?autostartmute=true&q=1080`,id);
   assert.equal(route.credit,`RUTUBE · ${mapping.uploader} 转载`,id);
  }
  assert.equal(workPlayback(id,'invalid','mv',null),null);
  assert.equal(workPlayback('invalid',video,'mv',null),null);
  const stage=stages[id]??null, sameEdit=stage?.reusesOriginalVideo&&stageSourceKey(stage)===video&&stageSourceMatchesUrl(stage);
  assert.deepEqual(workPlayback(id,video,'stage',stage),sameEdit?route:null,id);
 }
});

test('failed attempts retry the same selected source without opening another player or tab',()=>{
 const {workPlayback}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-playback.ts');
 const mappings=require('../data/verified-work-players.json');
 for(const id of ['rec28ldfRTrLku','recvxyOz5X2J0A','recvxyOz5XSxiH','rec28ldfRTrzPI','recvxyHuKMFzlZ']){
  const video=mappings[id].original, player=workPlayback(id,video,'mv',null);
  const h=sessionHarness({workId:id,videoId:video,embedUrl:player.embedUrl,playbackCredit:player.credit,playbackLabel:player.label});
  const initial=h.render();
  if(player.label==='OK Video'){
   assert.equal(node(initial,'button','video-play'),undefined);
   assert.ok(node(initial,'iframe'));
  }else{
   assert.ok(renderToStaticMarkup(initial).includes('播放视频（'+player.label+'）'));
   assert.equal(node(initial,'iframe'),undefined);
   node(initial,'button','video-play').props.onClick();
  }
  const first=node(h.render(),'iframe');
  first.props.onError({currentTarget:h.frame()});
  const failure=h.render();
  assert.equal(node(failure,'iframe'),undefined);
  assert.equal(node(failure,'p').props.role,'status');
  node(failure,'button','video-reload').props.onClick();
  const restored=h.render(),frames=nodes(restored).filter(x=>x.type==='iframe');
  assert.equal(frames.length,1);
  assert.notEqual(frames[0].key,first.key);
  assert.equal(frames[0].props.src,player.embedUrl);
  assert.equal(node(restored,'small','video-source-credit').props.children,player.credit);
  assert.equal(h.opens(),0);
 }
});

const rutubeEmbed='https://rutube.ru/play/embed/1234567890abcdef1234567890abcdef?autostartmute=true';
const waiting=tree=>node(tree,'p','video-start-notice');
function startSession(embedUrl=rutubeEmbed){
 const h=sessionHarness({embedUrl});
 node(h.render(),'button','video-play').props.onClick();h.render();
 return h;
}

test('an unstarted RUTUBE frame gets one inline wait notice at eight seconds, including when ready is absent',()=>{
 for(const ready of [false,true]){
  const h=startSession(),frame=h.frame();
  h.message({type:'player:init'});
  if(ready){
   h.message(JSON.stringify({type:'player:ready'}));
   h.message({type:'player:ready'});
   assert.deepEqual(h.messages,[{data:JSON.stringify({type:'player:play',data:{}}),origin:'https://rutube.ru'}]);
  }
  h.message({type:'player:changeState',data:{state:'paused'}});
  for(const time of [0,-1,NaN,Infinity,'2']){
   h.message({type:'player:currentTime',data:{time}});
  }
  h.message({type:'player:playStart'},'https://unrelated.invalid');
  h.message({type:'player:playStart'},'https://rutube.ru',{});
  h.advance(7999);assert.equal(waiting(h.render()),undefined);
  h.advance(1);
  const tree=h.render();
  assert.equal(waiting(tree).props.role,'status');
  assert.match(waiting(tree).props.children,/继续等待或重新加载视频/);
  assert.strictEqual(h.frame(),frame);
  assert.equal(node(tree,'iframe').props.src,rutubeEmbed);
  assert.ok(node(tree,'button','video-reload'));
  assert.equal(h.opens(),0);
  h.unmount();
 }
});

const currentTime=time=>({type:'player:currentTime',data:{time}});
test('player start, selected quality and stalled or reset positions keep the waiting notice available',()=>{
 const traces=[
  [{type:'player:playStart',data:{q_w:1920,q_h:880}}],
  [{type:'player:changeState',data:{state:'playing'}}],
  [{type:'player:currentQuality',data:{quality:{height:880}}},{type:'player:qualityList',data:{list:[880]}}],
  [currentTime(.125)], [currentTime(.125),currentTime(.125)], [currentTime(.25),currentTime(.125)],
  [currentTime(.125),currentTime(0),currentTime(.25)], [currentTime('0.125'),currentTime(.25)],
  ...['paused','stopped'].map(state=>[currentTime(.125),{type:'player:changeState',data:{state}},currentTime(.25)]),
 ];
 for(const events of traces)for(const afterHint of [false,true]){
  const h=startSession(),frame=h.frame();
  if(afterHint)h.advance(8000);
  for(const event of events)h.message(JSON.stringify(event));
  if(!afterHint)h.advance(8000);
  assert.ok(waiting(h.render()),JSON.stringify(events));
  assert.strictEqual(h.frame(),frame);
  h.unmount();
 }
});

test('two advancing trusted media times dismiss the notice and later user pauses do not bring it back',()=>{
 for(const afterHint of [false,true]){
  const h=startSession(),frame=h.frame();
  h.advance(afterHint?8000:7900);
  h.message(currentTime(.125));
  h.message(currentTime(.25),'https://unrelated.invalid');
  h.message(currentTime(.25),'https://rutube.ru',{});
  assert.equal(!!waiting(h.render()),afterHint);
  h.message(JSON.stringify(currentTime(.25)));
  assert.equal(waiting(h.render()),undefined);
  h.message({type:'player:changeState',data:{state:'paused'}});
  h.advance(20000);
  assert.equal(waiting(h.render()),undefined);
  assert.strictEqual(h.frame(),frame);
  assert.equal(h.timers.size,0);
  h.unmount();
 }
});

test('provider and native errors replace the wait notice and keep the same-source retry',()=>{
 for(const afterHint of [false,true]){
  for(const nativeError of [false,true]){
   const h=startSession();
   if(afterHint){h.advance(8000);assert.ok(waiting(h.render()));}
   if(nativeError)node(h.render(),'iframe').props.onError({currentTarget:h.frame()});
   else h.message({type:'player:error'});
   const tree=h.render();
   assert.equal(node(tree,'iframe'),undefined);
   assert.equal(waiting(tree),undefined);
   assert.match(node(tree,'p','video-cover-fallback').props.children,/视频暂时无法播放/);
   assert.equal(h.timers.size,0);assert.equal(h.listeners.size,0);
   node(tree,'button','video-reload').props.onClick();
   assert.equal(node(h.render(),'iframe').props.src,rutubeEmbed);
   assert.equal(waiting(h.render()),undefined);
   assert.equal(h.timers.size,1);h.unmount();
  }
 }
});

test('late messages, errors and timers from a replaced frame cannot affect its retry or another source',()=>{
 const h=startSession(),oldFrame=h.frame(),oldElement=node(h.render(),'iframe');
 const oldTimer=[...h.timers.values()][0].fn,oldListener=[...h.listeners][0];
 h.advance(8000);assert.ok(waiting(h.render()));
 h.message(currentTime(.125));
 node(h.render(),'button','video-reload').props.onClick();
 const replacement=node(h.render(),'iframe'),newFrame=h.frame();
 assert.notEqual(replacement.key,oldElement.key);
 assert.notStrictEqual(newFrame,oldFrame);
 oldTimer();oldListener({origin:'https://rutube.ru',source:oldFrame.contentWindow,data:{type:'player:error'}});
 oldElement.props.onError({currentTarget:oldFrame});
 h.message({type:'player:playStart'},'https://rutube.ru',oldFrame.contentWindow);
 h.message(currentTime(.2),'https://rutube.ru',oldFrame.contentWindow);
 h.message(currentTime(.25));
 assert.equal(waiting(h.render()),undefined);
 h.advance(8000);assert.ok(waiting(h.render()));assert.strictEqual(h.frame(),newFrame);
 h.unmount();
 assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
 for(const url of [source.embedUrl,'https://player.vimeo.com/video/123?muted=1']){
  assert.notEqual(WorkVideoPlayer({...source,embedUrl:url}).key,WorkVideoPlayer({...source,embedUrl:rutubeEmbed}).key);
  const next=startSession(url);oldTimer();next.advance(16000);
  assert.equal(waiting(next.render()),undefined);
  assert.equal(next.listeners.size,0);assert.equal(next.timers.size,0);next.unmount();
 }
});
