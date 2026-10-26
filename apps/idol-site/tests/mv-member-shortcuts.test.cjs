const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
// Execute the actual WorkDetail and Editor components with the existing hook-model harness.
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,requests,win,listeners,find,walk,txt,tree:()=>wt,editor:()=>et,memberEditor:()=>mt,
  renderWork:()=>w.render(wp),
  draft(){find(et,n=>n.type==='input'&&n.props['aria-label']==='MV 分数').props.onChange({target:{value:'9'}});find(mt,n=>n.type==='button').props.onClick();},
  memberDraft(){find(mt,n=>n.type==='input'&&n.props['aria-label']==='表现分').props.onChange({target:{value:'9.5'}});}
 };
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
const shortcuts=(h,t=h.tree())=>h.find(t,n=>n.props.className==='mv-member-shortcuts');
const buttons=(h,t)=>h.walk(t).map(x=>x.node).filter(n=>n.type==='button');
test('MV cast shortcuts use only this work’s historical rating roster, Chinese display names, and exact card targets',async()=>{
 const h=harness();h.wp.data={...h.wp.data,members:[{id:'recMember',stageName:'MEMBER',cnName:'小美',groupIds:[],photo:null,status:'已退团'},{id:'recCurrent',stageName:'CURRENT',cnName:'现役成员',groupIds:[]}],ratings:[...h.wp.data.ratings,{score:null,stylingScore:null,id:'recUnknown',name:'待核对艺名',memberIds:[],workIds:[h.wp.work.id]},{id:'recOther',name:'其他作品成员',memberIds:['recCurrent'],workIds:['other-work']}]};
 const tree=h.renderWork(),nav=shortcuts(h,tree),items=buttons(h,nav);
 assert.equal(nav.type,'nav');assert.equal(nav.props['aria-label'],'本支成员');assert.deepEqual(Array.from(items,n=>h.txt(n)),['小美 · MEMBER','待核对艺名']);
 for(const b of items){assert.equal(b.props.type,'button');assert.equal(b.props.onKeyDown,undefined,'native Enter/Space activation remains available');const card=h.find(tree,n=>n.props.id===b.props['aria-controls']);assert.ok(card);assert.equal(card.props.tabIndex,-1);assert.match(card.props['aria-label'],/本支 MV 成员卡片/);}
});
test('shortcut focuses and scrolls only its card without saving, playing, navigating, clearing drafts or changing editor identity',async()=>{
 const h=harness();let navigation=0;h.wp.onBack=h.wp.onMember=h.wp.onGroup=h.wp.onNext=h.wp.onViewChange=()=>navigation++;await h.settle();h.draft();await h.settle();h.memberDraft();await h.settle();
 const before=h.requests.length,editors=h.walk(h.tree()).filter(x=>x.node.props.table).map(x=>[x.path,x.node.key]),calls=[];
 const card=h.find(h.tree(),n=>n.props.className==='cast-card');card.props.ref({focus:o=>calls.push(['focus',o.preventScroll]),scrollIntoView:o=>calls.push(['scroll',o.block,o.behavior])});
 buttons(h,shortcuts(h))[0].props.onClick();await h.settle();assert.deepEqual(calls,[['focus',true],['scroll','center','smooth']]);assert.equal(h.requests.length,before);assert.equal(navigation,0);assert.equal(h.tree().props.className,'detail ');
 assert.equal(h.find(h.editor(),n=>n.props['aria-label']==='MV 分数').props.value,9);assert.equal(h.find(h.memberEditor(),n=>n.props['aria-label']==='表现分').props.value,9.5);assert.equal(h.memberEditor().props['data-dirty'],'true');assert.ok(h.listeners.get('beforeunload').size);assert.deepEqual(h.walk(h.tree()).filter(x=>x.node.props.table).map(x=>[x.path,x.node.key]),editors);assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
 h.win.matchMedia=()=>({matches:true});buttons(h,shortcuts(h))[0].props.onClick();assert.deepEqual(calls.at(-1),['scroll','center','auto']);
 card.props.ref(null);const count=calls.length;buttons(h,shortcuts(h))[0].props.onClick();assert.equal(calls.length,count,'missing card is a safe no-op');
});
test('shortcuts disappear for stage and empty rosters; returning to MV preserves drafts',async()=>{
 const h=harness();await h.settle();h.draft();await h.settle();h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();assert.equal(shortcuts(h),undefined);h.find(h.tree(),n=>n.props.id==='mv-tab').props.onClick();await h.settle();assert.ok(shortcuts(h));assert.equal(h.find(h.editor(),n=>n.props['aria-label']==='MV 分数').props.value,9);
 h.wp.data={...h.wp.data,ratings:[]};assert.equal(shortcuts(h,h.renderWork()),undefined);
});
