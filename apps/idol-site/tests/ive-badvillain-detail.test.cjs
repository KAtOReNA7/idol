const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('export {Editor,WorkDetail};','export {Editor,WorkDetail,LoonaScoreInput,editorialDetailMedia};').replace('{console,window:win,fetch:fakeFetch','{console,document:{getElementById:()=>null},window:win,fetch:fakeFetch');
 return vm.runInNewContext('(function(require,__dirname){'+prefix+`\n return {settle,wp,find,walk,txt,requests,editor:()=>et,tree:()=>wt,renderWork:()=>w.render(wp),media:exportsObj.editorialDetailMedia,fail(){saveFailure={error:'EDIT_CONFLICT'};}};\n})`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
for(const [group,gid,id,url] of [['ive','recvxyEBDZT8Xj','recvxyHuKMG1Mr','https://www.youtube.com/watch?v=07EzMbVH3QE'],['badvillain','rec28ldfRTiD0h','rec28ldfRTrQ0L','https://www.youtube.com/watch?v=s-KjDJFOh5s']]){
 test(group+' requires exact persisted identity and URL; never guesses stage artwork',()=>{
  const h=harness(),w={id,url,groupIds:[gid]},m=h.media(w);assert.ok(m);assert.ok(fs.statSync(path.join(__dirname,'../public',m.poster)).size);assert.ok(fs.statSync(path.join(__dirname,'../public',m.releaseCover)).size);assert.equal(h.media({...w,id:'research-media-id'}),null);assert.equal(h.media({...w,url:url+'x'}),null);assert.equal(h.media({...w,groupIds:[]}),null);assert.equal(m.stagePoster,undefined);
 });
 test(group+' preserves decimal zero, failed drafts, hidden member editors and exact editor position across views',async()=>{
  const h=harness();h.wp.work={...h.wp.work,groupIds:[gid]};await h.settle();
  const en=()=>h.walk(h.tree()).find(({node})=>node.props.table==='works'),input=()=>h.find(h.editor(),n=>typeof n.type==='function'&&n.type.name==='LoonaScoreInput');const before=en();assert.equal(before.node.props.editorial,true);assert.ok(input());input().props.onChange(0);await h.settle();
  h.find(h.tree(),n=>n.type==='button'&&h.txt(n).includes('为这条')).props.onClick();await h.settle();assert.equal(input().props.value,0);h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();h.find(h.tree(),n=>n.props.id==='mv-tab').props.onClick();await h.settle();assert.equal(en().path,before.path);assert.equal(en().node.key,before.node.key);assert.equal(input().props.value,0);assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
  h.fail();await h.find(h.editor(),n=>n.props.ref).props.onClick();await h.settle();assert.equal(input().props.value,0);assert.equal(h.editor().props['data-dirty'],'true');input().props.onChange(null);await h.settle();assert.equal(input().props.value,null);assert.equal(h.walk(h.tree()).filter(({node})=>node.props.table==='ratings').length,1);
 });
 test(group+' artist navigation remains guarded; branch never affects unrelated groups',()=>{const h=harness();let target;h.wp.work={...h.wp.work,id,url,groupIds:[gid]};h.wp.onArtistNavigate=u=>target=u;h.find(h.renderWork(),n=>n.props['aria-label']===(group==='ive'?'IVE':'BADVILLAIN')+' 首页').props.onClick();assert.equal(target,'/artists/'+group);h.find(h.renderWork(),n=>n.type==='button'&&h.txt(n)==='发行页').props.onClick();assert.match(target,new RegExp('^/artists/'+group+'\\?section='));h.wp.work={...h.wp.work,groupIds:[]};assert.equal(h.find(h.renderWork(),n=>n.props.className?.includes('editorial-work-detail')),undefined);});
}
test('approved public artwork covers all nine production videos with unchanged original bytes',()=>{
 const h=harness(),snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/snapshot.json'))),crypto=require('node:crypto');let count=0;
 for(const record of snapshot.tables.works.records){const f=record.fields,w={id:record.recordId,url:f.fldhBWXBZE?.[0]?.url,groupIds:(f.fld2wy1cqw??[]).map(x=>x.recordId)};const m=h.media(w);if(!m)continue;count++;for(const kind of ['poster','releaseCover']){const bytes=fs.readFileSync(path.join(__dirname,'../public',m[kind]));assert.ok(bytes.length>2000);}}
 assert.equal(count,9);
 const assets=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/editorial-detail-assets.json')));for(const asset of assets){const bytes=fs.readFileSync(path.join(__dirname,'../public',asset.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);assert.ok(asset.width>0&&asset.height>0);}
 const source=fs.readFileSync(path.join(__dirname,'../app/page.tsx'),'utf8');assert.ok(source.includes('data.works??[]'));assert.ok(source.includes("data.ratings.filter(r=>r.workIds.includes(work.id))"));
});
