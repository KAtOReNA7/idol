const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync('lib/idol/deferred-module.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const requests=[],timers=new Map();let id=0;
 const exports={};vm.runInNewContext(code,{exports,setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)});
 const resource=exports.createDeferredModule(()=>new Promise((resolve,reject)=>requests.push({resolve,reject})));
 return {resource,requests,timers,timeout(){const pending=[...timers.values()];timers.clear();for(const {fn}of pending)fn();}};
}
test('does not import on creation or snapshots; explicit load deduplicates pending and resolved imports',async()=>{
 const h=harness(),r=h.resource;let notifications=0;const unsubscribe=r.subscribe(()=>notifications++);
 assert.equal(r.getSnapshot().phase,'idle');assert.equal(h.requests.length,0);const initial=r.getServerSnapshot();
 r.load();r.load();await tick();assert.equal(h.requests.length,1);assert.equal(r.getSnapshot().phase,'loading');assert.equal([...h.timers.values()][0].ms,30000);
 const module={GroupIndex:()=>null};h.requests[0].resolve(module);await tick();assert.equal(r.getSnapshot().value,module);assert.equal(r.getSnapshot().phase,'ready');assert.equal(h.timers.size,0);
 r.load();await tick();assert.equal(h.requests.length,1);assert.equal(notifications,2);assert.equal(r.getServerSnapshot(),initial);assert.equal(initial.phase,'idle');unsubscribe();
});
test('failed native import is terminal in this document, with no misleading same-URL retry',async()=>{
 const h=harness(),r=h.resource;r.load();await tick();h.requests[0].reject(Error('network'));await tick();assert.equal(r.getSnapshot().phase,'error');assert.equal(h.timers.size,0);
 r.load();await tick();assert.equal(h.requests.length,1);assert.equal(r.getSnapshot().phase,'error');
});
test('timeout is bounded and late completion cannot silently leave the visible error state',async()=>{
 for(const outcome of ['resolve','reject']){
  const h=harness(),r=h.resource;r.load();await tick();h.timeout();assert.equal(r.getSnapshot().phase,'error');
  r.load();await tick();assert.equal(h.requests.length,1);h.requests[0][outcome](outcome==='resolve'?{old:true}:Error('old'));await tick();assert.equal(r.getSnapshot().phase,'error');
 }
});
test('unsubscribed observers receive no late notification and remount sees actual loaded module',async()=>{
 const h=harness(),r=h.resource;let count=0;const unsubscribe=r.subscribe(()=>count++);r.load();await tick();unsubscribe();h.requests[0].resolve({loaded:true});await tick();assert.equal(count,1);assert.equal(r.getSnapshot().phase,'ready');
});
test('route predicate respects work/member precedence and does not fetch on home, works or insights',()=>{
 const code=ts.transpileModule(fs.readFileSync('components/use-catalog-group-views.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,exports={};let creations=0;
 vm.runInNewContext('(function(require,exports){'+code+'})',{})(name=>name==='react'?{}:{createDeferredModule:()=>{creations++;return {}; }},exports);assert.equal(creations,1);
 const data={works:[{id:'w'}],members:[{id:'m'}],groups:[{id:'g'}]};
 for(const nav of ['home','works','members','insights','records'])assert.equal(exports.needsCatalogGroupViews({nav},data),false);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups'},data),true);assert.equal(exports.needsCatalogGroupViews({nav:'home',groupId:'g'},data),true);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',work:'w'},data),false);assert.equal(exports.needsCatalogGroupViews({nav:'groups',member:'m'},data),false);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',work:'missing',groupId:'g'},data),true);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',member:'missing',groupId:'g'},data),true);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',work:'missing'},data),false);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',groupId:'missing'},data),false);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups'},null),true);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',work:'missing',groupId:'g'},null),false);
 assert.equal(exports.needsCatalogGroupViews({nav:'groups',member:'m'},null),false);
});
test('App has one group-module boundary, visible explicit reload and unchanged editor/media paths',()=>{
 const app=fs.readFileSync('app/page.tsx','utf8'),hook=fs.readFileSync('components/use-catalog-group-views.ts','utf8');
 assert.doesNotMatch(app,/import \{Group(?:Index|Detail)\} from/);assert.match(hook,/createDeferredModule\(\(\)=>import\('\.\/catalog-group-views'\)\)/);
 assert.match(app,/groupViews\.phase==='idle'\)groupViews.load\(\)/);assert.match(app,/data-module-status/);assert.match(app,/onClick=\{journey.reloadPage\}>重新加载页面/);
 assert.match(app,/r=>!needsCatalogGroupViews\(r,data\)\|\|groupViews.phase==='ready'/);assert.match(app,/inert=\{!!data&&!journey.styleReady\}/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\(|sendBeacon/);
});
