'use strict';
// Executes the production provider's real closure/effects with a deterministic
// hook/DOM seam. Real Editor rendering and browser history are separate QA.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {timelineDependency}=require('./helpers/timeline-dependency-loader.cjs');
const registry=require('../data/artist-timeline-registry.json');
const navigation=timelineDependency('./timeline/navigation');
const history=timelineDependency('./timeline/history-state');
function harness(){
 const group=registry[0],location={pathname:group.path,search:'?section=updates',assign:url=>calls.push(['assign',url]),reload:()=>calls.push(['reload'])};
 const gates={dirty:false,uncertain:false,modal:false},calls=[],states=[],effects=[],timers=new Map();
 let cursor=0,timerId=0,confirm=true,load=()=>new Promise(()=>{});
 const react={useState(initial){const index=cursor++;if(!(index in states))states[index]=initial;return[states[index],next=>states[index]=typeof next==='function'?next(states[index]):next];},useEffect(fn){effects.push(fn);},useMemo:fn=>fn(),useCallback:fn=>fn};
 const document={body:{},querySelector(selector){return(selector.includes('data-navigation-blocked')&&gates.uncertain)||(selector.includes('data-dirty')&&gates.dirty)||(selector.includes('aria-modal')&&gates.modal)?{}:null;}};
 const window={location,confirm:()=>{calls.push(['confirm']);return confirm;},alert:()=>calls.push(['alert'])};
 const dependencies={react,'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},'next/navigation':{usePathname:()=>location.pathname},'../data/artist-timeline-registry.json':{default:registry},'../lib/idol/timeline/production':{loadArtistTimeline:(...args)=>load(...args)},'../lib/idol/timeline/navigation':navigation,'./artist-timeline-host':{ArtistTimelineHostProvider:'provider'},'./artist-timeline-background':{ArtistTimelineBackground:'background'}};
 const exports={};
 const code=ts.transpileModule(fs.readFileSync('components/artist-timeline-production.tsx','utf8'),{compilerOptions:{module:1,target:9,jsx:4}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})',{location,window,document,MutationObserver:class{observe(){}disconnect(){}},setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)})(name=>{assert.ok(name in dependencies,name);return dependencies[name];},exports);
 return {group,location,gates,calls,timers,effects,render(){cursor=0;effects.length=0;return exports.ArtistTimelineProduction({children:null}).props.value;},setConfirm:value=>confirm=value,setLoad:fn=>load=fn};
}
function request(h,extra={}){return {eventId:'e-production-test',kind:'member',targetId:'recMember',groupId:h.group.groupId,returnTo:h.location.pathname+h.location.search,former:false,...extra};}
test('production dirty cancel and approval reach the real guard before capture',()=>{
 const h=harness(),v=h.render();h.gates.dirty=true;h.setConfirm(false);let captures=0;
 v.navigate(request(h),()=>{captures++;return true;});assert.equal(captures,0);assert.deepEqual(h.calls,[['confirm']]);
 h.setConfirm(true);v.navigate(request(h),()=>{captures++;return true;});assert.equal(captures,1);assert.equal(h.calls.at(-1)[0],'assign');assert.match(h.calls.at(-1)[1],/member=recMember/);
});
test('production uncertain, modal, stale path and failed capture cannot leave',()=>{
 const h=harness(),v=h.render();let captures=0;const capture=()=>{captures++;return true;};
 h.gates.uncertain=true;v.navigate(request(h),capture);assert.deepEqual(h.calls,[['alert']]);
 h.gates.uncertain=false;h.gates.modal=true;v.navigate(request(h),capture);h.gates.modal=false;
 v.navigate(request(h,{returnTo:h.group.path+'?section=overview'}),capture);v.navigate(request(h,{groupId:'recOther'}),capture);v.navigate(request(h,{targetId:'https://invalid.test'}),capture);
 assert.equal(captures,0);v.navigate(request(h),()=>false);assert.equal(h.calls.filter(c=>c[0]==='assign').length,0);
});
test('production imports have a deadline, retry, and stale completion isolation',async()=>{
 const h=harness();let resolve;h.setLoad(()=>new Promise(done=>resolve=done));let v=h.render();const cleanup=h.effects[0]();
 assert.equal(v.timelineLoading,true);assert.equal([...h.timers.values()][0].ms,15000);[...h.timers.values()][0].fn();
 v=h.render();assert.match(v.timelineError,/继续等待/);assert.equal(v.timelineRetryLabel,'继续等待');assert.equal(v.timelineLoading,false);
 resolve({input:{events:['late']},background:{links:[]}});await Promise.resolve();assert.equal(h.render().input,null);
 v.onTimelineRetry();v=h.render();assert.equal(v.timelineLoading,true);cleanup();
 h.setLoad(async()=>({input:{events:['fresh']},background:{links:[]},copy:{}}));h.effects[0]();await Promise.resolve();v=h.render();assert.equal(v.input.events[0],'fresh');assert.equal(v.timelineError,'');
});
test('fresh artist entries cannot inherit a previous timeline return; Back source stays intact',()=>{
 const source={other:'keep',timelineReturn:{path:'/artists/unis?section=updates',identity:{eventId:'e-example',kind:'member',targetId:'recA'}},artistScroll:{y:120},memberWorkFocus:'recB',timelineOverviewFilters:{}};
 const works=history.newArtistHistoryState(source),updates=history.newArtistHistoryState(works);
 assert.deepEqual(works,{other:'keep'});assert.deepEqual(updates,{other:'keep'});assert.equal(source.timelineReturn.identity.targetId,'recA');assert.equal(source.artistScroll.y,120);
});

async function rejected(){const h=harness();h.setLoad(()=>Promise.reject(new Error('module failed')));h.render();h.effects[0]();await Promise.resolve();return h;}
test('import rejection exposes explicit reload, never triggers it automatically',async()=>{
 const h=await rejected(),v=h.render();assert.equal(v.timelineLoading,false);assert.equal(v.input,null);assert.equal(v.timelineRetryLabel,'重新加载页面');assert.deepEqual(h.calls,[]);
 const href=h.location.pathname+h.location.search;v.onTimelineRetry();assert.deepEqual(h.calls,[['reload']]);assert.equal(h.location.pathname+h.location.search,href);
});
test('reload reads modal/save/dirty gates live and cancelled reload preserves state',async()=>{
 const h=await rejected(),v=h.render();h.gates.modal=true;v.onTimelineRetry();assert.deepEqual(h.calls,[]);
 h.gates.modal=false;h.gates.uncertain=true;v.onTimelineRetry();assert.deepEqual(h.calls,[['alert']]);
 h.gates.uncertain=false;h.gates.dirty=true;h.setConfirm(false);v.onTimelineRetry();assert.deepEqual(h.calls,[['alert'],['confirm']]);assert.equal(h.render().timelineError,v.timelineError);
 h.setConfirm(true);v.onTimelineRetry();assert.deepEqual(h.calls.slice(-2),[['confirm'],['reload']]);
});
test('stale reload control cannot reload another artist',async()=>{
 const h=await rejected(),v=h.render();h.location.pathname=registry[1].path;v.onTimelineRetry();assert.deepEqual(h.calls,[]);
});
test('deadline is not rejection and continues waiting on the same pending result',async()=>{
 const h=harness();let resolve;const pending=new Promise(done=>resolve=done);h.setLoad(()=>pending);h.render();const cleanup=h.effects[0]();[...h.timers.values()][0].fn();
 let v=h.render();assert.equal(v.timelineRetryLabel,'继续等待');v.onTimelineRetry();cleanup();v=h.render();h.effects[0]();assert.equal(v.timelineLoading,true);assert.deepEqual(h.calls,[]);
 resolve({input:{events:['settled']}});await Promise.resolve();v=h.render();assert.equal(v.input.events[0],'settled');assert.equal(v.timelineError,'');
});
test('route cleanup isolates both old rejection and resolution',async()=>{
 for(const reject of [false,true]){const h=harness();let resolve,fail;h.setLoad(()=>new Promise((a,b)=>{resolve=a;fail=b;}));h.render();const cleanup=h.effects[0]();cleanup();h.location.pathname=registry[1].path;h.render();
 if(reject)fail(Error('old route'));else resolve({input:{events:['old route']}});await Promise.resolve();const v=h.render();assert.equal(v.input,null);assert.equal(v.timelineError,'');assert.equal(v.timelineLoading,true);assert.deepEqual(h.calls,[]);}
});
