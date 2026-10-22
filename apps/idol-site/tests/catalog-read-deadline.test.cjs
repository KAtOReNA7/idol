const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),React=require('react');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
for(const artist of ['itzy','lesserafim','ive','kissoflife','stayc','nmixx','hearts2hearts','kiiikiii','katseye','saymyname','babymonster','illit']){
 const test=(name,fn)=>require('node:test')(artist+': '+name,fn);
function harness(){
 let now=0,next=0,cursor=0,effects=[],unmounted=false,afterUnmount=0;const timers=new Map(),hooks=[],requests=[],cache={};
 const setTimeout=(fn,ms)=>{const id=++next;timers.set(id,{fn,due:now+ms,ms});return id;},clearTimeout=id=>timers.delete(id);
 const eq=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
 const mockReact={...React,useState(initial){const i=cursor++;if(!hooks[i])hooks[i]={value:initial};return [hooks[i].value,v=>{if(unmounted)afterUnmount++;hooks[i].value=typeof v==='function'?v(hooks[i].value):v;}];},useRef(value){const i=cursor++;return hooks[i]??(hooks[i]={current:value});},useMemo(fn,deps){const i=cursor++;if(!hooks[i]||!eq(hooks[i].deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},useCallback(fn,deps){return mockReact.useMemo(()=>fn,deps);},useEffect(fn,deps){const i=cursor++,old=hooks[i];if(!old||!eq(old.deps,deps)){hooks[i]={deps,setup:fn,cleanup:old?.cleanup};effects.push(()=>{hooks[i].cleanup?.();hooks[i].cleanup=fn();});}},useSyncExternalStore(){return '/artists/'+artist;}};
 function load(file){if(cache[file])return cache[file];const e={};cache[file]=e;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext('(function(require,exports){'+js+'})',{URL,URLSearchParams,Date,AbortController,DOMException,setTimeout,clearTimeout,fetch:(url,options)=>{const d=deferred();requests.push({...d,url,options});return d.promise;}})(name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='@/components/member-physical-facts')return require('./helpers/member-physical-loader.cjs');if(name==='@/components/member-career-facts')return require('./helpers/member-career-loader.cjs');if(name==='react')return mockReact;if(name==='./use-artist-scroll')return {useArtistScroll:()=>()=>{}};if(name==='./photo-lightbox')return {PhotoLightbox:()=>null};if(name.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(name.replace('@/','')))};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('./'))return load(path.join(path.dirname(file),name)+'.ts');return require(name);},e);return e;
 }
 const Artist=load(artist==='babymonster'?'components/artist-sample.tsx':'components/'+(artist==='kissoflife'?'kiof':artist)+'-artist.tsx').default,content=JSON.parse(fs.readFileSync('data/'+artist+'-artist.json'));
 return {hooks,requests,timers,helper:load('lib/idol/catalog-read-deadline.ts'),render(){cursor=0;effects=[];const tree=Artist({content});for(const f of effects)f();return tree;},retry(){return hooks.find(h=>typeof h?.value==='function'&&/read(?:Artist)?Catalog/.test(String(h.value))).value();},unmount(){unmounted=true;for(const h of hooks)h?.cleanup?.();},afterUnmount:()=>afterUnmount,strictReplay(){for(const h of hooks)h?.cleanup?.();for(const h of hooks)if(h?.setup)h.cleanup=h.setup();},async advance(ms){now+=ms;for(const [id,t] of timers)if(t.due<=now){timers.delete(id);t.fn();}await tick();},reply(i,data){requests[i].resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>Promise.resolve(data)});},data:()=>hooks[0].value,error:()=>hooks[1].value,loading:()=>hooks[2].value};
}
const catalog=()=>({groups:[],members:[],works:[],ratings:[]});
test('default 30-second fetch deadline exits loading with retry message and can recover',async()=>{
 const h=harness();h.render();await tick();assert.equal(h.helper.CATALOG_READ_TIMEOUT_MS,30000);assert.equal([...h.timers.values()][0].ms,30000);
 await h.advance(29999);assert.equal(h.loading(),true);await h.advance(1);assert.equal(h.loading(),false);assert.match(h.error(),/读取用时较长.*重新加载/);assert.equal(h.data(),null);assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.timers.size,0);
 const retry=h.retry();await tick();const d=catalog();h.reply(1,d);await retry;assert.equal(h.data(),d);assert.equal(h.error(),'');assert.equal(h.loading(),false);assert.equal(h.timers.size,0);
 h.requests[0].reject(Error('late failure'));await tick();assert.equal(h.data(),d);assert.equal(h.error(),'');
 assert.ok(h.requests.every(r=>r.url==='/api/catalog?artist='+artist+'&shape=display-v1'&&r.options.cache==='no-store'&&!r.options.method&&!r.options.body));
});
test('JSON body hanging after successful headers is also bounded',async()=>{
 const h=harness();h.render();await tick();const body=deferred();h.requests[0].resolve({ok:true,headers:{get:()=> 'application/json'},json:()=>body.promise});await tick();await h.advance(30000);
 assert.equal(h.loading(),false);assert.match(h.error(),/读取用时较长/);assert.ok(h.requests[0].options.signal.aborted);body.reject(Error('late body rejection'));await tick();assert.match(h.error(),/读取用时较长/);assert.equal(h.timers.size,0);
});
test('rapid retries cancel earlier requests and late success cannot overwrite newest data',async()=>{
 const h=harness();h.render();await tick();const a=h.retry();await tick();const b=h.retry();await tick();
 assert.ok(h.requests[0].options.signal.aborted);assert.ok(h.requests[1].options.signal.aborted);assert.equal(h.requests[2].options.signal.aborted,false);
 await tick();assert.equal(h.loading(),true);assert.equal(h.error(),'');
 const newest=catalog();h.reply(2,newest);await Promise.all([a,b]);h.reply(0,{...catalog(),old:true});h.reply(1,{...catalog(),old:true});await tick();assert.equal(h.data(),newest);assert.equal(h.error(),'');assert.equal(h.timers.size,0);
});
test('unmount aborts silently with no subsequent state writes, even for late completion',async()=>{
 const h=harness();h.render();await tick();h.unmount();await tick();assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.timers.size,0);h.reply(0,catalog());await tick();assert.equal(h.afterUnmount(),0);assert.equal(h.error(),'');assert.equal(h.data(),null);
});
test('short injected deadline and already-aborted caller clean up without starting a read',async()=>{
 const h=harness(),controller=new AbortController();let started=0;
 controller.abort();await assert.rejects(h.helper.catalogReadWithDeadline(async()=>{started++;},controller.signal),e=>e.name==='AbortError');assert.equal(started,0);assert.equal(h.timers.size,0);
 const c=new AbortController(),p=h.helper.catalogReadWithDeadline(()=>new Promise(()=>{}),c.signal,5);const check=assert.rejects(p,/读取用时较长/);await h.advance(5);await check;assert.equal(h.timers.size,0);
});
test('HTTP and malformed catalog failures keep the original validation and never look like empty success',async()=>{
 for(const malformed of [false,true]){const h=harness();h.render();await tick();if(malformed)h.reply(0,{groups:[]});else h.requests[0].resolve({ok:false,headers:{get:()=> 'application/json'}});await tick();assert.equal(h.data(),null);assert.equal(h.loading(),false);assert.match(h.error(),malformed?/加载完整/:/没有连上/);assert.equal(h.timers.size,0);}
});

