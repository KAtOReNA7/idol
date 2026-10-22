// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node CommonJS test harness dependencies.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
// Exercise the actual WorkDetail/Editor hook-model used by the existing draft tests.
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,requests,find,walk,txt,tree:()=>wt,editor:()=>et,memberEditor:()=>mt,
  renderWork:()=>w.render(wp),block:(key,value)=>workProps.onNavigationBlockedChange(key,value),
  draft(){find(et,n=>n.type==='input'&&n.props['aria-label']==='MV 分数').props.onChange({target:{value:'9'}});},
  memberDraft(){find(mt,n=>n.type==='button').props.onClick();},
  changeMember(){find(mt,n=>n.type==='input'&&n.props['aria-label']==='表现分').props.onChange({target:{value:'9.5'}});}
 };
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
const links=[
 {workId:'recJapanese',title:'SAME SONG (Japanese Version)',labels:['日语录音版'],categories:['其他版本']},
 {workId:'recMix',title:'SAME SONG (Remix)',labels:['混音版'],categories:['混音关联']},
 {workId:'recPart',title:'STORY Part 2',labels:['系列影像第2部'],categories:['系列影像']},
 {workId:'recMulti',title:'SUPERNATURAL Part.2',labels:['日语录音版','系列影像'],categories:['其他版本','系列影像']},
];
function addDisplay(h){h.wp.work={...h.wp.work,channel:'ORIGINAL CHANNEL',versionDisplay:{tags:['日语','混音','日语','MV','original','BATTER UP','ORIGINAL CHANNEL'],links:structuredClone(links)}};h.wp.onVersion=()=>{};}
const navigation=(h,t=h.tree())=>h.find(t,n=>n.props.className==='work-version-links');
const buttons=(h,t)=>h.walk(t).map(x=>x.node).filter(n=>n.type==='button');
const versionButtons=(h)=>buttons(h,navigation(h));

test('MV tags append without duplicating existing metadata and relation buttons have exact category/labels and existing work IDs',async()=>{
 const h=harness();addDisplay(h);await h.settle();
 const tags=h.find(h.tree(),n=>n.props.className==='tags');assert.deepEqual(Array.from(h.walk(tags)).filter(({node})=>node.type==='span').map(({node})=>h.txt(node)),['MV','original','日语','混音']);
 const nav=navigation(h);assert.equal(nav.type,'nav');assert.equal(nav.props['aria-label'],'作品版本与关联');
 const groups=h.walk(nav).map(x=>x.node).filter(n=>n.props.className==='work-version-category').map(n=>h.txt(n));
 assert.deepEqual(Array.from(groups),['其他版本','混音关联','系列影像','其他版本 / 系列影像']);
 const items=versionButtons(h);assert.equal(items.length,links.length,'a multi-category target gets only one button');
 for(const [i,item] of items.entries()){
  assert.equal(item.props.type,'button');assert.equal(item.props.disabled,false);assert.equal(item.props['data-member-work-trigger'],'version:'+h.wp.work.id+':'+links[i].workId);
  assert.equal(item.props['data-browse-anchor'],'version-'+h.wp.work.id+'-'+links[i].workId);assert.equal(item.props.onKeyDown,undefined);
  assert.ok(h.txt(item).includes(links[i].title));for(const label of links[i].labels)assert.ok(h.txt(item).includes(label));
 }
 assert.equal(h.walk(nav).some(({node})=>['h1','h2','article'].includes(node.type)),false,'compact navigation adds no heading or work card');
 assert.doesNotMatch(h.txt(nav),/同一首歌|ORIGINAL CHANNEL|BATTER UP/);
});

test('no display or empty links adds no navigation; stage shows neither derived tags nor version links and keeps its original player binding',async()=>{
 const h=harness();await h.settle();assert.equal(navigation(h),undefined);
 h.wp.work={...h.wp.work,versionDisplay:{tags:['日语'],links:[]}};await h.settle();assert.equal(navigation(h),undefined);assert.match(h.txt(h.find(h.tree(),n=>n.props.className==='tags')),/日语/);
 addDisplay(h);await h.settle();const before=h.find(h.tree(),n=>n.props.workId===h.wp.work.id&&n.props.view==='mv');const mvProps={...before.props};
 h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();assert.equal(navigation(h),undefined);assert.doesNotMatch(h.txt(h.find(h.tree(),n=>n.props.className==='tags')),/日语|混音/);
 const stage=h.find(h.tree(),n=>n.props.workId===h.wp.work.id&&n.props.view==='stage');assert.equal(stage.props.url,h.wp.work.stage.url);assert.equal(stage.props.videoId,h.wp.work.stage.videoId);
 h.find(h.tree(),n=>n.props.id==='mv-tab').props.onClick();await h.settle();assert.equal(JSON.stringify(h.find(h.tree(),n=>n.props.workId===h.wp.work.id&&n.props.view==='mv').props),JSON.stringify(mvProps));assert.ok(navigation(h));
});

