const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs');
const load = require('./helpers/public-artist-loader.cjs');
const bridge = load('lib/idol/public-artist-bridge.ts');
const nav = load('lib/idol/artist-navigation.ts');
const journey = load('lib/idol/journey.ts');
const values = load('lib/idol/values.ts');
const identities = JSON.parse(fs.readFileSync('data/public-artist-identity-map.json'));
const keys = JSON.parse(fs.readFileSync('data/public-artist-navigation-keys.json'));
const snapshot = JSON.parse(fs.readFileSync('data/snapshot.json'));
const stages = JSON.parse(fs.readFileSync('data/stage-videos.json'));
function catalogFor(slug) {
  const groupId = identities.groups[slug].groupId;
  // Only identities/URLs come from the local baseline. All personal test values are synthetic.
  return {scope: {type: 'artist', groupId},
    groups: snapshot.tables.groups.records.filter(row => row.recordId === groupId).map(row => ({id: row.recordId})),
    members: snapshot.tables.members.records.map(row => ({id: row.recordId,
      groupIds: values.asIds(row.fields.fld6bhQOdO), formerGroupIds: values.asIds(row.fields.fldf1alCIu),
      note: 'SYNTHETIC MEMBER NOTE', favorite: 2})).filter(row => row.groupIds.includes(groupId) || row.formerGroupIds.includes(groupId)),
    works: snapshot.tables.works.records.map(row => ({id: row.recordId,
      groupIds: values.asIds(row.fields.fld2wy1cqw), url: values.asText(row.fields.fldhBWXBZE),
      stage: structuredClone(stages[row.recordId] ?? null), note: 'SYNTHETIC WORK NOTE', score: 8.2, stageScore: 7.4, watched: 'SYNTHETIC'})).filter(row => row.groupIds.includes(groupId))};
}
const resolver = (slug, kind, key, catalog = catalogFor(slug)) => bridge.resolvePublicArtistEntity(slug, {kind, key}, catalog);
function deepFreeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; }

test('navigation and identity projections are versioned, compact, public and finite', () => {
  assert.equal(identities.schemaVersion, 1); assert.equal(keys.schemaVersion, 1);
  assert.deepEqual(Object.keys(identities.groups), ['triples', 'rescene', 'purplekiss']);
  assert.deepEqual(Object.values(identities.groups).map(group => [group.members.length, group.releases.length, group.media.length]), [[24,22,18],[5,6,10],[7,13,13]]);
  for (const [slug, group] of Object.entries(identities.groups)) {
    const route = keys.groups[slug];
    assert.equal(route.path, nav.groupArtistUrl(group.groupId));
    assert.deepEqual(route.memberIds, group.members.map(row => row.memberId));
    assert.deepEqual(route.releases, group.releases.map(row => row.key));
    assert.deepEqual(route.media, group.media.map(({key, kind}) => ({key, kind})));
  }
  for (const file of ['data/public-artist-identity-map.json', 'data/public-artist-navigation-keys.json']) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /"(?:score|note|favorite|watched|fileToken|revision|fields|ratings|title|dateSemantics)"/);
    assert.ok(fs.statSync(file).size < 24000, file);
  }
});

