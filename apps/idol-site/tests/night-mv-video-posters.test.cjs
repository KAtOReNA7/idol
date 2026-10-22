const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {approvedVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const manifest=JSON.parse(fs.readFileSync('evidence/night-mv-video-posters.json','utf8'));
const runtime=JSON.parse(fs.readFileSync('data/night-mv-video-posters.json','utf8')).entries;
const snapshot=JSON.parse(fs.readFileSync('data/snapshot.json','utf8')).tables.works.records;
const expected=[
  [
    "recvxyOz5XfdOm",
    "6Ycn9qZK09I",
    "2283688ea94b3394fbbae7f90f082a63cdb297fd9559f476e1642203e87b1e00",
    1101376,
    1920,
    1080
  ],
  [
    "recvxyOz5XyrkB",
    "7UecFm_bSTU",
    "f6782572aa849b6d066f0e2192db9a009debb807830ad6fa5ffd81b4d919eebf",
    41482,
    500,
    282
  ],
  [
    "recvxyOz5XJH3G",
    "Y1Lah0BM0KQ",
    "f2a30f6bfe099dd93467e63a3198ab0c2cc2c4745d46a27dc527e57239dca7fc",
    83461,
    500,
    282
  ],
  [
    "recvxyOz5Xj4GM",
    "hLvWy2b857I",
    "f81809823cca3cd76af25affec75200ba71f4ff9bffa3967a985f541244ef521",
    59112,
    500,
    282
  ],
  [
    "recvxDMFHNjwxB",
    "L7spCJxloLY",
    "e84776b447f29cb6e892ce09eb2d84f392f7be53a025ada4bb9a78496552c3a2",
    35127,
    500,
    282
  ],
  [
    "recvxyOz5XDQVh",
    "fE2h3lGlOsk",
    "ae29d2dbe55f4270050032911689410db15af6c5b8a229c06b0e090a762dc19d",
    77655,
    640,
    480
  ],
  [
    "recvxyOz5XEqgh",
    "pNfTK39k55U",
    "c6e3cfe1a5625855d2fdf7b9a3008ff0aa1c7ff6f4bcd1ce3d0e7daf467e28a1",
    78797,
    640,
    480
  ],
  [
    "recvxyHuKMKPod",
    "nFYwcndNuOY",
    "f260b0ed50281c7ab61050b7f2b16e36c4ada4a912576a19fa552392fcaebec9",
    55410,
    500,
    282
  ],
  [
    "recvxyHrxVovnG",
    "ZeerrnuLi5E",
    "cfe8b9632d1352870a3f98180a189ab9410a88c195941c6111ec54bb2bfe75c5",
    81961,
    500,
    282
  ]
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function jpegDimensions(bytes){assert.equal(bytes.readUInt16BE(0),0xffd8);let offset=2;while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++];const length=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return [bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=length;}throw Error('JPEG dimensions missing');}
function harness(){const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);}
for(const [workId,videoId,hash,bytes,width,height] of expected)test(`night MV ${workId}: exact catalog identity, original bytes, card and player isolation`,()=>{
 const a=manifest.assets.find(x=>x.workId===workId),r=runtime.find(x=>x.workId===workId);
 assert.equal(a.videoId,videoId);assert.equal(a.kind,'mv');assert.equal(a.view,'mv');assert.equal(a.eligible,true);
 assert.equal(a.youtubeUrl,'https://www.youtube.com/watch?v='+videoId);
 const work=snapshot.find(x=>x.recordId===workId);assert.ok(work);assert.equal(work.fields.fldhBWXBZE[0].url,a.youtubeUrl);assert.equal(work.fields.fld6ahf75U,a.song);
 assert.equal(a.repositoryFile,'public'+a.src);assert.equal(a.sha256,hash);assert.equal(a.bytes,bytes);assert.deepEqual([a.width,a.height],[width,height]);
 const original=fs.readFileSync(a.repositoryFile);assert.equal(original.length,bytes);assert.equal(sha(original),hash);assert.deepEqual(jpegDimensions(original),[width,height]);
 assert.deepEqual(Object.keys(r).sort(),['workId','videoId','view','src','label'].sort());assert.equal(r.src,a.src);
 const label=a.sourcePage.includes('jype.com')?'官方 MV 视频封面':'MV 预览图（Bugs 来源）';assert.equal(r.label,label);assert.equal(a.label,label);
 assert.deepEqual(approvedVideoPoster(workId,videoId,'mv'),r);
 for(const args of [[workId,videoId,'stage'],[workId,'wrong-video','mv'],['wrong-work',videoId,'mv'],[workId,null,'mv']])assert.equal(approvedVideoPoster(...args),null);
 const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{id:workId,url:a.youtubeUrl,song:a.song,name:a.song}}));assert.ok(html.includes(a.src));assert.ok(html.includes(label));assert.match(html,/object-fit:contain/);assert.doesNotMatch(html,/i.ytimg/);
 const h=harness();h.wp.work={...h.wp.work,id:workId,url:a.youtubeUrl,song:a.song};const before=JSON.stringify(h.wp.work);
 let p=h.find(h.render(),n=>n.props.workId===workId&&'posterSrc'in n.props);assert.equal(p.props.posterSrc,a.src);assert.equal(p.props.posterFit,'contain');assert.equal(p.props.posterLabel,label);assert.equal(p.props.videoId,videoId);
 h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();p=h.find(h.render(),n=>n.props.workId===workId&&'posterSrc'in n.props);assert.equal(p.props.posterSrc,undefined);assert.equal(p.props.posterLabel,undefined);
 assert.equal(h.requests.length,0);assert.equal(JSON.stringify(h.wp.work),before);
});
test('night batch stays bounded and excluded O.R.B has no mapping',()=>{
 assert.equal(manifest.assets.length,9);assert.equal(runtime.length,9);assert.equal(manifest.assets.reduce((n,a)=>n+a.bytes,0),1614381);
 assert.equal(runtime.filter(x=>x.label==='官方 MV 视频封面').length,3);assert.equal(runtime.filter(x=>x.label==='MV 预览图（Bugs 来源）').length,6);
 assert.doesNotMatch(JSON.stringify(manifest),/\/workspace\/|\/home\/|localFile/);
 for(const a of manifest.assets){assert.ok(a.versionEvidence.length);assert.ok(a.limitations.length);assert.ok(a.sourcePage.startsWith('https://'));assert.ok(a.sourceImage.startsWith('https://'));}
 const hold=manifest.hold[0];assert.equal(hold.eligible,false);assert.equal(approvedVideoPoster(hold.workId,hold.videoId,'mv'),null);
});
test('preexisting approved entries remain byte-for-byte unchanged',()=>{
 const resolver=fs.readFileSync('lib/idol/approved-video-poster.ts','utf8');
 const retained=resolver.split('const retainedVideoPosters=')[1].split('] as const;')[0];assert.equal(sha(retained),'d0c1ed85c100c80e650777217dd899942c9b7030193d87ec2d50300750f3374d');
 // Only these three independently verified 1280×720 originals were added on day 19.
 const day19Additions=[
  {workId:'recvxyOz5X93Kc',videoId:'fCO7f0SmrDc',view:'mv',src:'/artist/idle/display/media-recvxyOz5X93Kc--media-recvxyOz5X93Kc.jpg',label:'官方 MV 视频封面'},
  {workId:'recvxyOz5XuYef',videoId:'Jh4QFaPmdss',view:'mv',src:'/artist/idle/display/media-recvxyOz5XuYef--media-recvxyOz5XuYef.jpg',label:'官方 MV 视频封面'},
  {workId:'rec28ldfRTrCjG',videoId:'2tda_TCjz8w',view:'mv',src:'/artist/triples/approved-design/mv-girls-never-die.jpg',label:'官方 MV 视频封面'},
 ];
 const lines=retained.split('\n'),isAddition=line=>day19Additions.some(p=>line.includes(p.workId));
 assert.deepEqual(lines.filter(isAddition).map(line=>JSON.parse(line.trim().replace(/,$/,''))),day19Additions);
 assert.equal(sha(lines.filter(line=>!isAddition(line)).join('\n')),'ff152dca90ccbc613d596781ee38d0704e6e9426e2b64ca684e2cecb3c2a1f1f','all six earlier retained entries remain byte-for-byte unchanged');
 const verified=JSON.parse(fs.readFileSync('evidence/day19-retained-hd-video-posters.json')).entries;
 assert.deepEqual(day19Additions.map(p=>{const e=verified.find(e=>e.workId===p.workId);assert.ok(e);assert.equal(e.videoId,p.videoId);assert.equal(e.src,p.src);return e.workId;}),day19Additions.map(p=>p.workId));
 assert.equal(sha(fs.readFileSync('data/saymyname-video-posters.json')),'9c9f636fbd05cc661e4b5b322a79b207e4c295cf84f06b7a924e792c8974e21a');
});
test('real player contains 4:3 full image inside its fixed box',()=>{
 const ts=require('typescript'),e={};const source=fs.readFileSync('components/work-video-player.tsx','utf8');
 const code=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,exports){'+code+'})')(require,e);
 for(const a of manifest.assets.filter(x=>x.width===640)){
  const html=renderToStaticMarkup(React.createElement(e.WorkVideoPlayer,{workId:a.workId,view:'mv',url:a.youtubeUrl,videoId:a.videoId,embedUrl:null,title:a.song,posterSrc:a.src,posterLabel:a.label,posterFit:'contain'}));
  for(const css of ['position:absolute','inset:0','width:100%','height:100%','max-width:100%','max-height:100%','object-fit:contain'])assert.ok(html.includes(css),css);
  assert.ok(html.includes(a.src));assert.doesNotMatch(html,/object-fit:cover/);
 }
});
