// Executes the production component with a deterministic hook/element model.
// Real browser focus/history and layout are separate acceptance checks.
const test=require('node:test'),assert=require('node:assert/strict'),esbuild=require('esbuild'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const code=esbuild.buildSync({stdin:{contents:"export * from './components/personal-insights/PersonalInsights';export * from './lib/idol/personal-insights/view-state';export * from './lib/idol/stage-source';",resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'}).outputFiles[0].text;
function harness(){
 let slots=[],i=0,effects=[],tree,state,dirty=false;const calls=[];
 const React={useId:()=>':test:',useRef(v){const n=i++;return slots[n]??(slots[n]={current:v});},useState(v){const n=i++;if(!slots[n])slots[n]={value:typeof v==='function'?v():v};return [slots[n].value,x=>{slots[n].value=typeof x==='function'?x(slots[n].value):x;dirty=true;}];},useEffect(fn,deps){const n=i++,old=slots[n];if(!old||!deps||!old.deps||deps.some((d,j)=>!Object.is(d,old.deps[j]))){slots[n]={deps};effects.push(fn);}}};
 const jsx=(type,props)=>({type,props:props??{}});const mod={exports:{}};vm.runInNewContext('(function(require,module,exports){'+code+'})',{URL,Intl,console,document:{querySelector:()=>null}})(name=>name==='react'?React:{jsx,jsxs:jsx,Fragment:'fragment'},mod,mod.exports);const out=mod.exports;
 state=out.defaultInsightsViewState();
 const stage={videoId:'abcdefghijk',url:'https://www.youtube.com/watch?v=abcdefghijk',scoreBinding:{videoId:'abcdefghijk',initialScore:null,initializedAt:'2026-01-01T00:00:00Z'}};
 const input={groups:[{id:'recG',name:'Group'}],members:[{id:'recM',name:'Member'}],works:Array.from({length:25},(_,n)=>({id:'recW'+n,name:'Work '+n,song:'Song '+n,groupIds:['recG'],ratingIds:['recR'+n],score:9,stageScore:10,stage,watched:'已观看'})),ratings:Array.from({length:25},(_,n)=>({id:'recR'+n,memberIds:['recM'],workIds:['recW'+n],score:8,stylingScore:7}))};
 let disabled=false;
 function render(){i=0;effects=[];dirty=false;tree=out.PersonalInsights({catalog:input,memberLabel:()=> '中文成员',isStageScoreEligible:w=>out.stageHasValidBinding(w.stage),viewState:state,onViewStateChange:action=>{state=typeof action==='function'?action(state):action;dirty=true;},onWork:(...args)=>calls.push(['work',...args]),onMember:id=>calls.push(['member',id]),onGroup:id=>calls.push(['group',id]),disabled});for(const f of effects)f();return tree;}
 function flush(){for(let n=0;n<10;n++){render();if(!dirty)return;}throw Error('state did not settle');}
 function nodes(node){if(node==null||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children)];}
 function find(predicate){const node=nodes(tree).find(predicate);assert.ok(node,'element not found');return node;}
 function click(node){const focused=[];node.props.onClick({currentTarget:{focus:opts=>{focused.push(opts);calls.push(['focus']);},isConnected:true}});flush();return focused;}
 flush();return {input,calls,get state(){return state;},setState(s){state={...state,...s};flush();},find,click,flush,remount(){slots=[];flush();},setDisabled(v){disabled=v;flush();}};
}
test('actual component carries stage intent after focus and keeps controlled state across remount',()=>{
 const h=harness();h.setState({domain:'stage',revisitPage:2,groupSort:'samples',memberMetric:'styling'});
 const button=h.find(n=>n.props['data-browse-anchor']==='insights-revisit-recW10');h.click(button);
 assert.equal(h.calls[0][0],'focus');assert.equal(h.calls[1][0],'work');assert.equal(h.calls[1][1],'recW10');assert.equal(h.calls[1][2].video,'stage');
 const saved=JSON.stringify(h.state);h.remount();assert.equal(JSON.stringify(h.state),saved);assert.ok(h.find(n=>n.props['data-browse-anchor']==='insights-revisit-recW10'));
});
test('actual component MV watched-unrated and member trace always open MV',()=>{
 const h=harness();h.input.works.forEach(w=>w.score=null);h.setState({domain:'stage',revisitKind:'watched-unrated'});h.click(h.find(n=>n.props['data-browse-anchor']==='insights-revisit-recW0'));
 assert.equal(h.calls.at(-1)[2].video,'mv');
 h.click(h.find(n=>n.props['data-browse-anchor']==='insights-trace-toggle-recM'));assert.equal(h.state.selectedMemberId,'recM');
 h.setState({tracePage:2});h.remount();h.click(h.find(n=>n.props['data-browse-anchor']==='insights-trace-recM-recW20'));assert.equal(h.calls.at(-1)[2].video,'mv');
});
test('actual component clamps four pages and clears missing selected member after catalog changes',()=>{
 const h=harness();h.setState({groupsPage:99,membersPage:99,revisitPage:99,tracePage:99,selectedMemberId:'recM'});
 assert.equal(h.state.groupsPage,1);assert.equal(h.state.membersPage,1);assert.equal(h.state.revisitPage,3);assert.equal(h.state.tracePage,2);
 h.input.works.splice(1);h.input.ratings.splice(1);h.input.members.splice(0);h.flush();
 assert.equal(h.state.revisitPage,1);assert.equal(h.state.tracePage,1);assert.equal(h.state.selectedMemberId,null);
});
test('actual disabled buttons neither focus nor navigate, and changing domain resets all pages',()=>{
 const h=harness();h.setState({revisitPage:2,tracePage:2,selectedMemberId:'recM'});h.setDisabled(true);h.click(h.find(n=>n.props['data-browse-anchor']==='insights-revisit-recW10'));assert.equal(h.calls.length,0);
 h.setDisabled(false);h.find(n=>n.type==='input'&&n.props.value==='stage').props.onChange();h.flush();assert.equal(h.state.domain,'stage');for(const k of ['groupsPage','membersPage','revisitPage','tracePage'])assert.equal(h.state[k],1);assert.equal(h.state.selectedMemberId,null);
});