for (const [slug, ids] of Object.entries(identities.groups)) {
  const groupKeys = keys.groups[slug], path = groupKeys.path;
  test(`${slug}: runtime group, all member identities and historical affiliations resolve`, () => {
    const catalog = deepFreeze(catalogFor(slug)), before = JSON.stringify(catalog);
    assert.equal(resolver(slug, 'group', slug, catalog).group.id, ids.groupId);
    for (const member of ids.members) {
      for (const key of new Set([member.key, member.memberId])) {
        const found = resolver(slug, 'member', key, catalog); assert.equal(found.member.id, member.memberId);
        const ret = bridge.publicArtistHref(slug, {section: 'members', member: member.memberId});
        const href = bridge.publicMemberActionHref({slug, key, memberId: member.memberId, returnTo: ret, currentArtistUrl: ret}, catalog);
        assert.equal(journey.readRoute(href).member, member.memberId); assert.equal(journey.readRoute(href).artistReturn, ret);
        assert.equal(journey.routeUrl(journey.readRoute(href)), href);
        for (const patch of [{memberId:'recWrong'}, {currentArtistUrl:path}, {returnTo:'/artists/ive'}])
          assert.equal(bridge.publicMemberActionHref({slug, key, memberId:member.memberId, returnTo:ret, currentArtistUrl:ret, ...patch},catalog), null);
      }
    }
    assert.equal(JSON.stringify(catalog), before);
  });
  test(`${slug}: all (kind,key) media bindings validate current catalog and canonical round trips`, () => {
    const catalog = deepFreeze(catalogFor(slug)), before = JSON.stringify(catalog);
    for (const media of ids.media) {
      const found = resolver(slug, media.kind, media.key, catalog);
      assert.ok(found, `${media.kind}:${media.key}`); assert.equal(found.work.id, media.workId); assert.equal(found.videoId, media.videoId);
      const ret = bridge.publicArtistHref(slug, {section:'works', format:media.kind, media:media.key});
      assert.equal(nav.safeArtistReturn(ret), ret);
      for (const action of ['play','records']) {
        const input = {slug, kind:media.kind, key:media.key, action, workId:media.workId, videoId:media.videoId, returnTo:ret, currentArtistUrl:ret};
        const href = bridge.publicMediaActionHref(input, catalog), route = journey.readRoute(href);
        assert.equal(route.work, media.workId); assert.equal(route.video, media.kind); assert.equal(route.artistReturn, ret);
        assert.equal(journey.routeUrl(route), href);
        for (const patch of [{action:'save'}, {kind:media.kind==='mv'?'stage':'mv'}, {workId:'recWrong'}, {videoId:'AAAAAAAAAAA'}, {currentArtistUrl:path}, {returnTo:'/artists/ive'}, {returnTo:ret+'#fragment'}])
          assert.equal(bridge.publicMediaActionHref({...input,...patch}, catalog), null, JSON.stringify(patch));
      }
    }
    assert.equal(JSON.stringify(catalog), before);
  });
  test(`${slug}: every public release remains editorial; aliases resolve uniquely without work IDs`, () => {
    const events = JSON.parse(fs.readFileSync(`data/artist-timelines/${slug}.json`)).events;
    for (const release of ids.releases) {
      const found = resolver(slug,'release',release.key);
      assert.equal(found.releaseId,null); assert.equal(found.work,undefined); assert.equal(found.workId,undefined);
      const ret=bridge.publicArtistHref(slug,{section:'works',release:release.key}); assert.equal(nav.safeArtistReturn(ret),ret);
      if(release.timelineReleaseKey) {
        const matched=events.filter(event=>event.releaseKey===release.timelineReleaseKey); assert.equal(matched.length,1);
        assert.equal(matched[0].id, release.timelineEventId); assert.equal(bridge.publicTimelineReleaseHref(slug,release.timelineReleaseKey),ret);
      } else assert.equal(found.timelineEventId,null);
    }
    assert.equal(bridge.publicTimelineReleaseHref(slug,'invented-key'),null);
    assert.equal(resolver(slug,'release','recInvented'),null);
  });
  test(`${slug}: runtime missing, malformed, duplicate, wrong-scope and changed identities fail closed`, () => {
    const media=ids.media[0], member=ids.members[0];
    for(const malformed of [null,undefined,{},[],{groups:null},{groups:[null]},{groups:[{id:ids.groupId}],scope:null}]) {
      assert.doesNotThrow(()=>bridge.resolvePublicArtistEntity(slug,{kind:media.kind,key:media.key},malformed));
      assert.equal(bridge.resolvePublicArtistEntity(slug,{kind:media.kind,key:media.key},malformed),null);
    }
    const edits=[c=>c.groups=[],c=>c.groups.push(c.groups[0]),c=>c.scope.groupId='recForeign',c=>c.scope.type='all',c=>c.works=null,c=>c.works.push(c.works.find(w=>w.id===media.workId)),c=>c.works.find(w=>w.id===media.workId).groupIds=['recForeign'],c=>c.works.find(w=>w.id===media.workId).groupIds=null,c=>c.works.find(w=>w.id===media.workId).url='https://youtu.be/'+media.videoId,c=>c.works.find(w=>w.id===media.workId).placeholder={reason:'test'},c=>c.works.push({...c.works.find(w=>w.id===media.workId),id:'recDuplicateSource'}),c=>c.works.push({...c.works.find(w=>w.id===media.workId),id:'recDuplicateAlias',url:'https://youtu.be/'+media.videoId})];
    for(const edit of edits){const catalog=catalogFor(slug);edit(catalog);assert.equal(resolver(slug,media.kind,media.key,catalog),null);}
    for(const edit of [c=>c.members=[],c=>c.members.push(c.members.find(m=>m.id===member.memberId)),c=>{const m=c.members.find(m=>m.id===member.memberId);m.groupIds=[];m.formerGroupIds=[];},c=>c.members=null]) {
      const catalog=catalogFor(slug); edit(catalog); assert.equal(resolver(slug,'member',member.key,catalog),null);
    }
    const unscoped=catalogFor(slug);delete unscoped.scope;assert.ok(resolver(slug,media.kind,media.key,unscoped));
  });
  test(`${slug}: all prototype member, release and media paths translate to real artist URLs`, () => {
    for(const member of ids.members)assert.equal(new URL(bridge.translatePublicPrototypeRoute(slug,`#/${slug==='triples'?'person':'member'}/${member.key}`).href,'https://site.invalid').searchParams.get('member'),member.memberId);
    for(const release of ids.releases){const hash=slug==='triples'?`#/works?type=release&detail=${release.key}`:`#/work/${release.key}`;assert.equal(new URL(bridge.translatePublicPrototypeRoute(slug,hash).href,'https://site.invalid').searchParams.get('release'),release.key);}
    for(const media of ids.media){const hash=slug==='triples'?`#/works?type=${media.kind}&detail=${media.key}`:`#/work/${media.key}`;const href=bridge.translatePublicPrototypeRoute(slug,hash).href;const params=new URL(href,'https://site.invalid').searchParams;assert.equal(params.get('media'),media.key);assert.equal(params.get('format'),media.kind);}
  });
  test(`${slug}: all canonical timeline nodes/years survive; unreviewed events do not become identities`, () => {
    const events=JSON.parse(fs.readFileSync(`data/artist-timelines/${slug}.json`)).events;
    assert.equal(events.length,{triples:24,rescene:12,purplekiss:17}[slug]);
    assert.deepEqual(groupKeys.events.map(row=>row.id),events.map(row=>row.id));
    for(const event of groupKeys.events)assert.ok(bridge.publicArtistHref(slug,{section:'updates',event:event.id,year:event.year,timelineOrder:'earliest'}));
    for(const event of ids.events){const found=resolver(slug,'event',event.key);if(slug==='triples')assert.equal(found.canonicalEventId,event.canonicalEventId);else{assert.equal(event.canonicalEventId,null);assert.equal(found,null);assert.equal(bridge.translatePublicPrototypeRoute(slug,'#/timeline?event='+event.key),null);}}
  });
  test(`${slug}: unsafe, cross-group, duplicate, malformed and mutually conflicting return states are rejected`, () => {
    const media=ids.media[0];
    const bad=[`https://site.invalid${path}`,`//site.invalid${path}`,`${path}#`,`${path}#x`,` ${path}`,`${path}/../${slug}`,`${path}?secret=x`,`${path}?returnTo=/api/save`,`${path}?section=works&release=unknown`,`${path}?section=works&format=mv&media=unknown`,`${path}?section=works&release=${ids.releases[0].key}&media=${media.key}`,`${path}?section=works&media=${media.key}`,`${path}?section=members&member=recUnknown`,`${path}?section=works&q=${'x'.repeat(201)}`,`${path}?section=works&section=members`,`${path}?q=a&%71=b`,`${path}?section=updates&year=2099`,`${path}?section=works&year=${groupKeys.years[0]}`,`${path}?section=works&format=${media.kind}&media=${media.key}&member=${ids.members[0].memberId}`];
    for(const value of bad)assert.equal(nav.safeArtistReturn(value),null,value);
    for(const [other,otherIds]of Object.entries(identities.groups).filter(([name])=>name!==slug)){
      assert.equal(bridge.publicArtistHref(slug,{section:'works',release:otherIds.releases[0].key}),null,other);
      assert.equal(bridge.publicArtistHref(slug,{section:'members',member:otherIds.members[0].memberId}),null,other);
    }
    for(const hash of ['#/home?secret=x','#/home?type=mv','#/members?detail=x','#/works?type=mv&type=stage','#/works?detail=unknown','#/member/%ZZ','#/home/extra','#/works?return=https%3A%2F%2Fevil.test','#/timeline?event=timeline-year-2099']) assert.equal(bridge.translatePublicPrototypeRoute(slug,hash),null,hash);
  });
}

