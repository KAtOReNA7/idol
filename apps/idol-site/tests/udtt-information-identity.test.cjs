const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./helpers/public-artist-loader.cjs');
const {artist}=load('lib/idol/udtt-native/presentation.mjs');
const {withGroupInformationIdentity}=load('lib/idol/udtt-native/information-identity.mjs');
const {renderGroupInformation}=load('lib/idol/group-information.mjs');
const {withReportedTimelineIdentity,reportedTimelineRecords}=load('lib/idol/timeline/reported-records.mjs');
const {actionIdentity,validateIdentity}=load('lib/idol/design-review/sol15-runtime/shared/identity.js');
const home={page:'home',key:null,query:new URLSearchParams()};
const element=(url,sourceId=null,context=null)=>({getAttribute:key=>key==='href'?url:key==='data-source-id'?sourceId:null,closest:()=>context});
const urls=rows=>rows.map(row=>typeof row==='string'?row:row.url);

test('every current information link is projected onto the exact group, including both new Circle dates',()=>{
 const group={id:artist.id},projected=withGroupInformationIdentity(artist,group),allowed=urls(projected.sources);
 const hrefs=[...renderGroupInformation('udtt',group).matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
 assert.ok(hrefs.length>2);for(const href of hrefs)assert.ok(allowed.includes(href),href);
 for(const date of ['20250501','20260710']){
  const url='https://circlechart.kr/page_chart/retail.circle?termGbn=day&yyyymmdd='+date;
  const identity=actionIdentity(element(url),{artist:projected,route:home});
  assert.ok(identity.sourceIds.length);assert.equal(identity.sourceUrl,url);assert.equal(identity.entityId,artist.id);assert.equal(identity.entityType,'group');
 }
});

test('projection retains old sources and entity references without mutating or copying personal fields',()=>{
 const group={id:artist.id,note:'private-statistics-canary',score:0,watched:'private-viewed',social:[]};
 const sourceArtist={...artist,sources:[{id:'legacy-fixture-source',url:'https://example.org/existing-source'}]};
 const beforeArtist=JSON.stringify(artist),beforeSourceArtist=JSON.stringify(sourceArtist),beforeGroup=JSON.stringify(group),projected=withGroupInformationIdentity(sourceArtist,group);
 assert.equal(JSON.stringify(artist),beforeArtist);assert.equal(JSON.stringify(group),beforeGroup);
 assert.equal(JSON.stringify(sourceArtist),beforeSourceArtist);
 assert.equal(projected.members,artist.members);assert.equal(projected.works,artist.works);assert.equal(projected.timeline,artist.timeline);
 assert.deepEqual(projected.sources.slice(0,sourceArtist.sources.length),sourceArtist.sources);assert.doesNotMatch(JSON.stringify(projected),/private-statistics-canary|private-viewed/);
 for(const source of projected.sources.slice(sourceArtist.sources.length))assert.deepEqual(Object.keys(source),['id','url']);
 const twice=withGroupInformationIdentity(projected,group);assert.deepEqual(twice.sources,projected.sources);
});

test('wrong group identity cannot receive the current group statistics allowlist',()=>{
 assert.equal(withGroupInformationIdentity(artist,{id:'foreign'}),artist);
 const forged={...artist,id:'foreign'};assert.equal(withGroupInformationIdentity(forged,{id:'foreign'}),forged);
 const unknown={...artist,slug:'unknown'};assert.equal(withGroupInformationIdentity(unknown,{id:artist.id}),unknown);
});

test('changed URL or source identity fails validation and unlisted destinations are not allowlisted',()=>{
 const projected=withGroupInformationIdentity(artist,{id:artist.id});
 const url='https://circlechart.kr/page_chart/retail.circle?termGbn=day&yyyymmdd=20250501';
 const identity=actionIdentity(element(url),{artist:projected,route:home});
 for(const altered of ['https://invalid.example/forged','https://circlechart.kr/page_chart/retail.circle?termGbn=day&yyyymmdd=20250502','http://circlechart.kr/page_chart/retail.circle?termGbn=day&yyyymmdd=20250501','javascript:alert(1)']){
  assert.equal(urls(projected.sources).includes(altered),false);
  assert.equal(validateIdentity(identity,actionIdentity(element(altered),{artist:projected,route:home})).valid,false);
 }
 assert.equal(validateIdentity({...identity,sourceId:'forged'},actionIdentity(element(url),{artist:projected,route:home})).valid,false);
 assert.throws(()=>actionIdentity(element(url,'forged'),{artist:projected,route:home}),/Exact source ID and URL/);
});

test('statistics sources do not leak into event or work identity and reporting event guard still rejects them',()=>{
 const projected=withReportedTimelineIdentity(withGroupInformationIdentity(artist,{id:artist.id}));
 const event=reportedTimelineRecords('udtt',artist.id)[0];
 const context={getAttribute:key=>key==='data-event-id'?event.eventId:null,hasAttribute:key=>key==='data-event-id'};
 const route={page:'timeline',key:null,query:new URLSearchParams()};
 const expected=actionIdentity(element(event.sources[0].url,null,context),{artist:projected,route});assert.equal(expected.eventId,event.eventId);
 const url='https://circlechart.kr/page_chart/retail.circle?termGbn=day&yyyymmdd=20250501';
 assert.throws(()=>actionIdentity(element(url,null,context),{artist:projected,route}),/Event source URL/);
 assert.equal(projected.works,artist.works);assert.equal(projected.members,artist.members);
});
