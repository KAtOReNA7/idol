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
 const values=[];let cursor=0,opens=0;
 const mockReact={...React,useEffect(){},useRef(initial){const i=cursor++;return values[i]??(values[i]={current:initial});},useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next;}];}};
 const e={},js=ts.transpileModule(fs.readFileSync('components/work-video-player.tsx','utf8')+'\nexport {VideoSession};',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(exports,require){'+js+'})',{window:{open(){opens++;}}})(e,name=>name==='react'?mockReact:require(name));
 return {render(){cursor=0;return e.VideoSession({...source,...props});},opens:()=>opens};
}
function nodes(tree){if(!tree||typeof tree!=='object')return [];return [tree,...React.Children.toArray(tree.props?.children).flatMap(nodes)];}
const node=(tree,type,className)=>nodes(tree).find(n=>n.type===type&&(!className||n.props.className===className));
test('a single HD player matches the full MV and the identical stage without changing its score identity',()=>{
 const {workPlayback}=require('./helpers/public-artist-loader.cjs')('lib/idol/work-playback.ts');
 const id='rec28ldfRTrLku',video='Gz_yRl6703c',stage=require('../data/stage-videos.json')[id];
 const selected=workPlayback(id,video,'mv',null),embed=new URL(selected.embedUrl);
 assert.equal(embed.origin,'https://rutube.ru');assert.equal(embed.searchParams.get('q'),'1080');
 assert.equal(embed.searchParams.get('autostartmute'),'true');
 assert.equal(workPlayback(id,video,'stage',stage).embedUrl,selected.embedUrl);
 assert.equal(stage.scoreBinding.videoId,video);
 for(const other of [null,{...stage,reusesOriginalVideo:false},{...stage,url:'https://example.org'},{...stage,clip:{startSeconds:0,endSeconds:20,sourceDurationSeconds:164}}]){
  assert.equal(workPlayback(id,video,'stage',other),null);
 }
 assert.equal(workPlayback(id,'MN2RlOy8y8k','mv',null),null);
 assert.equal(workPlayback('toString',video,'mv',null),null);
 const player=sessionHarness({embedUrl:selected.embedUrl});
 assert.equal(node(player.render(),'iframe'),undefined);
 node(player.render(),'button','video-play').props.onClick();
 assert.equal(nodes(player.render()).filter(n=>n.type==='iframe').length,1);
 assert.equal(node(player.render(),'iframe').props.src,selected.embedUrl);
 assert.equal(player.opens(),0);
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
