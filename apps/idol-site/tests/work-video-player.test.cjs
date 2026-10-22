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
const source={workId:'recDemoWork',view:'mv',url:'https://www.youtube.com/watch?v=DemoVideo01',videoId:'DemoVideo01',embedUrl:'https://www.youtube-nocookie.com/embed/DemoVideo01?autoplay=1',title:'合成作品'};
const render=props=>renderToStaticMarkup(React.createElement(WorkVideoPlayer,{...source,...props}));
test('MV renders a cover and explicit play control without an iframe',()=>{const html=render();assert.doesNotMatch(html,/<iframe/);assert.match(html,/合成作品 视频封面/);assert.match(html,/播放视频/);assert.doesNotMatch(html,/youtube-nocookie/);});
test('stage clip is also dormant until user activation',()=>{const html=render({view:'stage',embedUrl:source.embedUrl+'&start=20&end=40'});assert.doesNotMatch(html,/<iframe|start=20/);assert.match(html,/播放舞台视频/);});
test('unsupported external source keeps an explicit control and text cover',()=>{const html=render({videoId:null,embedUrl:null,url:'https://example.invalid/video'});assert.doesNotMatch(html,/<iframe|<img/);assert.match(html,/video-cover-fallback/);assert.match(html,/合成作品/);assert.match(html,/播放视频/);});
test('title is safely escaped in cover content',()=>{const html=render({videoId:null,title:'<合成 & 标题>'});assert.match(html,/&lt;合成 &amp; 标题&gt;/);assert.doesNotMatch(html,/<合成/);});


// Synthetic React state transitions. These prove event separation, not browser/CDN recovery.
function sessionHarness(props={}){
 const values=[];let cursor=0,opens=0;
 const mockReact={...React,useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next;}];}};
 const e={},js=ts.transpileModule(fs.readFileSync('components/work-video-player.tsx','utf8')+'\nexport {VideoSession};',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext('(function(exports,require){'+js+'})',{window:{open(){opens++;}}})(e,name=>name==='react'?mockReact:require(name));
 return {render(){cursor=0;return e.VideoSession({...source,...props});},opens:()=>opens};
}
function nodes(tree){if(!tree||typeof tree!=='object')return [];return [tree,...React.Children.toArray(tree.props?.children).flatMap(nodes)];}
const node=(tree,type,className)=>nodes(tree).find(n=>n.type===type&&(!className||n.props.className===className));
test('cover failure offers one explicit retry of the unchanged image without playback',()=>{
 for(const view of ['mv','stage']){
  const h=sessionHarness({view}),initial=h.render(),src=node(initial,'img').props.src;
  assert.equal(node(initial,'button','video-cover-retry'),undefined);
  node(initial,'img').props.onError();const failed=h.render();
  assert.ok(node(failed,'div','video-cover-fallback'));assert.equal(node(failed,'img'),undefined);
  node(failed,'button','video-cover-retry').props.onClick();const retried=h.render();
  assert.equal(node(retried,'img').props.src,src);assert.equal(node(retried,'iframe'),undefined);assert.equal(h.opens(),0);
  assert.equal(node(retried,'button','video-cover-retry'),undefined);
  // A second failure is terminal for the cover in this session, never an automatic loop.
  node(retried,'img').props.onError();const failedAgain=h.render();
  assert.ok(node(failedAgain,'div','video-cover-fallback'));assert.equal(node(failedAgain,'button','video-cover-retry'),undefined);
  assert.match(renderToStaticMarkup(failedAgain),/封面仍未加载，可直接播放视频/);
  node(failedAgain,'button','video-play').props.onClick();assert.equal(node(h.render(),'iframe').props.src,source.embedUrl);
 }
});
test('retry state keeps rendering the cover and external-only videos never offer a cover retry',()=>{
 const h=sessionHarness();node(h.render(),'img').props.onError();node(h.render(),'button','video-cover-retry').props.onClick();
 assert.ok(node(h.render(),'img'));assert.ok(node(h.render(),'img'));assert.equal(node(h.render(),'iframe'),undefined);
 const external=sessionHarness({videoId:null,embedUrl:null,url:'https://example.invalid/video'}),tree=external.render();
 assert.equal(node(tree,'button','video-cover-retry'),undefined);assert.equal(external.opens(),0);
 node(tree,'button','video-play').props.onClick();assert.equal(external.opens(),1);
});
test('retry scope follows existing media-session identity, not title or scoring state',()=>{
 const key=p=>WorkVideoPlayer({...source,...p}).key;
 for(const change of [{workId:'other'},{view:'stage'},{url:source.url+'&t=20'},{videoId:'other'},{embedUrl:source.embedUrl+'&start=20&end=40'}])assert.notEqual(key(change),key({}));
 assert.equal(key({title:'新标题'}),key({}));
 const fresh=sessionHarness();node(fresh.render(),'img').props.onError();assert.ok(node(fresh.render(),'button','video-cover-retry'));
});
test('native retry button is keyboard-activatable without custom key interception',()=>{
 const h=sessionHarness();node(h.render(),'img').props.onError();const retry=node(h.render(),'button','video-cover-retry');
 assert.equal(retry.type,'button');assert.equal(retry.props.type,'button');assert.equal(retry.props.children,'重试封面');
 assert.equal(retry.props.disabled,undefined);assert.equal(retry.props.tabIndex,undefined);assert.equal(retry.props.onKeyDown,undefined);
 // Native Enter/Space activation dispatches click; exercise its shared handler.
 retry.props.onClick();assert.ok(node(h.render(),'img'));assert.equal(node(h.render(),'iframe'),undefined);
});
test('simulated React key remount resets retry state while a same-key render does not',()=>{
 let mountedKey,h;
 const renderSession=props=>{const key=WorkVideoPlayer({...source,...props}).key;if(key!==mountedKey){mountedKey=key;h=sessionHarness(props);}return h.render();};
 for(const props of [{},{view:'stage'},{workId:'another'},{embedUrl:source.embedUrl+'&start=20&end=40'}]){
  node(renderSession(props),'img').props.onError();
  node(renderSession(props),'button','video-cover-retry').props.onClick();
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
 node(h.render(),'button','video-play').props.onClick();assert.equal(node(h.render(),'iframe').props.src,source.embedUrl);
});