test('tripleS Untitled collision is separated by kind; stage is the existing Girls Never Die work',()=>{
  const release=resolver('triples','release','untitled'),mv=resolver('triples','mv','untitled');
  assert.equal(release.releaseId,null);assert.equal(mv.kind,'mv');assert.ok(mv.work.id);
  const stage=identities.groups.triples.media.find(row=>row.kind==='stage'),catalog=catalogFor('triples');
  assert.equal(stage.workId,'rec28ldfRTrCjG');assert.equal(stage.videoId,'y2Zx2JpmUU8');
  assert.equal(values.videoId(catalog.works.find(row=>row.id===stage.workId).url),'2tda_TCjz8w');
  for(const edit of [s=>s.videoId='AAAAAAAAAAA',s=>s.url='https://youtu.be/'+stage.videoId,s=>s.scorePolicy='view_only',s=>s.sourceClass='audience_original',s=>s.platform='naver',s=>s.completeness='excerpt',s=>s.clip={startSeconds:1,endSeconds:10,sourceDurationSeconds:100}]){
    const bad=structuredClone(catalog);edit(bad.works.find(row=>row.id===stage.workId).stage);assert.equal(resolver('triples','stage',stage.key,bad),null);
  }
  const duplicatedStage=structuredClone(catalog),original=duplicatedStage.works.find(row=>row.id===stage.workId);
  duplicatedStage.works.push({...original,id:'recStageAlias',stage:{...original.stage,url:'https://youtu.be/'+stage.videoId}});
  assert.equal(resolver('triples','stage',stage.key,duplicatedStage),null);
  const badBinding=structuredClone(catalog);badBinding.works.find(row=>row.id===stage.workId).stage.scoreBinding={videoId:'AAAAAAAAAAA',initialScore:null,initializedAt:'2026-10-01'};
  assert.equal(resolver('triples','stage',stage.key,badBinding).stageScoreBindingValid,false);
});

