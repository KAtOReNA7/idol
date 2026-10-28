const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),data=require('../data/timeline-reported-records.json');
const laterEvidence=require('../../../docs/codex/evidence/20261028-continuous/evidence-upgrade-proposal-c.json');
const {reportedTimelineRecords,supersededNativeReportIds,withReportedTimelineIdentity}=load('lib/idol/timeline/reported-records.mjs');
const {actionIdentity,validateIdentity}=load('lib/idol/design-review/sol15-runtime/shared/identity.js');
const {TimelineReportedRecords}=load('components/timeline-reported-records.tsx');
const {artist,render}=load('lib/idol/udtt-native/presentation.mjs');
const hashes={atheart:'82dab6b7057818a60acb933f57617877eced2a664b0a64206f9a38a5c3bac853',bewave:'cfed63175dbcf2be685f67c94f5511235e8e1000eff880942e1ecd8d2eab7565',candyshop:'480ebf439d9de4824b9d3d2c54c2a6a54e67024c7622c70acd71ac38202b4af2',geenius:'6827b5a3cbaa18a718854729a86b571b085f1d3251f139e3c21950571b242421',udtt:'f2fc3be3ed849ce23e8dfea4da27607e1f20b4699efc027cd1a23b7efcd311e3'};
test('seven reporting overlays preserve historical canonical bytes through reviewed evidence preimages, exact IDs and member sets',()=>{
 const holds=[];for(const [slug,sha] of Object.entries(hashes)){
  const bytes=fs.readFileSync(path.join(root,'data/artist-timelines',slug+'.json'));
  const change=laterEvidence.timelines.find(row=>row.slug===slug);
  const historicalBytes=change?Buffer.from(change.expectedBeforeText,'utf8'):bytes;
  assert.equal(crypto.createHash('sha256').update(historicalBytes).digest('hex'),sha);
  if(change)assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),change.proposedAfterFileSha256);
  holds.push(...JSON.parse(bytes).events.filter(e=>e.reviewStatus==='hold').map(e=>({...e,slug})));
 }
 assert.equal(holds.length,7);assert.equal(data.records.length,7);
 assert.deepEqual(data.records.map(r=>r.eventId).sort(),holds.map(e=>e.id).sort());
 for(const row of data.records){const original=holds.find(e=>e.id===row.eventId);assert.equal(row.groupId,original.groupId);assert.equal(row.slug,original.slug);assert.deepEqual(row.memberIds,original.memberIds);assert.equal(row.eventDate,null);assert.match(row.boundary,/生效日期未确认/);assert.ok(row.sources.length);for(const s of row.sources)assert.match(s.url,/^https:\/\//);}
 assert.doesNotMatch(JSON.stringify(data),/"(?:score|note|watched|favorite|ratingIds|reviewStatus)"/);
});
test('report, retail and repost dates are distinct and no inferred Sena date appears',()=>{
 const kinds=data.records.reduce((a,r)=>(a[r.kind]=(a[r.kind]||0)+1,a),{});assert.deepEqual(kinds,{report:5,catalog:1,repost:1});
 const catalog=data.records.find(r=>r.kind==='catalog');assert.equal(catalog.recordDate,'2026-01-15');assert.equal(catalog.sources[0].publishedDate,null);assert.match(catalog.summary,/QR/);
 const repost=data.records.find(r=>r.kind==='repost');assert.equal(repost.recordDate,null);assert.equal(repost.sources[0].publishedDate,null);assert.doesNotMatch(JSON.stringify(repost),/2025-03-26|临时加入/);
 assert.deepEqual(reportedTimelineRecords('udtt','wrong-group'),[]);
});
test('native variants render all records, boundaries and safe sources, retaining CandyShop alias/member navigation',()=>{
 for(const [slug,variant] of [['atheart','shared'],['bewave','bewave'],['candyshop','candyshop'],['geenius','geenius']]){
  const row=data.records.find(r=>r.slug===slug),html=renderToStaticMarkup(React.createElement(TimelineReportedRecords,{slug,groupId:row.groupId,variant,renderMember:id=>React.createElement('a',{href:'/member/'+id},id)}));
  assert.equal((html.match(/data-reported-record=/g)||[]).length,data.records.filter(r=>r.slug===slug).length);
  for(const r of reportedTimelineRecords(slug,row.groupId)){assert.ok(html.includes(r.eventId));assert.ok(html.includes(r.boundary));assert.ok(html.includes(r.sources[0].url.replaceAll('&','&amp;')));}
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.doesNotMatch(html,/canonical|reviewStatus|hold/);
  if(slug==='candyshop'){assert.ok(html.includes('id="e-candyshop-yuina-hiatus-report"'));assert.ok(html.includes('/member/recvxAPQCFyiww'));}
 }
 assert.deepEqual(supersededNativeReportIds('candyshop','rec28ldfRTiDlb'),['e-candyshop-yuina-hiatus-report']);
});
test('UDTT identity projection permits only exact reporting source and leaves source artist untouched',()=>{
 const before=JSON.stringify(artist),projected=withReportedTimelineIdentity(artist);assert.equal(projected.timeline.length,artist.timeline.length+2);assert.equal(JSON.stringify(artist),before);
 assert.equal(projected.members,artist.members);assert.equal(projected.works,artist.works);
 assert.throws(()=>withReportedTimelineIdentity(projected),/collides/);
 const r=reportedTimelineRecords('udtt',artist.id)[0],route={page:'timeline',key:null,query:new URLSearchParams()};let key=r.eventId,url=r.sources[0].url;
 const context={getAttribute:n=>n==='data-event-id'?key:null,hasAttribute:n=>n==='data-event-id'};
 const element={getAttribute:n=>n==='href'?url:null,closest:()=>context};
 const identity=actionIdentity(element,{artist:projected,route});assert.equal(identity.eventId,r.eventId);assert.equal(identity.groupId,r.groupId);assert.deepEqual(identity.relatedMemberIds,[]);
 url='https://invalid.example/forged';assert.throws(()=>actionIdentity(element,{artist:projected,route}),/Event source URL/);
 url=r.sources[0].url;key='e-not-owned';assert.throws(()=>actionIdentity(element,{artist:projected,route}),/not owned/);
 key=r.eventId;const changed={...identity,eventId:'forged'};assert.equal(validateIdentity(changed,actionIdentity(element,{artist:projected,route})).valid,false);
});
