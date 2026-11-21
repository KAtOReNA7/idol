const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function harness(state=null,timeline=false){
 const effects=[],layouts=[],listeners=new Map(),frames=new Map(),timers=new Map();let serial=0,focused=null,now=0,writes=0;
 const path='/artists/xg?section=members&member=recMember';
 const location={pathname:'/artists/xg',search:'?section=members&member=recMember',href:'https://site.test'+path};
 const history={state,replaceState(value){writes++;this.state=value}};
 const window={scrollY:0,scrollTo({top}){this.scrollY=top},setTimeout(fn,delay){timers.set(++serial,{fn,due:now+delay});return serial},clearTimeout:id=>timers.delete(id)};
 class Element{constructor(key){this.dataset={memberWorkTrigger:key}}closest(s){return s==='[data-member-work-trigger]'?this:null}matches(){return false}focus(options){focused={key:this.dataset.memberWorkTrigger,options}}}
 const trigger=new Element('recWork');
 const add=(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn)};
 const remove=(name,fn)=>listeners.get(name)?.delete(fn);
 const document={addEventListener:add,removeEventListener:remove,querySelector:selector=>timeline&&selector==='[data-timeline-host]'?{}:null,body:{},querySelectorAll:s=>s==='[data-member-work-trigger]'?[trigger]:[]};
 const react={useCallback:f=>f,useRef:v=>({current:v}),useEffect:f=>effects.push(f),useLayoutEffect:f=>layouts.push(f)};
 const globals={history,location,window,document,Element,URL,performance:{now:()=>now},addEventListener:add,removeEventListener:remove,requestAnimationFrame:f=>{frames.set(++serial,f);return serial},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{observe(){}disconnect(){}}};
 const modules={};function load(name){if(modules[name])return modules[name];const exports={};const code=ts.transpileModule(fs.readFileSync('components/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',globals)(n=>n==='react'?react:load(n.startsWith('./')?n.slice(2):n),exports);return modules[name]=exports}
 const flush=()=>{const pending=[...frames.values()];frames.clear();for(const f of pending)f()};
 const emit=(name,event)=>{for(const f of listeners.get(name)??[])f(event)};
 const mount=(ready=true)=>{const navigate=load('use-artist-scroll').useArtistScroll(ready,location.href);const cleanups=[...layouts.splice(0).map(f=>f()),...effects.splice(0).map(f=>f())];flush();return {navigate,cleanup:()=>cleanups.forEach(f=>f?.())}};
 function advance(ms) {
  const until=now+ms;
  while(timers.size){
   const [id,timer]=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];
   if(timer.due>until)break;
   now=timer.due;timers.delete(id);timer.fn();
  }
  now=until;
 }
 return {history,window,location,path,trigger,mount,flush,emit,advance,get writes(){return writes},get focused(){return focused},clickWork:()=>emit('click',{target:trigger,button:0,defaultPrevented:false})};
}

test('81 consecutive scroll frames preserve the final position with bounded history writes',()=>{
 const h=harness(),m=h.mount();
 for(let frame=1;frame<=81;frame++){
  h.window.scrollY=Math.round(frame*3149/81);h.emit('scroll');h.flush();h.advance(16);
 }
 h.advance(350);
 assert.ok(h.writes<=6,`81 scroll events produced ${h.writes} replaceState calls`);
 assert.equal(h.history.state.artistScroll.y,3149);
 const settled=h.writes;
 h.emit('scrollend');h.emit('pagehide');m.navigate();h.emit('scroll');h.advance(1000);
 assert.equal(h.writes,settled,'unchanged geometry stays untouched');
 m.cleanup();
});

test('departure and pagehide flush pending scroll on their own entry and never overwrite the destination',()=>{
 for(const departure of ['explicit','pagehide']){
  const h=harness(),m=h.mount();
  h.window.scrollY=400;h.emit('scroll');h.flush();
  h.window.scrollY=6723;h.emit('scroll');h.flush();
  if(departure==='explicit')m.navigate();else h.emit('pagehide');
  assert.equal(h.history.state.artistScroll.y,6723);
  h.location.search='?section=members';h.location.href='https://site.test'+h.location.pathname+h.location.search;
  h.history.state={destination:true};h.window.scrollY=0;h.advance(1000);h.flush();
  assert.deepEqual(h.history.state,{destination:true});
  m.cleanup();
 }
});

