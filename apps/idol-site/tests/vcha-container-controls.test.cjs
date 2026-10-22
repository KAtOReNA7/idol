/* eslint-disable @typescript-eslint/no-require-imports */
// Component contracts only. Browser layout and fonts require actual browser QA.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const React=require('react'),ts=require('typescript');
const source=fs.readFileSync('components/design-review/vcha-container-validation.tsx','utf8');
function compile(source,customRequire,globals={}){
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,exports={};
  vm.runInNewContext('(function(require,exports){'+code+'\n})',{ResizeObserver:class{observe(){}disconnect(){}},...globals})(customRequire,exports);return exports;
}
function nodes(tree,predicate){if(Array.isArray(tree))return tree.flatMap(n=>nodes(n,predicate));if(!tree||typeof tree!=='object')return [];return [...(predicate(tree)?[tree]:[]),...nodes(tree.props?.children,predicate)];}
function text(tree){if(Array.isArray(tree))return tree.map(text).join('');return tree&&typeof tree==='object'?text(tree.props?.children):tree==null?'':String(tree);}
function harness({confirm=()=>false}={}){
  const slots=[];let index=0;
  const hooks={...React,useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},useRef(initial){const i=index++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect(){index++;}};
  const Component=compile(source,name=>name==='react'?hooks:name.startsWith('@/')||name.endsWith('.css')?{}:require(name),{window:{confirm}}).default;
  const render=()=>{index=0;return Component();},one=predicate=>{const result=nodes(render(),predicate);assert.equal(result.length,1);return result[0];};
  return {render,one,button:label=>one(n=>n.type==='button'&&text(n)===label),frame:()=>one(n=>n.type==='iframe'),mode:value=>one(n=>n.type==='select').props.onChange({target:{value}})};
}
for(const [viewport,host,mode] of [[1440,320,'wide'],[1440,390,'wide'],[320,320,'matched'],[390,390,'matched'],[1440,1440,'matched']]){
  test(`finite candidate matrix ${viewport}/${host} preserves actual iframe dimensions`,()=>{
    const h=harness();h.button(host+'px').props.onClick();h.mode(mode);
    const frame=h.frame();assert.equal(frame.props.width,viewport);assert.equal(frame.props.style.width,viewport);
    assert.equal(frame.props.src,'/design-review/sol15/vcha-container/frame/'+host);
    assert.equal(frame.props.style.maxWidth,'none');assert.match(text(h.render()),/不替换原审阅页或正式页面/);
    assert.equal(nodes(h.render(),n=>n.type==='iframe').length,1);
    h.mode('https://invalid.example');assert.equal(h.frame().props.src,frame.props.src);assert.equal(h.frame().props.width,viewport);
  });
}
test('frame route accepts only the finite width strings',async()=>{
  const exports=compile(fs.readFileSync('app/design-review/sol15/vcha-container/frame/[width]/page.tsx','utf8'),name=>name==='next/navigation'?{notFound(){throw Error('not-found');}}:name.startsWith('@/')?{VchaContainerFrame:'frame-fixture'}:require(name));
  for(const width of ['320','390','1440'])assert.equal((await exports.default({params:Promise.resolve({width})})).props.width,Number(width));
  for(const width of ['0310','350','320?url=evil','https://invalid.example','../vcha'])await assert.rejects(exports.default({params:Promise.resolve({width})}),/not-found/);
});
test('diagnostics whitelist geometry and font values, never DOM or private record content',async()=>{
  const h=harness(),heading={getBoundingClientRect:()=>({width:288})};
  const root={clientWidth:320,scrollWidth:320,getBoundingClientRect:()=>({width:320}),querySelector:()=>heading,get textContent(){throw Error('private DOM must not be serialized');}};
  const doc={fonts:{ready:Promise.resolve()},documentElement:{clientWidth:1440},querySelector:()=>({shadowRoot:{querySelector:()=>root}}),createRange:()=>({selectNodeContents(){},getBoundingClientRect:()=>({width:260})}),get privateScore(){throw Error('private catalog must not be read');}};
  const win={innerWidth:1440,getComputedStyle:()=>({fontSize:'102.4px',fontFamily:'Georgia, serif',letterSpacing:'-6.656px',overflowX:'visible',privateNote:'DO-NOT-OUTPUT'})};
  h.frame().props.ref.current={contentDocument:doc,contentWindow:win};h.button('读取首页布局').props.onClick();await new Promise(setImmediate);
  const result=text(h.render());assert.match(result,/102.4px/);assert.match(result,/Georgia, serif/);assert.match(result,/hostClientWidth320/);assert.doesNotMatch(result,/DO-NOT-OUTPUT|privateScore|privateNote/);
});
test('font-ready result is discarded if the iframe document changes while waiting',async()=>{
  const h=harness();let resolve;
  const oldDoc={fonts:{ready:new Promise(done=>{resolve=done;})},querySelector(){throw Error('stale document must not be measured');}};
  h.frame().props.ref.current={contentDocument:oldDoc,contentWindow:{innerWidth:1440}};
  h.button('读取首页布局').props.onClick();
  h.frame().props.ref.current={contentDocument:{},contentWindow:{innerWidth:320}};
  resolve();await new Promise(setImmediate);
  assert.equal(nodes(h.render(),node=>node.type==='dl').length,0);
});
function guardedDocument(marker,inShadow){
  const region={querySelector:selector=>selector===marker?{}:null};
  return {querySelector:selector=>selector==='[data-vcha-container-mount]'?(inShadow?{shadowRoot:region}:null):inShadow?null:region.querySelector(selector)};
}
test('fixture replacement respects modal and blocked markers in document and candidate shadow',()=>{
  for(const marker of ['[aria-modal="true"],dialog[open]','[data-navigation-blocked="true"]'])for(const inShadow of [false,true]){
    const h=harness();h.frame().props.ref.current={contentDocument:guardedDocument(marker,inShadow)};
    h.button('390px').props.onClick();h.mode('matched');
    assert.equal(h.frame().props.src,'/design-review/sol15/vcha-container/frame/320');assert.equal(h.frame().props.width,1440);
  }
});
test('fixture replacement requires affirmative dirty-state confirmation and fails closed on unreadable documents',()=>{
  for(const approve of [false,true])for(const inShadow of [false,true]){
    let confirms=0;const h=harness({confirm:()=>{confirms++;return approve;}});
    h.frame().props.ref.current={contentDocument:guardedDocument('[data-dirty="true"]',inShadow)};
    h.button('390px').props.onClick();h.mode('matched');
    assert.equal(confirms,2);assert.equal(h.frame().props.src,'/design-review/sol15/vcha-container/frame/'+(approve?390:320));
    assert.equal(h.frame().props.width,approve?390:1440);
  }
  const h=harness();h.frame().props.ref.current={get contentDocument(){throw Error('unreadable');}};
  h.button('390px').props.onClick();assert.equal(h.frame().props.src,'/design-review/sol15/vcha-container/frame/320');
});
