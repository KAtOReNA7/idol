const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const home='https://site.test/artists/saymyname',members=home+'?section=members',works=home+'?section=works';
function harness(){
 const slots=[],layouts=[],effects=[],listeners=new Map(),calls=[];let cursor=0,mainTop=700,dirty=false;
 const depsChanged=(a,b)=>!a||!b||a.length!==b.length||a.some((x,i)=>!Object.is(x,b[i]));
 const effect=(queue)=>(fn,deps)=>{const i=cursor++,old=slots[i];if(depsChanged(old?.deps,deps)){slots[i]={deps,cleanup:old?.cleanup};queue.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}};
 const react={useRef(value){const i=cursor++;return slots[i]??(slots[i]={current:value});},useState(value){const i=cursor++;if(!(i in slots))slots[i]=value;return [slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;dirty=true;}];},useCallback(fn){cursor++;return fn;},useLayoutEffect:effect(layouts),useEffect:effect(effects)};
 const window={location:{href:home},scrollY:0,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 const document={getElementById(id){assert.equal(id,'artist-content');return {scrollIntoView(options){window.scrollY=mainTop;calls.push({top:mainTop,...options});}};}};
 const exports={};vm.runInNewContext('(function(require,exports){'+ts.transpileModule(fs.readFileSync('components/use-artist-navigation-scroll.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})',{window,document})(()=>react,exports);
 const render=(ready=true,route=window.location.href)=>{cursor=0;dirty=false;return exports.useArtistNavigationScroll(ready,route);};
 const commit=top=>{mainTop=top;layouts.splice(0).forEach(f=>f());effects.splice(0).forEach(f=>f());};
 return {window,calls,render,commit,get dirty(){return dirty},pop(href){window.location.href=href;listeners.get('popstate')?.();}};
}
test('explicit navigation scrolls new geometry after commit, never the removed homepage hero',()=>{
 const h=harness();let queue=h.render();h.commit(700);assert.equal(h.calls.length,0);
 for(let i=0;i<2;i++){
  h.window.location.href=members;queue(members);assert.equal(h.calls.length,i*2);assert.equal(h.dirty,true);
  queue=h.render();assert.equal(h.calls.length,i*2);h.commit(110);assert.equal(h.window.scrollY,110);
  h.window.location.href=home;queue(home);queue=h.render();h.commit(700);assert.equal(h.window.scrollY,700);
 }
 assert.ok(h.calls.every(call=>call.behavior==='instant'&&call.block==='start'));
});
test('same-route repeated navigation commits once without resetting or remounting content',()=>{
 const h=harness();let queue=h.render();h.commit(100);queue(home);queue=h.render();h.commit(100);queue(home);h.render();h.commit(100);assert.equal(h.calls.length,2);h.render();h.commit(100);assert.equal(h.calls.length,2);
});
test('replace searches and Back/Forward never acquire a section-top scroll request',()=>{
 const h=harness();const queue=h.render();h.commit(700);
 h.window.location.href=works;queue(works);h.render();h.commit(110);h.window.scrollY=450;
 h.window.location.href=works+'&q=hello';queue(null);h.render();h.commit(110);assert.equal(h.window.scrollY,450);
 h.pop(home);h.window.scrollY=980;h.render();h.commit(700);assert.equal(h.window.scrollY,980);
 h.pop(works);h.window.scrollY=450;h.render();h.commit(110);assert.equal(h.window.scrollY,450);assert.equal(h.calls.length,1);
});
test('pending data waits for destination commit; newer navigation and popstate cancel stale requests',()=>{
 const h=harness();let queue=h.render(false);h.commit(700);h.window.location.href=members;queue(members);queue=h.render(false);h.commit(110);assert.equal(h.calls.length,0);
 queue=h.render(true);h.commit(110);assert.equal(h.calls.length,1);
 queue(works);h.window.location.href=works;queue=h.render(true,members);h.commit(110);assert.equal(h.calls.length,1);
 h.pop(home);h.render();h.commit(700);assert.equal(h.calls.length,1);
 // A guard/replacement retaining another URL must not scroll that page.
 queue(members);h.render();h.commit(700);assert.equal(h.calls.length,1);
});
test('SAYMYNAME queues the exact push destination before notifying React and retains shared restoration',()=>{
 const source=fs.readFileSync('components/saymyname-artist.tsx','utf8');
 assert.match(source,/rememberScroll=useArtistScroll\(!!data,url\)/);
 assert.match(source,/useArtistNavigationScroll\(!!data,url\)/);
 const navigate=source.match(/ function navigate\([^\n]+/)[0];
 assert.match(navigate,/rememberScroll\(\);/);assert.match(navigate,/newArtistHistoryState\(window.history.state\)/);
 assert.match(navigate,/queueNavigationScroll\(replace\?null:new URL\(next,window.location.href\).href\);window.dispatchEvent/);
 assert.doesNotMatch(navigate,/scrollIntoView|setTimeout|requestAnimationFrame/);
 assert.doesNotMatch(source,/<main[^>]*key=/);
});
