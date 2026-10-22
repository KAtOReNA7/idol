const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {approvedVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const manifest=JSON.parse(fs.readFileSync('evidence/fromis9-video-posters.json','utf8'));
const expected=[
 ['recvxyOz5XJ7W3','HM6UpQZvbhY','594651','6bcc9b8cd6e1a98b7d6bbaaf8bd8421060b313e2599f00f90c266073436b4613',52911],
 ['recvxyOz5XKR8M','0LiQp7y8Wwc','626868','51e7a83c7a51769c64f42655c16c9fad72061a89503c006a7155d623d109c664',80102],
];
function jpegDimensions(bytes){assert.equal(bytes.readUInt16BE(0),0xffd8);let offset=2;while(offset<bytes.length){assert.equal(bytes[offset++],0xff);while(bytes[offset]===0xff)offset++;const marker=bytes[offset++];const length=bytes.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker))return [bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];offset+=length;}throw Error('JPEG dimensions missing');}
test('fromis_9 original Bugs JPEG bytes and exact MV provenance are pinned',()=>{
 assert.equal(manifest.assets.length,2);
 for(const [workId,videoId,bugsId,sha,bytes] of expected){
  const a=manifest.assets.find(a=>a.workId===workId);assert.equal(a.videoId,videoId);assert.equal(a.kind,'mv');assert.equal(a.view,'mv');
  assert.equal(a.youtubeUrl,'https://www.youtube.com/watch?v='+videoId);assert.equal(a.sourcePage,'https://music.bugs.co.kr/mv/'+bugsId);
  assert.equal(a.sourceImage,`https://image.bugsm.co.kr/mvhd/images/500/${bugsId.slice(0,4)}/${bugsId}.jpg`);
  assert.equal(a.sha256,sha);assert.equal(a.bytes,bytes);assert.equal(a.width,500);assert.equal(a.height,282);
  const file=fs.readFileSync(a.repositoryFile);assert.equal(file.length,bytes);assert.equal(crypto.createHash('sha256').update(file).digest('hex'),sha);assert.deepEqual(jpegDimensions(file),[500,282]);
  const poster=approvedVideoPoster(workId,videoId,'mv');assert.equal(poster.src,a.src);assert.equal(poster.label,'MV 预览图（Bugs 来源）');assert.equal(a.label,poster.label);assert.equal(a.repositoryFile,'public'+a.src);
  for(const args of [[workId,videoId,'stage'],[workId,'wrong-video','mv'],['wrong-work',videoId,'mv'],[workId,null,'mv']])assert.equal(approvedVideoPoster(...args),null);
 }
 assert.doesNotMatch(JSON.stringify(manifest),/\/workspace\/|\/home\/|localFile/);
});
test('fromis_9 shared covers display original local pixels contained with truthful label',()=>{
 for(const a of manifest.assets){const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{id:a.workId,url:a.youtubeUrl,song:a.song,name:a.song}}));assert.ok(html.includes(a.src));assert.ok(html.includes(a.label));assert.match(html,/object-fit:contain/);assert.doesNotMatch(html,/i.ytimg|官方视频封面/);}
});
function harness(){const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);}
test('fromis_9 actual main player contains exact MV poster, leaves stage untouched and sends no writes',()=>{
 for(const a of manifest.assets){const h=harness();h.wp.work={...h.wp.work,id:a.workId,url:a.youtubeUrl,song:a.song};let player=h.find(h.render(),n=>n.props.workId===a.workId&&'posterSrc'in n.props);assert.equal(player.props.posterSrc,a.src);assert.equal(player.props.videoId,a.videoId);assert.equal(player.props.posterFit,'contain');assert.equal(player.props.posterLabel,a.label);h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();player=h.find(h.render(),n=>n.props.workId===a.workId&&'posterSrc'in n.props);assert.equal(player.props.posterSrc,undefined);assert.equal(player.props.posterLabel,undefined);assert.equal(h.requests.length,0);}
});
