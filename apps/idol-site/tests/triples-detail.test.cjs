const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('export {Editor,WorkDetail};','export {Editor,WorkDetail,LoonaScoreInput,triplesDetailMedia};');
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,find,walk,txt,requests,editor:()=>et,tree:()=>wt,renderWork:()=>w.render(wp),media:exportsObj.triplesDetailMedia,fail(){saveFailure={error:'EDIT_CONFLICT'};}};
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
const original={id:'rec28ldfRTrCjG',groupIds:['rec28ldfRTiCtw'],url:'https://www.youtube.com/watch?v=2tda_TCjz8w'};
test('tripleS exact record and URL identity gates approved media; stage identity is separate',()=>{
 const h=harness();const stage={videoId:'y2Zx2JpmUU8',url:'https://www.youtube.com/watch?v=y2Zx2JpmUU8'};
 const m=h.media({...original,stage});assert.match(m.poster,/mv-girls-never-die.jpg$/);assert.match(m.releaseCover,/release-assemble24.jpg$/);assert.match(m.stagePoster,/stage-girls-never-die-mcountdown-843.jpg$/);
 assert.equal(h.media({...original,id:'girls-never-die'}),null);assert.equal(h.media({...original,url:'https://www.youtube.com/watch?v=OTHER'}),null);assert.equal(h.media({...original,groupIds:[]}),null);
 assert.equal(h.media({...original,stage:{...stage,videoId:'different'}}).stagePoster,undefined);
 assert.equal(h.media({...original,stage:{...stage,clip:{startSeconds:10,endSeconds:20}}}).stagePoster,undefined);
 assert.equal(m.publicationDate,'2024-05-08');
});
test('tripleS scope opts into decimal editor and never adds a research lineup',async()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:original.groupIds};await h.settle();
 assert.ok(h.find(h.tree(),n=>n.props.className==='triples-work-heading'));
 assert.equal(h.find(h.tree(),n=>n.props.table==='works').props.triples,true);
 assert.ok(h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput'));
 assert.equal(h.walk(h.tree()).filter(({node})=>node.props.className==='cast-card').length,1,'only existing rating relation appears');
});
test('tripleS typed zero survives failed save, and MV/stage keep the same editor',async()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:original.groupIds};await h.settle();
 const initial=h.find(h.tree(),n=>n.props.table==='works');
 const input=()=>h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput');input().props.onChange(0);await h.settle();
 h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();assert.equal(h.find(h.tree(),n=>n.props.table==='works').key,initial.key);
 h.find(h.tree(),n=>n.props.id==='mv-tab').props.onClick();await h.settle();assert.equal(input().props.value,0);assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
 h.fail();await h.find(h.editor(),n=>n.props.ref).props.onClick();await h.settle();assert.equal(input().props.value,0);assert.equal(h.editor().props['data-dirty'],'true');assert.match(h.txt(h.editor()),/输入已保留/);
});
test('tripleS header and release navigation use the guarded artist route callback',()=>{
 const h=harness();let target;h.wp.onArtistNavigate=url=>target=url;h.wp.work={...h.wp.work,...original};let t=h.renderWork();
 h.find(t,n=>n.props['aria-label']==='tripleS 首页').props.onClick();assert.equal(target,'/artists/triples');
 h.find(h.find(t,n=>n.props.className==='triples-associated-release'),n=>n.type==='button').props.onClick();assert.equal(target,'/artists/triples?section=works&release=assemble24');
 const source=fs.readFileSync(path.join(__dirname,'../app/page.tsx'),'utf8');assert.match(source,/onArtistNavigate=\{journey.leaveTo\}/);
});
