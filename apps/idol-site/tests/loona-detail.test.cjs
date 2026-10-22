const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('export {Editor,WorkDetail};','export {Editor,WorkDetail,LoonaScoreInput};');
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,find,walk,txt,requests,editor:()=>et,tree:()=>wt,renderWork:()=>w.render(wp),fail(){saveFailure={error:'EDIT_CONFLICT'};},score(props){return new Runner(exportsObj.LoonaScoreInput).render(props);}};
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
test('LOONA score control keeps null distinct from 0.0 and supports clear plus bounded decimal steps',()=>{
 const h=harness();let value=null;const render=()=>h.score({value,label:'表现分',disabled:false,onChange:v=>value=v});
 let t=render();assert.equal(h.find(t,n=>n.type==='input').props.value,'');assert.equal(h.find(t,n=>n.type==='input').props.step,'0.1');
 h.find(t,n=>n.props['aria-label']==='表现分增加 0.1').props.onClick();assert.equal(value,.1);
 t=render();h.find(t,n=>n.props['aria-label']==='表现分减少 0.1').props.onClick();assert.equal(value,0);
 t=render();assert.equal(h.find(t,n=>n.type==='input').props.value,'0.0');assert.equal(h.find(t,n=>n.props['aria-label']==='表现分减少 0.1').props.disabled,true);
 h.find(t,n=>n.props.className==='loona-score-clear').props.onClick();assert.equal(value,null);
 value=9.9;t=render();h.find(t,n=>n.props['aria-label']==='表现分增加 0.1').props.onClick();assert.equal(value,10);assert.equal(h.find(render(),n=>n.props['aria-label']==='表现分增加 0.1').props.disabled,true);
});
test('LOONA-only scope preserves default editor step and exact Butterfly image identity',async()=>{
 const h=harness();await h.settle();assert.equal(h.find(h.editor(),n=>n.type==='input').props.step,'0.5');
 h.wp.work={...h.wp.work,id:'recvxyOz5X7G95',song:'Butterfly',groupIds:['recvxyEBDZJAXm']};let t=h.renderWork();
 assert.ok(h.find(t,n=>n.props.className==='loona-work-heading'));assert.ok(h.find(t,n=>n.props.className==='loona-associated-release'));
 assert.equal(h.find(t,n=>n.props.posterSrc).props.posterSrc,'/artist/loona/approved-home/butterfly.jpg');
 assert.equal(h.find(t,n=>n.props.table==='works').props.loona,true);
 h.wp.work={...h.wp.work,song:'different work'};assert.equal(h.find(h.renderWork(),n=>n.props.posterSrc),undefined);
});
test('LOONA stage ticket uses actual metadata and retains MV/stage editor identity',async()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:['recvxyEBDZJAXm']};await h.settle();
 const editor=h.find(h.tree(),n=>n.props.table==='works');
 h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();
 const ticket=h.find(h.tree(),n=>n.props.className==='loona-programme-ticket');assert.ok(ticket);assert.ok(h.txt(ticket).includes(h.wp.work.stage.title));assert.doesNotMatch(h.txt(ticket),/EP\.607/);
 assert.equal(h.find(h.tree(),n=>n.props.table==='works').key,editor.key);
});
test('LOONA failed save keeps typed zero and draft; score widget never writes by itself',async()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:['recvxyEBDZJAXm']};await h.settle();
 let input=h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput');input.props.onChange(0);await h.settle();assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
 h.fail();await h.find(h.editor(),n=>n.props.ref).props.onClick();await h.settle();
 input=h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput');assert.equal(input.props.value,0);assert.equal(h.editor().props['data-dirty'],'true');assert.match(h.txt(h.editor()),/输入已保留/);
});
