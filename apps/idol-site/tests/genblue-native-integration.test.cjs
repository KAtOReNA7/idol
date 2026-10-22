const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const archive=require('../data/genblue-bluecut.json');
// Actual modules, with only Cloudflare's environment stubbed. No network or DB.
const source=esbuild.buildSync({stdin:{contents:`export * from './lib/idol/genblue-bluecut'; export {projectCatalog} from './lib/idol/catalog'; export {projectArtistCatalog} from './lib/idol/artist-catalog'; export {memberWorks} from './lib/idol/member-works'; export {default as Page} from './components/genblue/bluecut-experience'; export {ArtistTimelineHostProvider} from './components/artist-timeline-host';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};
vm.runInThisContext('(function(require,module,exports){'+source+'\n})')((name)=>name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name),mod,mod.exports);
const api=mod.exports;
const snapshot=require('../data/snapshot.json');
const actual=api.projectArtistCatalog(api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt),archive.groupId);
const synthetic=JSON.parse(fs.readFileSync('../../handoffs/codex-20261022/combined-integration/tests/fixtures/genblue.synthetic-catalog.json','utf8'));

test('all six stable member IDs and eight exact video bindings match the existing snapshot without mutation',()=>{
  const before=JSON.stringify(actual);
  assert.equal(api.isGenblueCatalog(actual),true);
  for(const member of archive.members){assert.ok(api.resolveGenblueMember(actual,member.id));assert.ok(api.memberWorks(actual,member.id).length>0,'Missing member relation: '+member.id);}
  for(const media of archive.media){assert.ok(api.resolveGenblueMedia(actual,media),'Unbound video: '+media.key);const href=api.genblueRecordHref(actual,media,api.genblueMediaHref(media));assert.ok(href);const url=new URL(href,'https://test.invalid');assert.equal(url.searchParams.get('work'),media.workId);assert.equal(url.searchParams.get('video'),media.kind==='stage'?'stage':null);assert.equal(url.searchParams.get('returnTo'),api.genblueMediaHref(media));}
  assert.equal(JSON.stringify(actual),before);
});

test('MV cast uses singleton existing relations; stage never borrows the MV cast',()=>{
  const knownCounts={rec28ldfRTrCU6:6,rec28ldfRTrCYg:6,rec28ldfRTrQJ1:6,recvxIZLjZmGMf:0};
  for(const media of archive.media){const members=api.genblueMediaMembers(actual,media);assert.equal(members.length,media.kind==='mv'?knownCounts[media.workId]:0);for(const member of members)assert.ok(api.memberWorks(actual,member.id).some(item=>item.work.id===media.workId));}
  const c=structuredClone(actual),media=archive.media[0],memberId=archive.members[0].id;
  c.ratings=[{id:'synthetic-mixed',workIds:[media.workId,'recOther'],memberIds:[memberId]}];assert.equal(api.genblueMediaMembers(c,media).length,0);
  c.ratings=[{id:'synthetic-mixed',workIds:[media.workId],memberIds:[memberId,archive.members[1].id]}];assert.equal(api.genblueMediaMembers(c,media).length,0);
});

test('wrong videos, duplicate IDs, foreign groups and unbound stage scores fail closed; zero remains a valid score',()=>{
  const media=archive.media[0],copy=()=>structuredClone(actual);
  for(const mutate of [c=>c.works.push({...c.works.find(w=>w.id===media.workId)}),c=>c.works.find(w=>w.id===media.workId).url='https://www.youtube.com/watch?v=wrongwrong1',c=>c.works.find(w=>w.id===media.workId).groupIds=['foreign']]){const c=copy();mutate(c);assert.equal(api.resolveGenblueMedia(c,media),null);assert.equal(api.genblueRecordHref(c,media,api.genblueMediaHref(media)),null);}
  const c=copy(),work=c.works.find(w=>w.id===media.workId);work.score=0;assert.equal(api.resolveGenblueMedia(c,media).score,0);work.score=null;assert.equal(api.resolveGenblueMedia(c,media).score,null);
  const stage=archive.media.find(m=>m.kind==='stage'),sw=c.works.find(w=>w.id===stage.workId);sw.stage={...sw.stage,scoreBinding:null};assert.equal(api.resolveGenblueMedia(c,stage),null);
});

test('member, release, media and record return routes preserve finite identity and reject foreign destinations',()=>{
  for(const m of archive.members)assert.equal(api.readGenblueRoute(api.genblueMemberHref(m.id)).member,m.id);
  for(const r of archive.releases)assert.equal(api.readGenblueRoute(api.genblueReleaseHref(r.key)).release,r.key);
  for(const m of archive.media)assert.equal(api.readGenblueRoute(api.genblueMediaHref(m)).media,m.key);
  for(const url of ['https://evil.example/','//evil.example/','/artists/wooah','/artists/genblue?section=members&member=recUnknown','/artists/genblue?section=works&format=stage&media='+archive.media[0].key])assert.equal(api.readGenblueRoute(url).valid,false);
});

test('real React renders homepage, directories, six member pages, eight releases, eight videos and timeline with synthetic read state',()=>{
  const routes=['/artists/genblue','/artists/genblue?section=members','/artists/genblue?section=works','/artists/genblue?section=updates',...archive.members.map(m=>api.genblueMemberHref(m.id)),...archive.releases.map(r=>api.genblueReleaseHref(r.key)),...archive.media.map(m=>api.genblueMediaHref(m))];
  for(const route of routes){const html=renderToStaticMarkup(React.createElement(api.ArtistTimelineHostProvider,{value:{catalog:synthetic,loading:false,serverRoute:route}},React.createElement(api.Page)));assert.match(html,/data-genblue-native="bluecut"/);assert.doesNotMatch(html,/这个链接暂不可用|未找到这个/);if(route==='/artists/genblue')for(const m of archive.members)assert.ok(html.includes(m.cnName));}
  assert.equal(routes.length,26);
});
