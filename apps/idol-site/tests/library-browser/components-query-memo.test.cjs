const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const {load,fixture,filters}=(()=>{const util=require('./scale-fixture.cjs');return util;})();
// Exercise the actual component function with a persistent deterministic hook scheduler.
// Real browser timing and event verification remains a separate production-bundle check.
function harness(){
 let cursor=0,calls=0;const memo=[];
 const query=load('lib/idol/library-browser/query-model.ts'),paging=load('lib/idol/library-browser/paging-model.ts');
 const React={useId:()=>':synthetic:',useMemo(fn,deps){const i=cursor++;if(!memo[i]||!deps.every((v,j)=>Object.is(v,memo[i].deps[j])))memo[i]={deps,value:fn()};return memo[i].value;}};
 const source=ts.transpileModule(fs.readFileSync(path.join(root,'components/library-browser/library-browser.tsx'),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};const imports=name=>name==='react'?React:name==='react/jsx-runtime'?require('react/jsx-runtime'):name.includes('query-model')?{...query,buildLibraryModel(...args){calls++;return query.buildLibraryModel(...args);}}:name.includes('paging-model')?paging:name.includes('watch-sequence')?load('lib/idol/watch-sequence.ts'):name.includes('/queues')?load('lib/idol/queues.ts'):{};
 vm.runInNewContext('(function(require,exports){'+source+'})')(imports,exports);
 return {render(props){cursor=0;const element=exports.LibraryBrowser({...props,onFiltersChange(){},onPageChange(){},onOpenWork(){},renderWork:w=>w.name});return element.props.children.at(-1).props.model;},get calls(){return calls;}};
}
test('actual LibraryBrowser retains full query cache across new navigation filter objects and page sizes',()=>{
 const h=harness(),catalog=fixture(1000);const base={search:'',group:'all',generation:'all',queue:'all',stageFilter:'all',watch:'all',sort:'default',limit:24};
 h.render({catalog,filters:base,page:1,pageSize:24});assert.equal(h.calls,1);
 let result=h.render({catalog,filters:{...base,page:3,limit:96},page:3,pageSize:24});assert.equal(h.calls,1);assert.equal(result.pagination.page,3);assert.equal(result.rows.length,24);
 result=h.render({catalog,filters:{...base,page:2,pageSize:48},page:2,pageSize:48});assert.equal(h.calls,1);assert.equal(result.rows.length,48);
 for(const patch of [{search:'Song'},{group:'recG1'},{generation:'第五代'},{queue:'tonight'},{stageFilter:'ready'},{watch:'watched'},{sort:'score-desc'}]){const before=h.calls;h.render({catalog,filters:{...base,...patch},page:1,pageSize:24});assert.equal(h.calls,before+1);}
 const before=h.calls;h.render({catalog:{...catalog,works:catalog.works.map(w=>({...w,score:0}))},filters:base,page:1,pageSize:24});assert.equal(h.calls,before+1);
});