test('PURPLE KISS remains seven historical members, with no forced current roster',()=>{
  const catalog=catalogFor('purplekiss');assert.equal(catalog.members.length,7);
  for(const member of catalog.members){assert.equal(member.groupIds.length,0);assert.ok(member.formerGroupIds.includes(identities.groups.purplekiss.groupId));}
  assert.equal(nav.safeArtistReturn('/artists/purplekiss?roster=history'),null);
});

test('legacy tripleS release participants retain release, member, reader and video-tab context',()=>{
  const member=identities.groups.triples.members[10].memberId;
  const ret=`/artists/triples?section=works&member=${member}&format=stage&reader=${member}&release=password-single`;
  assert.equal(nav.safeArtistReturn(ret),ret);
  const href=bridge.publicMemberActionHref({slug:'triples',key:member,memberId:member,returnTo:ret,currentArtistUrl:ret},catalogFor('triples'));
  assert.equal(journey.readRoute(href).artistReturn,ret);
  assert.equal(bridge.publicArtistHref('rescene',{section:'works',release:identities.groups.rescene.releases[0].key,member:identities.groups.rescene.members[0].memberId}),null);
});

test('finite tripleS filters preserve a canonical root round trip and reject wrong scopes',()=>{
  const member=identities.groups.triples.members[10].memberId;
  const input=`#/works?type=release&unit=hatch&member=${member}&sort=oldest`;
  const translated=bridge.translatePublicPrototypeRoute('triples',input);
  assert.equal(translated.href,`/artists/triples?section=works&unit=hatchi&participant=${member}&sort=oldest`);
  assert.equal(journey.readRoute(journey.routeUrl({nav:'works',work:'recExisting',member:null,video:'mv',artistReturn:translated.href})).artistReturn,translated.href);
  assert.ok(bridge.translatePublicPrototypeRoute('triples','#/members?view=units&unit=hatchi'));
  for(const url of ['/artists/triples?section=works&unit=hatch','/artists/triples?section=works&sort=random','/artists/triples?section=overview&unit=hatchi','/artists/rescene?section=members&rosterView=units','/artists/purplekiss?section=works&unit=aaa','/artists/ive?section=works&sort=newest',`/artists/triples?section=works&format=mv&participant=${member}`])assert.equal(nav.safeArtistReturn(url),null,url);
  const event=keys.groups.triples.events[0];assert.equal(bridge.publicArtistHref('triples',{section:'updates',event:event.id,year:keys.groups.triples.years.at(-1)}),null);
});

