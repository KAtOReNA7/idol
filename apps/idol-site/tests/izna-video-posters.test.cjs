const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),path=require('node:path');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {approvedVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const design=require('../data/izna-editorial.json'),assets=require('../data/izna-assets.json'),{entries}=require('../data/izna-video-posters.json');

test('four notebook posters reuse the exact already-reviewed izna originals and native dimensions',()=>{
 const illustrated=design.works.filter(w=>w.previewState==='verified_publisher_exact_preview');
 assert.equal(entries.length,4);assert.equal(illustrated.length,4);
 assert.equal(new Set(entries.map(p=>[p.workId,p.videoId,p.view].join(':'))).size,4);
 for(const work of illustrated){
  const poster=entries.find(p=>p.workId===work.id&&p.videoId===work.videoId&&p.view==='mv');assert.ok(poster);
  const binding=assets.find(a=>a.assetKey===work.image.assetKey);assert.ok(binding);
  assert.equal(work.type,'MV');assert.equal(work.image.qualityScope,'publisher_exact_video_preview');
  assert.equal(work.image.usage,'video_preview');assert.equal(poster.src,binding.url);
  for(const field of ['sha256','bytes','width','height'])assert.equal(work.image[field],binding[field]);
  assert.deepEqual(poster.intrinsicSize,{width:binding.width,height:binding.height});
  const bytes=fs.readFileSync('public'+poster.src);
  assert.equal(bytes.length,binding.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),binding.sha256);
  assert.equal(poster.label,'发布者视频预览图');
  assert.deepEqual(approvedVideoPoster(work.id,work.videoId,'mv'),poster);
 }
});

test('all eleven unillustrated slots, mismatched works and alternate video versions remain unmatched',()=>{
 const missing=design.works.filter(w=>!w.image);assert.equal(missing.length,11);
 for(const work of missing)assert.equal(approvedVideoPoster(work.id,work.videoId,work.type==='MV'?'mv':'stage'),null);
 for(const p of entries){
  for(const args of [[p.workId,p.videoId,'stage'],['recWrong',p.videoId,'mv'],[p.workId,'aaaaaaaaaaa','mv'],[p.workId,null,'mv']])assert.equal(approvedVideoPoster(...args),null);
  for(const other of entries.filter(x=>x!==p))assert.equal(approvedVideoPoster(p.workId,other.videoId,'mv'),null);
 }
});

test('shared work cards display the verified local image with truthful labeling and a size cap',()=>{
 for(const p of entries){
  const work={id:p.workId,url:'https://www.youtube.com/watch?v='+p.videoId,song:'合成作品',name:'合成作品'};
  const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work}));
  assert.ok(html.includes(p.src));assert.match(html,/发布者视频预览图/);assert.doesNotMatch(html,/i\.ytimg|<iframe/);
  assert.match(html,/object-fit:contain/);assert.ok(html.includes('max-width:'+p.intrinsicSize.width+'px'));
  const mismatch=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{...work,id:'recWrong'}}));
  assert.match(mismatch,/i\.ytimg/);assert.ok(!mismatch.includes(p.src));
 }
});

function mainHarness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];
 return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
test('the actual shared work detail forwards the matching poster and keeps stage identity and saving untouched',()=>{
 for(const p of entries){
  const h=mainHarness();h.wp.work={...h.wp.work,id:p.workId,url:'https://www.youtube.com/watch?v='+p.videoId,groupIds:[design.group.id]};
  const before=JSON.stringify(h.wp.work);
  let player=h.find(h.render(),n=>n.props.workId===p.workId&&'posterSrc'in n.props);assert.ok(player);
  assert.equal(player.props.posterSrc,p.src);assert.equal(player.props.videoId,p.videoId);
  assert.equal(player.props.posterLabel,p.label);assert.equal(player.props.posterFit,'contain');assert.deepEqual(player.props.posterSize,p.intrinsicSize);
  h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();
  player=h.find(h.render(),n=>n.props.workId===p.workId&&'posterSrc'in n.props);
  assert.equal(player.props.posterSrc,undefined);assert.equal(player.props.posterSize,undefined);
  assert.equal(JSON.stringify(h.wp.work),before);assert.equal(h.requests.length,0);
 }
});