test('Strict Mode style effect cleanup and setup protects the replacement request',async()=>{
 const h=harness();h.render();await tick();h.strictReplay();await tick();
 assert.equal(h.requests.length,2);assert.ok(h.requests[0].options.signal.aborted);assert.equal(h.loading(),true);assert.equal(h.error(),'');
 h.requests[0].reject(Error('cancelled old setup'));await tick();assert.equal(h.loading(),true);assert.equal(h.error(),'');
 const d=catalog();h.reply(1,d);await tick();assert.equal(h.data(),d);assert.equal(h.loading(),false);assert.equal(h.timers.size,0);
});
test('helper removes caller abort listener on success, timeout and cancellation',async()=>{
 for(const outcome of ['success','timeout','cancel']){
  const h=harness(),controller=new AbortController(),signal=controller.signal;let added=0,removed=0;
  const add=signal.addEventListener.bind(signal),remove=signal.removeEventListener.bind(signal);
  signal.addEventListener=(...args)=>{added++;return add(...args);};signal.removeEventListener=(...args)=>{removed++;return remove(...args);};
  const p=h.helper.catalogReadWithDeadline(()=>outcome==='success'?Promise.resolve(42):new Promise(()=>{}),signal,5);
  if(outcome==='success')assert.equal(await p,42);else{const check=assert.rejects(p,outcome==='timeout'?/读取用时较长/:{name:'AbortError'});if(outcome==='timeout')await h.advance(5);else controller.abort();await check;}
  assert.equal(added,1);assert.equal(removed,1);assert.equal(h.timers.size,0);
 }
});
test('immediate unmount suppresses the queued initial read entirely',async()=>{
 const h=harness();h.render();h.unmount();await tick();assert.equal(h.requests.length,0);assert.equal(h.timers.size,0);assert.equal(h.afterUnmount(),0);
});
test('immediate Strict Mode replay starts only the surviving queued read',async()=>{
 const h=harness();h.render();h.strictReplay();await tick();assert.equal(h.requests.length,1);assert.equal(h.requests[0].options.signal.aborted,false);
 const d=catalog();h.reply(0,d);await tick();assert.equal(h.data(),d);assert.equal(h.error(),'');assert.equal(h.loading(),false);assert.equal(h.timers.size,0);
});

