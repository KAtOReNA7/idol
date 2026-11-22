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
    return {settle,wp,find,walk,txt,requests,footer:()=>footer,editor:()=>et,member:()=>mt,tree:()=>wt,renderWork:()=>w.render(wp),
      renderControl(node){return new Runner(node.type).render(node.props);},
      setReadTransport(transport){readTransport=transport;},setSaveTransport(transport){saveTransport=transport;},
      rejectSave(code){saveFailure=code?{error:code}:null;},receipt(value){receiptOverride=value;},
      player(){return find(wt,node=>node.props.workId===wp.work.id && 'embedUrl' in node.props);}};
  `;
  // Reuse the primary editor fixture's React lifecycle, record API and save receipts.
  const harness = vm.runInNewContext('(function(require,__dirname){'+source+api+'})',
    {console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout:schedule,clearTimeout,setImmediate,structuredClone}
  )(fromTests,path.resolve(__dirname,'..'));
  harness.wp.work = {...harness.wp.work,id,groupIds:work.groupIds,name:work.name,song:work.song,
    url:work.mv.url,version:work.version,channel:work.mv.channel,officialTitle:work.mv.officialTitle,
    releaseDate:work.mv.releaseDate,videoType:work.mv.videoType,stage:stages[id]};
  harness.wp.data.groups = work.groupIds.map((groupId,i)=>({id:groupId,name:work.groups[i]}));
  harness.wp.data.ratings[0].workIds = [id];
  harness.wp.data.works=[harness.wp.work];
  return harness;
}

async function turn(h,id) { h.find(h.tree(),n=>n.props.id===id+'-tab').props.onClick(); await h.settle(); }
function input(h, label, tree = h.editor()) {
  const matches = node => node.type === 'input' && node.props['aria-label'] === label;
  const direct = h.find(tree, matches);
  if (direct) return direct;
  // Some member editors wrap the same labelled input in a decimal stepper.
  const control = h.find(tree, node => typeof node.type === 'function' && node.props.label === label);
  return control && h.find(h.renderControl(control), matches);
}
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
  const status = h.find(h.editor(), node => node.props.role === 'status');
  assert.match(h.txt(status), /输入(?:仍在|已保留)/);
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

async function assertHiddenMemberDraft(id) {
  const h = currentDetail(id);
  await h.settle();
  const mount = () => h.walk(h.tree()).find(({node}) => node.props.table === 'ratings');
  const original = mount();
  h.find(h.member(), n => n.type === 'button').props.onClick();
  await h.settle();
  const score = () => h.find(h.member(), n => n.props['aria-label'] === '表现分');
  change(score(), '9.5');
  await h.settle();
  await turn(h, 'stage');
  const cast = () => h.find(h.tree(), n => n.props.className === 'section cast-section');
  assert.equal(cast().props.hidden, true);
  assert.equal(h.member().props['data-dirty'], 'true');
  assert.match(h.txt(h.tree()), /有 1 条未保存修改/);
  let focused = 0;
  const card = h.find(h.tree(), n => n.props.id === 'mv-cast-' + original.node.props.id);
  card.props.ref({querySelector: () => ({scrollIntoView() {}, focus() { focused++; }})});
  h.find(h.tree(), n => n.type === 'button' && h.txt(n).includes('去保存成员评分')).props.onClick();
  await h.settle();
  assert.equal(focused, 1);
  assert.equal(cast().props.hidden, false);
  assert.equal(h.find(h.tree(), n => n.props.id === 'mv-tab').props['aria-selected'], true);
  assert.equal(score().props.value, 9.5);
  assert.equal(mount().path, original.path);
  assert.equal(mount().node.key, original.node.key);
  assert.equal(posts(h).length, 0);
}
module.exports={currentDetail,turn,input,change,posts,assertWorkDrafts,assertDetailLinks,assertHiddenMemberDraft};
