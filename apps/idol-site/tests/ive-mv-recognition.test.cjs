const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),testDir=__dirname,repoRequire=require;
function harness(){
 const prefix=fs.readFileSync(path.join(testDir,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('{console,window:win,fetch:fakeFetch','{console,document:{getElementById:()=>null},window:win,fetch:fakeFetch');
 const h=vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {settle,wp,find,walk,txt,requests,editor:()=>et,tree:()=>wt,renderWork:()=>w.render(wp)};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(repoRequire,testDir);
 h.wp.work={...h.wp.work,id:'recvxyHuKMaCIP',song:'LOVE DIVE',url:'https://www.youtube.com/watch?v=Y8JFxS1HlDo',groupIds:['recvxyEBDZT8Xj']};
 const r=h.wp.data.ratings[0];r.workIds=[h.wp.work.id];r.photo={table:'ratings',recordId:r.id,fieldId:'photos',sourceKind:'mv_look_photo',index:2};r.referencePhoto={...r.photo,index:0,sourceKind:'mv_still',kind:'本 MV 截图'};
 return h;
}
test('actual LOVE DIVE detail receives exact approved primary/reference and no duplicate editor',async()=>{
 const h=harness();await h.settle();const section=h.find(h.tree(),n=>n.props.className==='editorial-mv-recognition');assert.ok(section);assert.equal(section.props.hidden,false);const photo=h.find(section,n=>n.type?.name==='PhotoView');assert.equal(photo.props.photo.index,2);assert.equal(photo.props.referencePhoto.index,0);assert.equal(photo.props.photo.recordId,'recRating');assert.equal(h.walk(section).filter(x=>x.node.type==='article').length,1);assert.equal(h.walk(section).filter(x=>x.node.props.table==='ratings').length,0);assert.equal(h.walk(h.tree()).filter(x=>x.node.props.table==='ratings').length,1);
 let id;h.wp.onMember=value=>id=value;h.find(h.renderWork(),n=>n.props.className==='member-name').props.onClick();assert.equal(id,'recMember');
 const editor=()=>h.walk(h.tree()).find(x=>x.node.props.table==='works');const before=editor().path;h.find(h.tree(),n=>n.props.id==='stage-tab').props.onClick();await h.settle();assert.equal(h.find(h.tree(),n=>n.props.className==='editorial-mv-recognition').props.hidden,true);assert.equal(editor().path,before);assert.equal(h.requests.filter(r=>r.url==='/api/save').length,0);
});
test('no invented cast, missing member, legacy photo, cross-work row or BADVILLAIN gallery',()=>{
 for(const mutate of [h=>h.wp.data.ratings[0].photo=null,h=>h.wp.data.ratings[0].photo.sourceKind='mv_still',h=>h.wp.data.ratings[0].memberIds=['unknown'],h=>h.wp.data.ratings[0].memberIds.push('other'),h=>h.wp.data.ratings[0].workIds.push('other'),h=>h.wp.data.ratings[0].photo.recordId='wrong',h=>h.wp.work.groupIds=['rec28ldfRTiD0h']]){const h=harness();mutate(h);assert.equal(h.find(h.renderWork(),n=>n.props.className==='editorial-mv-recognition'),undefined);}
});

test('LOVE DIVE five and After LIKE three approved images render only their actual linked members',()=>{
 for(const [workId,song,count]of [['recvxyHuKMaCIP','LOVE DIVE',5],['recvxyHuKMC56f','After LIKE',3]]){
  const h=harness();h.wp.work={...h.wp.work,id:workId,song};const seed=h.wp.data.ratings[0];
  h.wp.data.members=Array.from({length:count},(_,i)=>({id:'recMember'+i,stageName:'MEMBER '+i,cnName:'成员'+i,groupIds:[]}));
  h.wp.data.ratings=h.wp.data.members.map((m,i)=>({...seed,id:'recRating'+i,memberIds:[m.id],workIds:[workId],photo:{...seed.photo,recordId:'recRating'+i,index:1+i},referencePhoto:{...seed.referencePhoto,recordId:'recRating'+i}}));
  h.wp.data.ratings.push({...seed,id:'legacy',workIds:[workId],photo:{...seed.photo,recordId:'legacy',sourceKind:'mv_still'}});
  const before=JSON.stringify(h.wp.data),section=h.find(h.renderWork(),n=>n.props.className==='editorial-mv-recognition');
  const photos=h.walk(section).filter(x=>x.node.type?.name==='PhotoView');assert.equal(photos.length,count);
  for(let i=0;i<count;i++){assert.equal(photos[i].node.props.photo.recordId,'recRating'+i);assert.equal(photos[i].node.props.photo.index,i+1);assert.equal(photos[i].node.props.referencePhoto.index,0);assert.match(photos[i].node.props.label,new RegExp('成员'+i+' · MEMBER '+i));}
  assert.equal(JSON.stringify(h.wp.data),before);
 }
});
test('IZONE generic cast and existing photo reference stay on their original branch',()=>{const h=harness();h.wp.work={...h.wp.work,groupIds:['izone-fixture']};const tree=h.renderWork();assert.equal(h.find(tree,n=>n.props.className==='editorial-mv-recognition'),undefined);const section=h.find(tree,n=>n.props.className==='section cast-section');assert.ok(section);const photo=h.find(section,n=>n.type?.name==='PhotoView');assert.equal(photo.props.photo.index,2);assert.equal(photo.props.referencePhoto.index,0);});
