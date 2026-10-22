const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {approvedVideoPoster,WorkCoverImage}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/app-image-presentation');
const cases=[
 {work:'recvxyOz5XdFJL',video:'ArmDp-zijuc',song:'Super Shy',src:'/artist/newjeans/figma-display/media-recvxyOz5XdFJL-ec9a05cc78.jpg',sha:'ec9a05cc78b4b1feb98f6f51c2e178b58b788656ab2d1f5ea95ef27b96c0f4ff',label:'MV 预览图（Bugs 来源）',manifest:'data/newjeans-image-sources.json',origin:'https://image.bugsm.co.kr/mvhd/images/1280/6180/618075.jpg'},
 {work:'recvxyOz5XEvYC',video:'7HDeem-JaSY',song:'Queencard',src:'/artist/idle/display/media-recvxyOz5XEvYC--media-recvxyOz5XEvYC.jpg',sha:'96c1929b4ee1348930a8a1e408eba2134c35dfd0cc4a9512762b1a119350321c',label:'官方 MV 视频封面',manifest:'data/idle-design-public.json',origin:'https://img.youtube.com/vi/7HDeem-JaSY/maxresdefault.jpg'},
 {work:'recvxyOz5XYOoF',video:'_ZAgIHmHLdc',song:'OMG',src:'/artist/newjeans/figma-display/media-recvxyOz5XYOoF-342d3e0f6c.jpg',sha:'342d3e0f6c60c74b24f8fca7abedfe42c27429f771aac445d950433fdfe3182c',label:'MV 预览图（Bugs 来源）',manifest:'data/newjeans-image-sources.json',origin:'https://image.bugsm.co.kr/mvhd/images/1280/6141/614199.jpg'},
 {work:'recvxyH5pzL7oj',video:'RknLOnO6ZtI',song:'DANG! (hocus pocus)',src:'/artist/billlie/display/billlie-recvxyH5pzL7oj-mv-RknLOnO6ZtI.jpg',sha:'aef33a36396dfcaaf8d40708a25547a8872c798487d9250cdf3e41369af25d11',label:'MV 预览图',manifest:'data/billlie-figma-asset-manifest.json',origin:'research/video-thumbnails/billlie-recvxyH5pzL7oj-mv-RknLOnO6ZtI.jpg'},
];
test('retained poster pixels and original provenance are pinned to exact work/video/MV',()=>{
 for(const c of cases){
  const poster=approvedVideoPoster(c.work,c.video,'mv');assert.equal(poster.src,c.src);assert.equal(poster.label,c.label);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+c.src)).digest('hex'),c.sha);
  const evidence=fs.readFileSync(c.manifest,'utf8');assert.ok(evidence.includes(c.work));assert.ok(evidence.includes(c.origin));
  assert.equal(approvedVideoPoster(c.work,c.video,'stage'),null);assert.equal(approvedVideoPoster(c.work,'wrong','mv'),null);assert.equal(approvedVideoPoster('wrong',c.video,'mv'),null);assert.equal(approvedVideoPoster(c.work,null,'mv'),null);
 }
 assert.equal(approvedVideoPoster('recvxyOz5XJ7W3','wrong-video','mv'),null);
});
test('OMG and DANG provenance joins the precise work, video and retained bytes',()=>{
 const omg=cases.find(c=>c.song==='OMG'),dang=cases.find(c=>c.work==='recvxyH5pzL7oj');
 const source=JSON.parse(fs.readFileSync(omg.manifest,'utf8')).assets.find(a=>a.key==='media-'+omg.work);
 assert.equal(source.sourceUrl,'https://www.youtube.com/watch?v='+omg.video);
 assert.equal(source.sourcePhotoUrl,omg.origin);assert.deepEqual(source.relations.media,[omg.work]);
 assert.equal(source.display.path,'public'+omg.src);assert.equal(source.display.sha256,omg.sha);
 assert.equal(source.display.width,1280);assert.equal(source.display.height,720);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source.original.path)).digest('hex'),source.original.sha256);
 const asset=JSON.parse(fs.readFileSync(dang.manifest,'utf8')).find(a=>a.workId===dang.work&&a.kind==='mv');
 assert.equal(asset.videoId,dang.video);assert.equal(asset.src,dang.src);assert.equal(asset.sourceLocalFile,dang.origin);
 assert.equal(asset.sha256,dang.sha);assert.equal(asset.sourceSha256,dang.sha);assert.equal(asset.conversion,'original bytes');
 const catalog=JSON.parse(fs.readFileSync('data/billlie-figma-catalog.json','utf8'));
 const entries=Object.values(catalog).filter(Array.isArray).flat();
 const work=entries.find(w=>w.id===dang.work);
 assert.equal(work.mv.id,dang.video);assert.equal(work.mv.url,'https://www.youtube.com/watch?v='+dang.video);assert.equal(work.mv.src,dang.src);
 assert.equal(approvedVideoPoster(dang.work,'2dvSXkQ0MO8','mv'),null);
 assert.equal(approvedVideoPoster(dang.work,'2dvSXkQ0MO8','stage'),null);
 assert.equal(approvedVideoPoster('recvxyOz5XKqG0','unverified','mv'),null);
});
test('shared work covers use local original pixels with truthful labels',()=>{
 for(const c of cases){const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{id:c.work,url:'https://www.youtube.com/watch?v='+c.video,song:c.song,name:c.song}}));assert.ok(html.includes(c.src));assert.ok(html.includes(c.label));assert.doesNotMatch(html,/i.ytimg/);assert.match(html,/object-fit:contain/);}
});
function harness(){const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);}
test('actual main-player integration keeps video identities and stage isolation without writes',()=>{
 for(const c of cases){const h=harness();h.wp.work={...h.wp.work,id:c.work,url:'https://www.youtube.com/watch?v='+c.video,song:c.song};let p=h.find(h.render(),n=>n.props.workId===c.work&&'posterSrc'in n.props);assert.equal(p.props.posterSrc,c.src);assert.equal(p.props.posterLabel,c.label);assert.equal(p.props.videoId,c.video);h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();p=h.find(h.render(),n=>n.props.workId===c.work&&'posterSrc'in n.props);assert.equal(p.props.posterSrc,undefined);assert.equal(h.requests.length,0);}
});