test('relation click only requests the selected existing record; work/member drafts, score IDs and stage binding remain unchanged',async()=>{
 const h=harness();addDisplay(h);const navigated=[],order=[];h.wp.onVersion=id=>{order.push('navigate');navigated.push(id);};await h.settle();h.draft();h.memberDraft();await h.settle();h.changeMember();await h.settle();
 const beforeRequests=h.requests.length,work=structuredClone(h.wp.work),editorNodes=h.walk(h.tree()).filter(x=>x.node.props.table).map(x=>[x.path,x.node.key,x.node.props.id,x.node.props.stageVideoId,x.node.props.sourceKey]);
 versionButtons(h)[1].props.onClick({currentTarget:{focus(options){assert.deepEqual(JSON.parse(JSON.stringify(options)),{preventScroll:true});order.push('focus');}}});await h.settle();
 assert.deepEqual(order,['focus','navigate']);
 assert.deepEqual(navigated,['recMix']);assert.equal(h.requests.length,beforeRequests);assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
 assert.equal(h.find(h.editor(),n=>n.props['aria-label']==='MV 分数').props.value,9);assert.equal(h.find(h.memberEditor(),n=>n.props['aria-label']==='表现分').props.value,9.5);
 assert.equal(h.editor().props['data-dirty'],'true');assert.equal(h.memberEditor().props['data-dirty'],'true');assert.equal(JSON.stringify(h.wp.work),JSON.stringify(work));
 assert.deepEqual(h.walk(h.tree()).filter(x=>x.node.props.table).map(x=>[x.path,x.node.key,x.node.props.id,x.node.props.stageVideoId,x.node.props.sourceKey]),editorNodes);
});

test('every relation button disables for either work or member save uncertainty and re-enables only when all are cleared',async()=>{
 const h=harness();addDisplay(h);await h.settle();h.block('works:'+h.wp.work.id,true);await h.settle();assert.ok(versionButtons(h).every(n=>n.props.disabled));
 h.block('ratings:recRating',true);h.block('works:'+h.wp.work.id,false);await h.settle();assert.ok(versionButtons(h).every(n=>n.props.disabled));
 h.block('ratings:recRating',false);await h.settle();assert.ok(versionButtons(h).every(n=>!n.props.disabled));
});

// Run the actual App statements to verify the parent wiring, not a test copy of it.
const source=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const app=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='App');
function appStatement(name){const node=app.body.statements.find(n=>ts.isFunctionDeclaration(n)?n.name?.text===name:ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(ast)===name));assert.ok(node,'production App statement '+name);return node.getText(ast);}
const routing={};vm.runInNewContext('(function(exports){'+ts.transpileModule(`export function routeVersion({chosenWork,data,journey,currentLabel,nextInSequence}){${['activeSequence','nextWork','openVersion'].map(appStatement).join('\n')}return {activeSequence,nextWork,openVersion};}`,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})')(routing);
function routeFixture(id='recSource'){
 const sourceWork={id:'recSource',versionDisplay:{tags:[],links:[{workId:'recRelated'},{workId:'recNext'},{workId:'recMissing'},{workId:'recPlaceholder'}]}};
 const data={works:[sourceWork,{id:'recNext'},{id:'recRelated'},{id:'recPlaceholder',placeholder:{}}]},sequence={ids:['recSource','recNext'],label:'待看',filters:{}},calls=[];
 const journey={sequence,navigate(...args){calls.push(args);return this.allowed!==false;}};
 const evaluate=()=>routing.routeVersion({chosenWork:data.works.find(w=>w.id===id),data,journey,currentLabel:()=>id,nextInSequence:(seq,current,catalog)=>catalog.works.find(w=>w.id===seq.ids[seq.ids.indexOf(current)+1])??null});
 return {data,sequence,calls,journey,evaluate,setId:value=>{id=value;}};
}

test('App keeps the captured queue dormant outside its IDs and restores preview/position/next on return',()=>{
 const h=routeFixture();assert.equal(h.evaluate().activeSequence,h.sequence);assert.equal(h.evaluate().nextWork.id,'recNext');
 h.setId('recRelated');assert.equal(h.evaluate().activeSequence,undefined);assert.equal(h.evaluate().nextWork,null);assert.deepEqual(h.journey.sequence.ids,['recSource','recNext']);
 h.setId('recSource');assert.equal(h.evaluate().activeSequence,h.sequence);assert.equal(h.evaluate().nextWork.id,'recNext');
 assert.match(source,/<WorkDetail[^>]*sequence=\{activeSequence\}[^>]*sequenceLabel=\{activeSequence\?\.label\}[^>]*sequencePosition=\{activeSequence\?activeSequence\.ids\.indexOf\(chosenWork\.id\)\+1:0\}[^>]*sequenceTotal=\{activeSequence\?\.ids\.length\?\?0\}[^>]*onVersion=\{openVersion\}/);
});

test('App uses guarded journey.navigate with the original queue, source label, and no artist-return override',()=>{
 const h=routeFixture(),route=h.evaluate();assert.equal(route.openVersion('recRelated'),true);assert.equal(h.calls.length,1);
 const [next,label,patch,sequence]=h.calls[0];assert.deepEqual(JSON.parse(JSON.stringify(next)),{nav:'works',work:'recRelated',member:null,video:'mv'});assert.equal(label,'recSource');assert.equal(patch,undefined);assert.equal(sequence,h.sequence);assert.equal('artistReturn' in next,false);
 h.journey.allowed=false;assert.equal(route.openVersion('recNext'),false,'journey draft/save rejection is retained');
 const count=h.calls.length;for(const id of ['recMissing','recPlaceholder','recUnrelated','https://example.invalid'])assert.equal(route.openVersion(id),false);assert.equal(h.calls.length,count);
});

test('version navigation explicitly focuses its source button before journey navigation',()=>{assert.match(source,/onClick=\{event=>\{event\.currentTarget\.focus\(\{preventScroll:true\}\);onVersion\(link\.workId\);\}\}/)});