test('immediate opener, nested detail, direct reload and stale callbacks are explicit',()=>{
  const member=identities.groups.triples.members[10].memberId;
  const person=`/artists/triples?section=members&member=${member}`;
  const list=`/artists/triples?section=works&unit=hatchi&participant=${member}&sort=oldest`;
  const detail='/artists/triples?section=works&release=password-single';
  assert.equal(bridge.publicArtistDetailOrigin('triples',list,person),list);
  assert.equal(bridge.publicArtistDetailOrigin('triples',detail,list),list);
  assert.equal(bridge.publicArtistDetailOrigin('triples',detail,person),person);
  assert.equal(bridge.publicArtistDetailOrigin('triples',detail,detail),'/artists/triples?section=works');
  assert.equal(bridge.publicArtistDetailOrigin('triples',detail,'/artists/ive'),'/artists/triples?section=works');
  const media=identities.groups.triples.media.find(row=>row.kind==='stage');
  assert.equal(bridge.publicArtistDetailOrigin('triples',bridge.publicArtistHref('triples',{section:'works',format:'stage',media:media.key})), '/artists/triples?section=works&format=stage');
  assert.equal(bridge.publicArtistDetailOrigin('triples',person),'/artists/triples?section=members');
  const nested=bridge.translatePublicPrototypeRoute('triples',`#/works?type=release&detail=password-single&return=${encodeURIComponent('#/works?type=release&unit=hatchi&return='+encodeURIComponent('#/person/'+member))}`);
  assert.equal(nested.opener,'/artists/triples?section=works&unit=hatchi');
});

test('runtime and canonical helper are pure, acyclic and leave established editor safeguards intact',()=>{
  const source=fs.readFileSync('lib/idol/public-artist-bridge.ts','utf8');
  assert.doesNotMatch(source,/fetch\s*\(|localStorage|sessionStorage|window\.|document\.|\/api\/save|\/api\/records|\.POST\s*\(/);
  const route=fs.readFileSync('lib/idol/public-artist-route-keys.ts','utf8');
  assert.doesNotMatch(route,/from ['"].*(?:artist-navigation|public-artist-bridge|design-public-catalog|types)['"]/);
  const editor=fs.readFileSync('app/page.tsx','utf8'),driver=fs.readFileSync('components/use-browse-journey.ts','utf8');
  for(const token of ['onDirtyChange','onNavigationBlockedChange','operationId:crypto.randomUUID()','revision:detail.revision','values:changed'])assert.ok(editor.includes(token));
  assert.match(driver,/mayLeave\(\)/);assert.match(driver,/data-dirty/);assert.match(driver,/data-navigation-blocked/);
  assert.equal(bridge.publicArtistHref('__proto__'),null);assert.equal(bridge.translatePublicPrototypeRoute('__proto__','#/home'),null);
});
