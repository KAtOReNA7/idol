const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),path=require('node:path');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const api=require('./helpers/image-dependency-loader.cjs').imageDependency('@/lib/idol/approved-video-poster');
const runtime=require('../data/mv-public-media.json'),evidence=require('../../../docs/codex/mv-identity-asset-audit-20261025.json');
const {approvedVideoPoster,WorkCoverImage,MvIdentityPhoto}=api;
test('all catalog and editorial covers are exact original bytes, with unique video bindings',()=>{
 assert.equal(runtime.covers.length,628);assert.equal(new Set(runtime.covers.map(p=>p.videoId)).size,628);
 for(const p of [...runtime.covers,...runtime.portraits]){const e=[...evidence.covers,...evidence.identityImages].find(e=>e.src===p.src&&(!p.memberId||e.memberId===p.memberId&&e.workId===p.workId));assert(e);const b=fs.readFileSync('public'+p.src);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),e.sha256);assert.equal(b.length,e.byteLength);assert.equal(p.width,e.width);assert.equal(p.height,e.height);assert.deepEqual(p.sourceCrop,e.sourceCrop);}
});
test('every current work cover uses its precise video; another work, video or stage does not inherit it',()=>{
 for(const p of runtime.covers.filter(p=>p.workId)){const poster=approvedVideoPoster(p.workId,p.videoId,'mv');assert.equal(poster.src,p.src);assert.equal(poster.fit,'cover');assert.equal(poster.label,p.label);assert.equal(approvedVideoPoster('wrong-work',p.videoId,'mv'),null);assert.equal(approvedVideoPoster(p.workId,'wrong-video','mv'),null);assert.equal(approvedVideoPoster(p.workId,null,'mv'),null);assert.notEqual(approvedVideoPoster(p.workId,p.videoId,'stage')?.src,p.src);const html=renderToStaticMarkup(React.createElement(WorkCoverImage,{work:{id:p.workId,url:'https://www.youtube.com/watch?v='+p.videoId,name:'Fixture'}}));assert(html.includes(p.src));assert.match(html,/object-fit:cover/);assert.doesNotMatch(html,/<iframe|i\.ytimg/);}
});
test('MV identity pictures require exact work, member and video and never fabricate a missing picture',()=>{
 for(const p of runtime.portraits){const work={id:p.workId,url:'https://www.youtube.com/watch?v='+p.videoId};const html=renderToStaticMarkup(React.createElement(MvIdentityPhoto,{work,memberId:p.memberId,label:'Fixture'}));assert(html.includes(p.src));assert(html.includes(p.label));for(const props of [{work:{...work,id:'wrong'}},{work:{...work,url:'https://youtu.be/XXXXXXXXXXX'}},{memberId:'wrong'}]){const mismatch=renderToStaticMarkup(React.createElement(MvIdentityPhoto,{work,memberId:p.memberId,label:'Fixture',...props}));assert.match(mismatch,/认人图待补/);assert(!mismatch.includes(p.src));assert.match(mismatch,/保留成员评分/);}}
 assert.doesNotMatch(JSON.stringify(runtime),/api\/media|score|stylingScore|memory|note|file_token/);
});
test('verified historical stage maps are still selected by exact tuple',()=>{
 for(const name of ['day19-unis-kep1er','day19-kcon-stage-photos','udtt','vcha','spia','tracer','geenius','newjeans','vvup']){
  const file='data/'+name+(name.endsWith('photos')?'': '-video-posters')+'.json';if(!fs.existsSync(file))continue;
  for(const p of JSON.parse(fs.readFileSync(file)).entries.filter(p=>p.view==='stage')){assert.equal(approvedVideoPoster(p.workId,p.videoId,'stage').src,p.src);assert.equal(approvedVideoPoster('wrong',p.videoId,'stage'),null);}
 }
});
function harness(){const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);}
test('actual shared player forwards the current cover and exact video without changing scores or stage identity',()=>{
 const selected=['rec28ldfRTrPC7','rec28ldfRTrPxZ','recvxyOz5XdFJL','rec28ldfRTrCjG','recvxyOz5XJ7W3'];
 for(const id of selected){const p=runtime.covers.find(p=>p.workId===id);assert(p);const h=harness();h.wp.work={...h.wp.work,id,url:'https://www.youtube.com/watch?v='+p.videoId};const before=JSON.stringify(h.wp.work);let player=h.find(h.render(),n=>n.props.workId===id&&'posterSrc'in n.props);assert.equal(player.props.posterSrc,p.src);assert.equal(player.props.videoId,p.videoId);assert.equal(player.props.posterFit,'cover');h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();player=h.find(h.render(),n=>n.props.workId===id&&'posterSrc'in n.props);assert.notEqual(player.props.posterSrc,p.src);assert.equal(JSON.stringify(h.wp.work),before);assert.equal(h.requests.length,0);}
});
