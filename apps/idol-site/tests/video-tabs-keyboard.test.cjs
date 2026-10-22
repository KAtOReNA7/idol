const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,requests,tree:()=>wt,editor:()=>et,find,walk,txt,
  draft(value){find(et,n=>n.type==='input'&&n.props['aria-label']==='MV 分数').props.onChange({target:{value}})},
  tabs(){
   const list=find(wt,n=>n.props.role==='tablist');let active=0,prevented=0;
   const nodes=walk(list).map(x=>x.node).filter(n=>n.props.role==='tab').map((element,i)=>({element,disabled:false,hidden:false,visible:true,tabIndex:element.props.tabIndex,getClientRects(){return this.visible?[{}]:[]},focus(){active=i;list.props.onFocus({currentTarget:container,target:this})}}));
   const container={querySelectorAll:()=>nodes};
   return {nodes,list,active:()=>active,prevented:()=>prevented,
    key(key,extra={}){list.props.onKeyDown({key,target:nodes[active],currentTarget:container,preventDefault(){prevented++},...extra})},
    click(){nodes[active].element.props.onClick()}
   };
  }
 };
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
test('manual tab arrows/Home/End move visible focus only, preserving media selection and unsaved drafts',async()=>{
 const h=harness();let changes=0,backs=0;h.wp.onViewChange=()=>changes++;h.wp.onBack=()=>backs++;await h.settle();h.draft('9');await h.settle();
 const before=h.requests.length,editor=h.walk(h.tree()).find(x=>x.node.props?.table==='works'),tabs=h.tabs();
 assert.equal(tabs.nodes[0].tabIndex,0);assert.equal(tabs.nodes[1].tabIndex,-1);
 for(const [key,index] of [['ArrowRight',1],['ArrowRight',0],['ArrowLeft',1],['Home',0],['End',1]]){
  tabs.key(key);assert.equal(tabs.active(),index);assert.equal(tabs.nodes[index].tabIndex,0);assert.equal(tabs.nodes[1-index].tabIndex,-1);
  assert.equal(changes,0);assert.equal(h.tree().props.className,'detail ');assert.equal(h.requests.length,before);
 }
 assert.equal(tabs.prevented(),5);
 for(const key of ['Enter',' ','Tab','ArrowDown','ArrowUp'])tabs.key(key);
 tabs.key('ArrowLeft',{altKey:true});tabs.key('ArrowLeft',{ctrlKey:true});tabs.key('ArrowLeft',{metaKey:true});
 assert.equal(tabs.prevented(),5,'native activation, Tab, vertical scrolling and shortcuts are not intercepted');
 tabs.click();await h.settle();assert.equal(changes,1);assert.equal(h.tree().props.className,'detail stage-view');assert.equal(h.requests.length,before);
 const after=h.walk(h.tree()).find(x=>x.node.props?.table==='works');assert.equal(after.path,editor.path);assert.equal(after.node.key,editor.node.key);
 const mv=h.tabs();mv.key('Home');mv.click();await h.settle();
 assert.equal(h.find(h.editor(),n=>n.type==='input'&&n.props['aria-label']==='MV 分数').props.value,9);
 assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);assert.equal(backs,0);
});
test('hidden or disabled tabs are excluded and no visible target is a safe no-op',async()=>{
 const h=harness();await h.settle();const t=h.tabs();
 for(const flag of ['hidden','disabled','visible']){
  t.nodes[1][flag]=flag==='visible'?false:true;t.key('ArrowRight');assert.equal(t.active(),0);t.nodes[1][flag]=flag==='visible'?true:false;
 }
 t.nodes[0].visible=false;t.nodes[1].visible=false;const before=t.prevented();t.key('End');assert.equal(t.prevented(),before);
});
for(const missing of ['mv','stage','both'])test('unique panel binding and tab entry work when '+missing+' media is absent',async()=>{
 const h=harness();h.wp.work={...h.wp.work,...(missing!=='stage'?{url:''}:{}),...(missing!=='mv'?{stage:null}:{})};h.wp.initialView='stage';await h.settle();
 const tree=h.tree(),items=h.walk(tree).map(x=>x.node),ids=items.filter(n=>n.props.id).map(n=>n.props.id);
 assert.equal(new Set(ids).size,ids.length);const t=h.tabs();assert.equal(t.nodes[0].tabIndex,-1);assert.equal(t.nodes[1].tabIndex,0);
 for(const tab of t.nodes){assert.equal(tab.element.type,'button');assert.equal(items.filter(n=>n.props.id===tab.element.props['aria-controls']&&n.props.role==='tabpanel').length,1);}
 assert.equal(h.find(tree,n=>n.props.role==='tabpanel').props['aria-labelledby'],'stage-tab');
 t.key('Home');t.click();await h.settle();assert.equal(h.find(h.tree(),n=>n.props.role==='tabpanel').props['aria-labelledby'],'mv-tab');assert.equal(h.tabs().nodes[0].tabIndex,0);
 assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
});
