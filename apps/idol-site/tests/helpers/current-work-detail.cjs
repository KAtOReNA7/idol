const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const workInventory = require('../../data/stages/inventory.json').works;
const stages = require('../../data/stage-videos.json');
const fromTests = require('node:module').createRequire(path.resolve(__dirname, '../editor-flow.test.cjs'));

function currentDetail(id, schedule=setTimeout) {
  const source = fs.readFileSync(fromTests.resolve('./editor-flow.test.cjs'), 'utf8').split('(async()=>{')[0];
  const work = workInventory.find(row => row.recordId === id);
  assert.ok(work && stages[id], id);
  const api = `
    return {settle,wp,find,walk,txt,requests,footer:()=>footer,editor:()=>et,member:()=>mt,tree:()=>wt,
      setSaveTransport(transport){saveTransport=transport;},
      rejectSave(code){saveFailure=code?{error:code}:null;},receipt(value){receiptOverride=value;},
      player(){return find(wt,node=>node.props.workId===wp.work.id && 'embedUrl' in node.props);}};
  `;
  // Reuse the primary editor fixture's React lifecycle, record API and save receipts.
  const harness = vm.runInNewContext('(function(require,__dirname){'+source+api+'})',
    {console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout:schedule,clearTimeout,setImmediate,structuredClone}
  )(fromTests,path.resolve(__dirname,'..'));
  harness.wp.work = {...harness.wp.work,id,groupIds:work.groupIds,name:work.name,song:work.song,
    url:work.mv.url,version:work.version,channel:work.mv.channel,stage:stages[id]};
  harness.wp.data.groups = work.groupIds.map((groupId,i)=>({id:groupId,name:work.groups[i]}));
  harness.wp.data.ratings[0].workIds = [id];
  harness.wp.data.works=[harness.wp.work];
  return harness;
}

async function turn(h,id) { h.find(h.tree(),n=>n.props.id===id+'-tab').props.onClick(); await h.settle(); }
function input(h,label) { return h.find(h.editor(),n=>n.type==='input' && n.props['aria-label']===label); }
const change = (field,value) => field.props.onChange({target:{value}});
const posts = h => h.requests.filter(request => request.url==='/api/save');
async function assertWorkDrafts(id) {
  const h=currentDetail(id); await h.settle();
  const mount=()=>h.walk(h.tree()).find(({node})=>node.props.table==='works');
  const first=mount(); change(input(h,'MV 分数'),'0'); await h.settle();
  await turn(h,'stage'); change(input(h,'作品整体舞台分'),'9.1'); await h.settle(); await turn(h,'mv');
  assert.equal(mount().path,first.path); assert.equal(mount().node.key,first.node.key);
  assert.equal(input(h,'MV 分数').props.value,0); assert.equal(posts(h).length,0);
  h.rejectSave('EDIT_CONFLICT'); await h.footer().props.onClick(); await h.settle();
  assert.equal(h.editor().props['data-dirty'],'true'); assert.equal(input(h,'MV 分数').props.value,0);
  h.rejectSave(null); await h.footer().props.onClick(); await h.settle();
  const saved=JSON.parse(posts(h).at(-1).body);
  assert.equal(saved.recordId,id); assert.deepEqual(saved.values,{score:0,stageScore:9.1});
  assert.equal(saved.stageVideoId,stages[id].videoId);
  assert.equal(saved.stageSourceKey,stages[id].scoreBinding.sourceKey??stages[id].videoId);
  change(input(h,'MV 分数'),''); await h.settle(); await h.footer().props.onClick(); await h.settle();
  assert.deepEqual(JSON.parse(posts(h).at(-1).body).values,{score:null});
}

async function assertDetailLinks(id) {
  const h=currentDetail(id); let target;
  h.wp.onGroup=groupId=>{target=groupId;}; h.wp.onBack=()=>{target='back';};
  await h.settle();
  const group=h.find(h.tree(),n=>n.type?.name==='GroupLinks'); const rendered=group.type(group.props);
  h.find(rendered,n=>n.type==='button').props.onClick(); assert.equal(target,h.wp.work.groupIds[0]);
  h.find(h.tree(),n=>n.props.className==='button detail-back').props.onClick(); assert.equal(target,'back');
  assert.equal(posts(h).length,0);
}
module.exports={currentDetail,turn,input,change,posts,assertWorkDrafts,assertDetailLinks};
