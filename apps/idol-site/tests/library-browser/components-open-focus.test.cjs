const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {load,fixture}=require('./scale-fixture.cjs');
test('actual ResultsView programmatic open focuses matching enabled card before host captures navigation',()=>{
 const catalog=fixture(100),filters={search:'',group:'all',generation:'all',queue:'all',stageFilter:'all',watch:'all',sort:'default',limit:24};
 const {buildLibraryModel}=load('lib/idol/library-browser/query-model.ts'),paging=load('lib/idol/library-browser/paging-model.ts');
 const model=buildLibraryModel(catalog,filters,3,24),id=model.rows[3].id,sequence={ids:model.watchableIds,filters,label:'SYNTHETIC'};
 let active='unrelated-search',captured,open,refs=0;const focusOptions=[];
 const target={focus(opts){active='work-'+id;focusOptions.push(opts);}};
 const card={dataset:{lbWorkId:id},querySelector(selector){assert.match(selector,/button:not\(\[disabled\]\)/);return target;},focus(){assert.fail('Use actionable child instead of wrapper');}};
 const container={querySelectorAll:()=>[{dataset:{lbWorkId:'unrelated'},querySelector(){assert.fail('Wrong card focus');}},card]};
 const React={useId:()=>':synthetic:',useEffect(){},useLayoutEffect(){},useRef:()=>({current:++refs===2?container:null}),useState:value=>[value,()=>{}]};
 const filename=path.resolve(__dirname,'../../components/library-browser/results-view.tsx');
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext('(function(require,exports){'+code+'})')(name=>name==='react'?React:name==='react/jsx-runtime'?require('react/jsx-runtime'):name.includes('paging-model')?paging:{},exports);
 exports.ResultsView({model,page:3,pageSize:24,sequence,onPageChange(){},renderWork(work,callback){if(work.id===id)open=callback;return work.name;},onOpenWork(workId,full){captured={workId,focused:active,full};}});
 assert.equal(active,'unrelated-search');open();assert.equal(captured.workId,id);assert.equal(captured.focused,'work-'+id);assert.equal(captured.full,sequence);assert.equal(focusOptions[0].preventScroll,true);
});