test('timeout renders explicit retry UI and recovery preserves catalog values',async()=>{
 const walk=n=>Array.isArray(n)?n.flatMap(walk):!n||typeof n!=='object'?[]:[n,...walk(n.props?.children)];
 const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):n==null||typeof n==='boolean'?'':String(n);
 const h=harness();h.render();await tick();await h.advance(30000);let tree=h.render();
 const alert=walk(tree).find(n=>n.props?.role==='alert');assert.ok(alert);assert.match(text(alert),/读取用时较长/);assert.doesNotMatch(text(tree),/暂未找到团体资料/);
 const retry=walk(alert).find(n=>n.type==='button'&&text(n)==='重新加载');assert.ok(retry);retry.props.onClick();tree=h.render();assert.ok(walk(tree).some(n=>n.props?.role==='status'));assert.ok(!walk(tree).some(n=>n.props?.role==='alert'));await tick();
 const content=JSON.parse(fs.readFileSync('data/'+artist+'-artist.json'));
 const d={...catalog(),groups:[{id:content.groupId,name:'Recovered Group'}],works:[{id:'recPreserved',name:'Preserved Song',song:'Preserved Song',groupIds:[content.groupId],url:'https://www.youtube.com/watch?v=abcdefghijk',releaseDate:'2026-01-01',score:0,stageScore:null,note:'保留备注',watched:'已观看',version:'原版',videoType:'官方MV',stage:null}]};
 const before=JSON.stringify(d);h.reply(1,d);await tick();tree=h.render();assert.equal(h.data(),d);assert.equal(JSON.stringify(d),before);assert.ok(!walk(tree).some(n=>n.props?.role==='alert'));assert.doesNotMatch(text(tree),/暂未找到团体资料/);
 assert.ok(h.requests.every(r=>r.url.startsWith('/api/catalog?')&&!r.options.method&&!r.options.body));
});

}
