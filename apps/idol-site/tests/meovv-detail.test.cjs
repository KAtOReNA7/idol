const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {currentDetail,turn,input,change,posts,assertDetailLinks,assertWorkDrafts}=require('./helpers/current-work-detail.cjs');
const {approvedVideoPoster,approvedStagePoster}=require('./helpers/public-artist-loader.cjs')('lib/idol/approved-video-poster.ts');
const id='rec28ldfRTrB45', harness=()=>currentDetail(id);
test('a stalled save releases the editor and retries the exact same zero-score operation',async()=>{
  let expireSave=false;
  const h=currentDetail(id,(fn,ms)=>setTimeout(fn,expireSave&&ms===30000?1:ms));
  await h.settle(); change(input(h,'MV 分数'),'0'); await h.settle();
  h.setSaveTransport(({signal})=>new Promise((resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('transport aborted')),{once:true});
  }));
  expireSave=true;await h.footer().props.onClick();await h.settle();
  assert.match(h.txt(h.editor()),/未及时收到保存结果/);assert.equal(input(h,'MV 分数').props.value,0);
  h.setSaveTransport(null);await h.footer().props.onClick();await h.settle();
  const attempts=posts(h);assert.equal(attempts.length,2);assert.equal(attempts[0].body,attempts[1].body);
  assert.equal(h.editor().props['data-dirty'],undefined);
});
test('MEOW poster and player match the live work, MV and NPOP stage identities',async()=>{
  const h=harness(); await h.settle(); assert.equal(h.player().props.videoId,'jpLHg-AsQV0');
  assert.equal(h.player().props.posterSrc,approvedVideoPoster(id,'jpLHg-AsQV0','mv').src);
  assert.equal(approvedVideoPoster('wrong-work','jpLHg-AsQV0','mv'),null);
  await turn(h,'stage'); assert.equal(h.player().props.videoId,'118STdpg-fY');
  assert.equal(h.player().props.posterSrc,'/artist/stage-video-previews/118STdpg-fY.webp');
  assert.equal(h.player().props.posterLabel,'对应舞台视频封面');
  assert.equal(approvedStagePoster(id,{...h.wp.work.stage,clip:{startSeconds:1,endSeconds:5}}),null);
});
test('unconfirmed receipt retains the zero draft and the retry reuses its operation',async()=>{
  const h=harness(); await h.settle(); change(input(h,'MV 分数'),'0'); await h.settle();
  h.receipt({operationId:'foreign-receipt'}); await h.footer().props.onClick(); await h.settle();
  assert.equal(input(h,'MV 分数').props.value,0); assert.match(h.txt(h.footer()),/核对上次保存/);
  h.receipt(null); await h.footer().props.onClick(); await h.settle();
  const attempts=posts(h); assert.equal(attempts.length,2);assert.equal(attempts[0].body,attempts[1].body);
  assert.equal(h.editor().props['data-dirty'],undefined);
});
test('MEOW keeps 0, decimal stage scores and clearing distinct through failed drafts',()=>assertWorkDrafts(id));
test('changing the stage retains the draft and blocks a save against the new binding',()=>
  require('./helpers/assert-rebound-stage-draft.cjs')(harness));
test('MEOVV group navigation and returning use the guarded parent',()=>assertDetailLinks(id));
test('all original MEOVV supplied images retain the approved bytes',()=>{
  for(const row of require('../data/meovv-figma-asset-manifest.json')){
    const bytes=fs.readFileSync(path.join(__dirname,'../public',row.runtime));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256,row.runtime);
  }
});
test('the hidden member draft returns to its original editor and focus without saving',async()=>{
  const h=harness(); await h.settle(); h.find(h.member(),n=>n.type==='button').props.onClick(); await h.settle();
  const field=()=>h.find(h.member(),n=>n.props['aria-label']==='表现分');
  change(field(),'9.5'); await h.settle();
  const memberMount=()=>h.walk(h.tree()).find(({node})=>node.props.table==='ratings');
  const origin=memberMount();
  await turn(h,'stage'); assert.equal(h.find(h.tree(),n=>n.props.className==='section cast-section').props.hidden,true);
  let focus=0; h.find(h.tree(),n=>n.props.id==='mv-cast-recRating').props.ref({querySelector:()=>({scrollIntoView(){},focus(){focus++;}})});
  h.find(h.tree(),n=>n.type==='button'&&h.txt(n).includes('去保存成员评分')).props.onClick(); await h.settle();
  assert.equal(focus,1);assert.equal(field().props.value,9.5);assert.equal(memberMount().path,origin.path);
  assert.equal(memberMount().node.key,origin.node.key);assert.equal(posts(h).length,0);
  assert.equal(h.find(h.tree(),n=>n.props.className==='section cast-section').props.hidden,false);
});
