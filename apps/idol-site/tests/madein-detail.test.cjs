const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('export {Editor,WorkDetail};','export {Editor,WorkDetail,LoonaScoreInput,madeinDetailMedia};').replace('{console,window:win,fetch:fakeFetch','{console,document:{getElementById:()=>null},window:win,fetch:fakeFetch');
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`
 return {settle,wp,find,walk,txt,requests,editor:()=>et,tree:()=>wt,renderWork:()=>w.render(wp),media:exportsObj.madeinDetailMedia,fail(){saveFailure={error:'EDIT_CONFLICT'};}};
})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
const original={id:'rec28ldfRTrPen',groupIds:['rec28ldfRTiCzI'],url:'https://www.youtube.com/watch?v=yE6yETkVI3Q'};
test('MADEIN imagery matches stable work ID and exact source, and rejects reused stage clips',()=>{
 const h=harness(),stage={videoId:'eucm0SOw4QQ',url:'https://www.youtube.com/watch?v=eucm0SOw4QQ'};
 assert.match(h.media({...original,stage}).poster,/super-obvious-mv.jpg$/);
 assert.match(h.media({...original,stage}).stagePoster,/ep916-figma-render.png$/);
 assert.equal(h.media({...original,id:'Super Obvious',stage}).poster,undefined);
 assert.equal(h.media({...original,url:'https://www.youtube.com/watch?v=OTHER',stage}).poster,undefined);
 assert.equal(h.media({...original,groupIds:[],stage}),null);
 assert.equal(h.media({...original,stage:{...stage,videoId:'wrong'}}).stagePoster,undefined);
 assert.equal(h.media({...original,stage:{...stage,clip:{startSeconds:10,endSeconds:20}}}).stagePoster,undefined);
});
test('MADEIN rating switches preserve Editor position, decimal zero, clear-to-null and failed drafts',async()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:original.groupIds};await h.settle();
 const editorNode=()=>h.walk(h.tree()).find(({node})=>node.props.table==='works');
 const position=editorNode().path,key=editorNode().node.key;
 const input=()=>h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput');
 assert.equal(editorNode().node.props.madein,true);assert.ok(input());
 input().props.onChange(0);await h.settle();
 h.find(h.tree(),n=>n.type==='button'&&h.txt(n)==='评分 →').props.onClick();await h.settle();
 h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();
 h.find(h.tree(),n=>n.props.id==='mv-tab').props.onClick();await h.settle();
 assert.equal(editorNode().path,position);assert.equal(editorNode().node.key,key);assert.equal(input().props.value,0);
 assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
 h.fail();await h.find(h.editor(),n=>n.props.ref).props.onClick();await h.settle();assert.equal(input().props.value,0);assert.equal(h.editor().props['data-dirty'],'true');
 input().props.onChange(null);await h.settle();assert.equal(input().props.value,null);
 assert.equal(h.walk(h.tree()).filter(({node})=>node.props.table==='ratings').length,1,'only actual catalog rating relation yields member editor');
});
test('MADEIN navigation uses guarded artist callback and preserves non-MADEIN branch',()=>{
 const h=harness();let target;h.wp.onArtistNavigate=url=>target=url;h.wp.work={...h.wp.work,groupIds:original.groupIds};const tree=h.renderWork();
 h.find(tree,n=>n.props['aria-label']==='MADEIN 首页').props.onClick();assert.equal(target,'/artists/madein');
 h.wp.work={...h.wp.work,groupIds:[]};assert.equal(h.find(h.renderWork(),n=>n.props.className==='madein-work-detail'),undefined);
 for(const file of ['madein-logo.png','super-obvious-mv.jpg','saturn-mv.jpg','love-afraid-mv.jpg','super-obvious-ep916-figma-render.png'])assert.ok(fs.statSync(path.join(__dirname,'../public/artist/madein/figma-20261017',file)).size>0);
});
test('missing MADEIN rating artwork is omitted without an audit placeholder',()=>{
 const h=harness();h.wp.work={...h.wp.work,groupIds:original.groupIds};const t=h.renderWork();
 assert.equal(h.find(t,n=>n.props.className==='madein-rating-image-empty'),undefined);
 assert.doesNotMatch(h.txt(t),/封面待补|来源待确认/);
});
test('SATURN stage artwork matches the production dated performance and fails closed on source drift',()=>{
 const h=harness(),stage=JSON.parse(fs.readFileSync('data/stage-videos.json')).rec28ldfRTrCHR;
 const work={...original,id:'rec28ldfRTrCHR',url:'https://www.youtube.com/watch?v=PVbqyKzfAjI',stage};
 assert.equal(stage.videoId,'Xc1x-CuRjj0');assert.match(stage.title,/THE SHOW 250311/);
 const media=h.media(work);assert.match(media.stagePoster,/saturn-the-show-250311-original.jpg$/);assert.equal(media.stageLabel,'THE SHOW · 250311');assert.match(media.poster,/saturn-mv.jpg$/);
 for(const change of [{videoId:'other'},{url:'https://www.youtube.com/watch?v=other'},{clip:{startSeconds:1,endSeconds:5}}])assert.equal(h.media({...work,stage:{...stage,...change}}).stagePoster,undefined);
 assert.equal(h.media({...work,id:'other'}).stagePoster,undefined);assert.equal(h.media({...work,stage:null}).stagePoster,undefined);
 const evidence=JSON.parse(fs.readFileSync('data/madein-stage-image-evidence.json'));
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('public'+media.stagePoster)).digest('hex'),evidence.sha256);
 assert.equal(evidence.exactYouTubeOriginalThumbnail,false);
});
