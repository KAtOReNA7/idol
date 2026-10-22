const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const source=esbuild.buildSync({stdin:{contents:`export * from './lib/idol/wooah-timeline'; export {design} from './lib/idol/wooah-editorial'; export {default as canonical} from './data/artist-timelines/wooah.json'; export {WooahTimeline} from './components/wooah/timeline';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/*','react-dom','react-dom/*'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};
vm.runInThisContext('(function(require,module,exports){'+source+'\n})')(require,mod,mod.exports);
const api=mod.exports;
const expected={
 'e-wooah-exclamation-music-release':['recvxyH5pzlG0W','X2FB37r4Oyw'],
 'e-wooah-wish-release':['recvxyH5pzTgrL','UE--H12gl2I'],
 'e-wooah-catch-the-stars-release':['recvxyH5pzzH06','g5B6zCSMrcc'],
 'e-wooah-joy-digital-release':['recvxyH5pz4vBM','_X9720wjipE'],
 'e-wooah-pit-a-pat-release':['recvxyH5pzAava','KkyUE7TcBcs'],
};
function nodes(node,result=[]){if(node&&typeof node==='object'){result.push(node);React.Children.forEach(node.props?.children,child=>nodes(child,result));}return result;}

test('five existing release events reach exact MV identities without changing canonical facts or release dates',()=>{
 const before=JSON.stringify(api.canonical);
 const events=api.wooahTimelineEvents();
 assert.equal(events.length,12);
 assert.deepEqual(events.map(e=>e.eventDate.value),events.map(e=>e.eventDate.value).sort());
 assert.equal(api.wooahTimelineDate(events.find(e=>e.id==='e-wooah-formal-debut')).value,'2020-05-13');
 assert.equal(api.wooahTimelineDate(events.find(e=>e.id==='e-wooah-exclamation-music-release')).value,'2020-05-15');
 for(const [eventId,[workId,videoId]] of Object.entries(expected)){
  const media=api.wooahTimelineMedia(eventId),event=events.find(e=>e.id===eventId);
  assert.equal(api.wooahTimelineRelease(eventId),null);
  assert.deepEqual(event.workIds,[workId]);
  assert.equal(media.key,workId);assert.equal(media.videoId,videoId);assert.equal(media.kind,'mv');
  assert.equal(media.date,'','The release date must not become an MV publication date.');
 }
 assert.equal(JSON.stringify(api.canonical),before);
});

test('timeline keeps six release links and emits five precise media callbacks with return-focus identities',()=>{
 const calls=[];
 const props={onRelease:(key,eventId)=>calls.push(['release',key,eventId]),onMedia:(key,eventId)=>calls.push(['media',key,eventId])};
 const buttons=nodes(api.WooahTimeline(props)).filter(n=>n.type==='button');
 assert.equal(buttons.filter(n=>n.props['data-timeline-target-kind']==='release').length,6);
 const mediaButtons=buttons.filter(n=>n.props['data-timeline-target-kind']==='media');
 assert.equal(mediaButtons.length,5);
 for(const button of mediaButtons){
  const eventId=button.props['data-timeline-event-trigger'];
  assert.equal(button.props['data-timeline-target-id'],expected[eventId][0]);
  button.props.onClick();
  assert.deepEqual(calls.at(-1),['media',expected[eventId][0],eventId]);
 }
 const html=renderToStaticMarkup(React.createElement(api.WooahTimeline,props));
 assert.match(html,/相关 MV · /);assert.doesNotMatch(html,/<select|分类|日期待确认/);
 assert.equal(nodes(api.WooahTimeline({onRelease:()=>{}})).filter(n=>n.props?.['data-timeline-target-kind']==='media').length,0,'No inert media buttons when the host does not implement navigation.');
});

test('unknown, supporting and unrelated events do not gain guessed video or stage links',()=>{
 for(const id of ['unknown','e-wooah-formal-debut','e-wooah-joy-cd-postponement','e-wooah-unframed-comeback-live-announcement','e-wooah-wxw-release','e-wooah-shining-on-you-release'])assert.equal(api.wooahTimelineMedia(id),null);
 const event=api.canonical.events.find(e=>e.id==='e-wooah-wish-release'),original=event.workIds;
 try{event.workIds=['recUnknown'];assert.equal(api.wooahTimelineMedia(event.id),null);}
 finally{event.workIds=original;}
});

test('ambiguous or mismatched video identities fail closed without changing the canonical record',()=>{
 const eventId='e-wooah-wish-release',video=api.wooahTimelineMedia(eventId),originalUrl=video.url;
 try{video.url='https://www.youtube.com/watch?v=wrongwrong1';assert.equal(api.wooahTimelineMedia(eventId),null);}
 finally{video.url=originalUrl;}
 try{api.design.videos.push({...video,key:'duplicate-candidate'});assert.equal(api.wooahTimelineMedia(eventId),null);}
 finally{api.design.videos.pop();}
 assert.equal(api.wooahTimelineMedia(eventId).videoId,expected[eventId][1]);
});
