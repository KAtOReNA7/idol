const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {approvedVideoPoster,katseyeVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const manifest=JSON.parse(fs.readFileSync('evidence/day19-unis-kep1er-video-posters.json'));
const runtime=JSON.parse(fs.readFileSync('data/day19-unis-kep1er-video-posters.json')).entries;
const live=JSON.parse(fs.readFileSync('evidence/day19-unis-kep1er-video-previews/live-tuples.json'));
const stages=JSON.parse(fs.readFileSync('data/stage-videos.json'));
const deltaManifest=JSON.parse(fs.readFileSync('evidence/day19-kcon-stage-photos.json'));
const deltaRuntime=JSON.parse(fs.readFileSync('data/day19-kcon-stage-photos.json')).entries;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const tuple=p=>[p.workId,p.videoId,p.view].join(':');
function dimensions(b){
 if(b.readUInt16BE(0)===0xffd8){let o=2;while(o<b.length){assert.equal(b[o++],255);while(b[o]===255)o++;const m=b[o++],n=b.readUInt16BE(o);if([192,193,194].includes(m))return[b.readUInt16BE(o+5),b.readUInt16BE(o+3)];o+=n;}throw Error('JPEG dimensions missing');}
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
 for(let o=12;o+8<=b.length;){const kind=b.toString('ascii',o,o+4),size=b.readUInt32LE(o+4),d=o+8;
  if(kind==='VP8X')return[b.readUIntLE(d+4,3)+1,b.readUIntLE(d+7,3)+1];
  if(kind==='VP8 '){assert.equal(b.toString('hex',d+3,d+6),'9d012a');return[b.readUInt16LE(d+6)&16383,b.readUInt16LE(d+8)&16383];}
  if(kind==='VP8L'){assert.equal(b[d],0x2f);const n=b.readUInt32LE(d+1);return[(n&16383)+1,((n>>>14)&16383)+1];}
  o=d+size+(size&1);
 }throw Error('WebP dimensions missing');
}
function harness(){const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);}
function player(h,id){return h.find(h.render(),n=>n.props.workId===id&&'posterSrc'in n.props);}
for(const p of [...manifest.entries,...deltaManifest.entries])test('reviewed original selects only exact tuple '+tuple(p),()=>{
 const r=[...runtime,...deltaRuntime].find(x=>tuple(x)===tuple(p));assert.ok(r);assert.deepEqual(Object.keys(r).sort(),['workId','videoId','view','src','label'].sort());
 assert.deepEqual(approvedVideoPoster(p.workId,p.videoId,p.view),r);
 for(const args of [[p.workId,p.videoId,p.view==='mv'?'stage':'mv'],['wrong-work',p.videoId,p.view],[p.workId,'wrong-video',p.view],[p.workId,null,p.view]])assert.equal(approvedVideoPoster(...args),null);
 const w=live.works.find(x=>x.id===p.workId);assert.ok(w);assert.equal(p.view==='mv'?new URL(w.url).searchParams.get('v'):w.stage.videoId,p.videoId);
 const bytes=fs.readFileSync(p.repositoryFile);assert.equal(p.repositoryFile,'public'+p.src);assert.equal(bytes.length,p.bytes);assert.equal(sha(bytes),p.sha256);assert.deepEqual(dimensions(bytes),[p.width,p.height]);assert.equal(p.originalBytesPreserved,true);
 assert.ok(!/高清|原图|YouTube.*缩略图/.test(p.label));assert.ok(p.src.startsWith('/artist/unis/video-posters/')||p.src.startsWith('/artist/kep1er/video-posters/'));
 if(p.view==='mv'){
  const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{id:p.workId,url:w.url,song:p.title,name:p.title}}));assert.ok(html.includes(p.src));assert.ok(html.includes(p.label.replaceAll("&","&amp;")));assert.match(html,/object-fit:contain/);assert.doesNotMatch(html,/i.ytimg/);
 }
 const h=harness();h.wp.work={...h.wp.work,id:p.workId,url:w.url,song:p.title,stage:stages[p.workId]??null};const original=JSON.stringify(h.wp.work);
 if(p.view==='stage')h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();
 const selected=player(h,p.workId);assert.equal(selected.props.posterSrc,p.src);assert.equal(selected.props.videoId,p.videoId);assert.equal(selected.props.posterFit,'contain');assert.equal(selected.props.posterLabel,p.label);assert.equal(selected.props.url,p.view==='mv'?w.url:stages[p.workId].url);
 assert.equal(JSON.stringify(h.wp.work),original,'presentation must not mutate links, scores, notes, watched or stage binding');assert.equal(h.requests.length,0,'poster render does not perform requests');
});
test('all six stage posters and retained KATSEYE reject clips, missing stage and mismatched identity',()=>{
 const cases=[...runtime.filter(p=>p.view==='stage'),...deltaRuntime,{workId:'rec28ldfRTrPC7',videoId:'FkhlaDkbbas',view:'stage',...katseyeVideoPoster('rec28ldfRTrPC7','FkhlaDkbbas','stage')}];
 assert.equal(cases.length,7);
 for(const p of cases){
  const h=harness(),originalStage={...h.wp.work.stage,videoId:p.videoId,url:'https://www.youtube.com/watch?v='+p.videoId,clip:undefined};
  h.wp.work={...h.wp.work,id:p.workId,stage:originalStage};h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();assert.equal(player(h,p.workId).props.posterSrc,p.src);
  for(const stage of [
   {...originalStage,clip:{startSeconds:10,endSeconds:20,sourceDurationSeconds:300}},
   {...originalStage,videoId:'abcdefghijk'},
   {...originalStage,url:'https://www.youtube.com/watch?v=abcdefghijk'},
   {...originalStage,videoId:'abcdefghijk',url:'https://www.youtube.com/watch?v=abcdefghijk'},
   null,
  ]){h.wp.work={...h.wp.work,stage};const before=JSON.stringify(h.wp.work),selected=player(h,p.workId);if(selected){assert.equal(selected.props.posterSrc,undefined);assert.equal(selected.props.posterLabel,undefined);}assert.equal(JSON.stringify(h.wp.work),before);}
  h.wp.work={...h.wp.work,id:'wrong-work',stage:originalStage};assert.equal(player(h,'wrong-work').props.posterSrc,undefined);assert.equal(h.requests.length,0);
 }
});
test('25 original previews plus two reviewed KCON photos leave 13 live tuples unmatched',()=>{
 assert.equal(runtime.length,25);assert.equal(runtime.filter(p=>p.view==='mv').length,21);assert.equal(runtime.filter(p=>p.view==='stage').length,4);assert.equal(new Set(runtime.map(tuple)).size,25);
 let untouched=0;for(const w of live.works){for(const [view,id] of [['mv',new URL(w.url).searchParams.get('v')],['stage',w.stage?.videoId]]){if(!id)continue;const approved=[...runtime,...deltaRuntime].find(p=>p.workId===w.id&&p.videoId===id&&p.view===view);if(!approved){assert.equal(approvedVideoPoster(w.id,id,view),null);untouched++;}}}assert.equal(untouched,13);
 assert.equal(manifest.entries.reduce((s,p)=>s+p.bytes,0),1867648);
});
test('retained three 1280 originals still outrank lower resolution legacy previews',()=>{
 const retained=JSON.parse(fs.readFileSync('evidence/day19-retained-hd-video-posters.json')).entries;
 assert.equal(retained.length,3);for(const p of retained){const chosen=approvedVideoPoster(p.workId,p.videoId,'mv');assert.equal(chosen.src,p.src);assert.equal(chosen.label,'官方 MV 视频封面');const bytes=fs.readFileSync(p.file);assert.equal(sha(bytes),p.sha256);assert.deepEqual(dimensions(bytes),[1280,720]);}
});
test('runtime projection and browser import graph exclude provenance and private fields',()=>{
 assert.deepEqual(runtime,manifest.entries.map(p=>Object.fromEntries(['workId','videoId','view','src','label'].map(k=>[k,p[k]]))));
 const runtimeText=JSON.stringify(runtime);assert.doesNotMatch(runtimeText,/https?:|sourcePage|sourceImage|sha256|evidence|workspace|rating|watched|memory|scoreBinding|api\/posters/);
 const source=fs.readFileSync('lib/idol/approved-video-poster.ts','utf8');assert.doesNotMatch(source,/evidence\//);
 const esbuild=require('esbuild');const result=esbuild.buildSync({entryPoints:['lib/idol/approved-video-poster.ts'],bundle:true,write:false,platform:'browser',format:'esm',metafile:true,logLevel:'silent'});
 assert.ok(Object.keys(result.metafile.inputs).includes('data/day19-unis-kep1er-video-posters.json'));assert.ok(Object.keys(result.metafile.inputs).every(p=>!p.startsWith('evidence/')));
 const bundle=result.outputFiles[0].text;for(const p of manifest.entries){assert.ok(!bundle.includes(p.sourcePageUrl));assert.ok(!bundle.includes(p.sourceImageUrl));assert.ok(!bundle.includes(p.sha256));}
 assert.doesNotMatch(JSON.stringify(manifest),/sourceConversation|sourceMessage|\/workspace\/|"score"|"note"|"watched"/);
 for(const p of manifest.entries){if(p.portableRenderedEvidence){const e=p.portableRenderedEvidence;assert.equal(sha(fs.readFileSync(e.path)),e.sha256);assert.equal(e.notRawCapture,true);}}
});

test('two KCON photos preserve exact source evidence and truthful same-event labels',()=>{assert.equal(deltaRuntime.length,2);assert.equal(deltaManifest.entries.reduce((n,p)=>n+p.bytes,0),311296);for(const p of deltaManifest.entries){assert.equal(p.view,'stage');assert.equal(p.label,'同场逐曲舞台照（Ray 来源）');assert.equal(sha(fs.readFileSync(p.sourcePagePath)),p.sourceSnapshotSha256);assert.equal(sha(fs.readFileSync(p.nativeMetadataVerification.metadataEvidencePath)),p.nativeMetadataVerification.metadataEvidenceSha256);}assert.doesNotMatch(JSON.stringify(deltaRuntime),/https?:|sha256|sourcePage|evidence|workspace/);});