test('an explicit departure saves geometry and retires both owned focus records in one history write',()=>{
 const h=harness(null,true);
 h.history.state={timelineReturn:{path:h.path},memberWorkFocus:{path:h.path,key:'recWork'},kept:42};
 const m=h.mount();h.window.scrollY=6723;m.navigate();
 assert.equal(h.writes,1);
 assert.equal(h.history.state.artistScroll.y,6723);
 assert.equal(h.history.state.timelineReturn,undefined);
 assert.equal(h.history.state.memberWorkFocus,undefined);
 assert.equal(h.history.state.kept,42);
 m.cleanup();
});
test('top-of-profile explicit roster departure retires stale work focus before browser Back',()=>{
 const h=harness({unrelated:{kept:true},artistRosterFocus:{key:'recMember'}}),first=h.mount();h.clickWork();h.window.scrollY=1197;h.emit('pagehide');first.cleanup();
 const returned=h.mount();assert.equal(h.focused.key,'recWork');assert.equal(h.window.scrollY,1197);
 h.window.scrollY=0;returned.navigate();assert.equal(h.history.state.memberWorkFocus,undefined);assert.equal(h.history.state.artistScroll.y,0);assert.equal(h.history.state.unrelated.kept,true);assert.equal(h.history.state.artistRosterFocus.key,'recMember');returned.cleanup();
 // A fresh document/hook mount models the saved entry after roster -> Back.
 const back=harness(h.history.state);back.mount();assert.equal(back.focused,null);assert.equal(back.window.scrollY,0);
});
test('passive scroll and pagehide retain exact work target for ordinary work returns',()=>{
 for(const event of ['scroll','pagehide']){const h=harness(),m=h.mount();h.clickWork();h.window.scrollY=1197;h.emit(event);h.flush();assert.equal(h.history.state.memberWorkFocus.key,'recWork');assert.equal(h.history.state.artistScroll.y,1197);m.cleanup();const back=harness(h.history.state);back.mount();assert.equal(back.focused.key,'recWork');assert.equal(back.focused.options.preventScroll,true);assert.equal(back.window.scrollY,1197)}
});
test('explicit navigation never deletes a different artist/path target',()=>{
 const foreign={path:'/artists/aespa?section=members&member=recOther',key:'recOtherWork'};const h=harness({memberWorkFocus:foreign,other:7}),m=h.mount();m.navigate();assert.equal(h.history.state.memberWorkFocus,foreign);assert.equal(h.history.state.other,7);m.cleanup();
});
test('absent history and pending data remain safe; no new focus record is created',()=>{
 for(const ready of [true,false]){const h=harness(),m=h.mount(ready);m.navigate();assert.equal(h.history.state?.memberWorkFocus,undefined);if(!ready)assert.equal(h.history.state,null);m.cleanup()}
});
test('explicit navigation clears matching target even while restoration is pending',()=>{
 const h=harness();h.history.state={memberWorkFocus:{path:h.path,key:'recWork'},other:9};const m=h.mount(false);m.navigate();assert.equal(h.history.state.memberWorkFocus,undefined);assert.equal(h.history.state.other,9);m.cleanup();
});
test('all existing artist implementations and the new shared candidate use capture only for in-page navigation',()=>{
 const files=fs.readdirSync('components').filter(f=>f.endsWith('.tsx')&&fs.readFileSync('components/'+f,'utf8').includes('useArtistScroll('));assert.equal(files.length,14);assert.ok(files.includes('candidate-artist-experience.tsx'));
 for(const file of files){const s=fs.readFileSync('components/'+file,'utf8');assert.equal((s.match(/rememberScroll\(\)/g)||[]).length,1,file);assert.match(s,/function navigate\([^\n]+\{rememberScroll\(\);/,file);assert.match(s,/href=\{artistWorkUrl\(/,file)}
});

test('timeline return ownership releases on user takeover and explicit tabs save latest scroll',()=>{
 for(const event of ['wheel','touchstart','pointerdown','keydown']){
  const h=harness(null,true);h.history.state={timelineReturn:{path:h.path,scrollY:1400},artistScroll:{path:h.path,y:1400},other:42};
  const m=h.mount();h.window.scrollY=800;h.emit('scroll');h.flush();assert.equal(h.history.state.artistScroll.y,1400);
  h.emit(event);h.emit('scroll');h.flush();assert.equal(h.history.state.artistScroll.y,800);assert.equal(h.history.state.timelineReturn,undefined);
  m.navigate();assert.equal(h.history.state.artistScroll.y,800);assert.equal(h.history.state.other,42);m.cleanup();
  const back=harness(h.history.state,true);back.mount();assert.equal(back.window.scrollY,800);
 }
 const h=harness(null,true);h.history.state={timelineReturn:{path:h.path,scrollY:1400},artistScroll:{path:h.path,y:1400}};
 const m=h.mount();h.window.scrollY=650;m.navigate();assert.equal(h.history.state.artistScroll.y,650);assert.equal(h.history.state.timelineReturn,undefined);m.cleanup();
});
