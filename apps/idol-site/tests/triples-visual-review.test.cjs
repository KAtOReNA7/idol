const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs');
const React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
const {load, syntheticCatalog} = require('./helpers/triples-review-loader.cjs');
const model = load('lib/idol/design-review/triples-visual-model.ts');
const component = load('components/design-review/triples-visual-review.tsx');
const timeline = JSON.parse(fs.readFileSync('data/artist-timelines/triples.json'));
const catalog = syntheticCatalog();
const render = (fields = {}, data = catalog, input = timeline) => renderToStaticMarkup(React.createElement(component.default, {catalogOverride: data, timelineOverride: input, serverRoute: model.triplesReviewHref(fields)}));
const internalHrefs = html => [...html.matchAll(/href="([^"#]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')).filter(href => href.startsWith('/design-review/'));
function freeze(value) {if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);} return value;}
freeze(catalog); freeze(timeline);

test('five views use canonical public records without exposing or mutating personal data', () => {
  const before = JSON.stringify({catalog, timeline});
  for (const fields of [{}, {section: 'members'}, {section: 'members', member: catalog.members[0].id}, {section: 'works'}, {section: 'updates'}]) {
    const html = render(fields);
    assert.match(html, /triples-visual-review/); assert.match(html, /data-figma-acceptance="not-accepted"/);
    assert.doesNotMatch(html, /PRIVATE_\w+_SENTINEL|9\.87654|1\.23456|<iframe|<script|data-dirty|data-navigation-blocked/);
    for (const href of internalHrefs(html)) assert.ok(model.canonicalReviewUrl(href), href);
  }
  assert.equal(JSON.stringify({catalog, timeline}), before);
});
test('roster is all 24 stable canonical S identities and portraits', () => {
  const members = model.triplesReviewMembers(catalog);
  assert.equal(members.length, 24); assert.deepEqual(members.map(member => member.sNumber), Array.from({length: 24}, (_, i) => i + 1));
  const html = render({section: 'members'});
  assert.equal((html.match(/class="people-card"/g) ?? []).length, 24);
  for (const member of members) {assert.ok(html.includes(`data-member-id="${member.id}"`)); assert.ok(member.image.startsWith('/artist/triples/'));}
  for (const member of members) {
    const detail = render({section: 'members', member: member.id});
    assert.ok(detail.includes(`class="person-page" data-member-id="${member.id}"`));
    assert.ok(detail.includes(member.stageName)); assert.doesNotMatch(detail, /PRIVATE_/);
  }
});
test('member filtering and all eight unit layouts retain canonical relations', () => {
  const members = model.triplesReviewMembers(catalog);
  assert.equal(members.filter(member => model.reviewMemberMatches(member, 's01')).length, 1);
  assert.equal(members.filter(member => model.reviewMemberMatches(member, 'S24'))[0].sNumber, 24);
  for (const unit of model.triplesReviewDimensions) {
    const html = render({section: 'members', rosterView: 'units', unit: unit.key});
    assert.ok(html.includes(`data-unit-key="${unit.key}"`));
    assert.ok(html.includes(`value="${unit.key}" selected=""`));
    for (const href of internalHrefs(html)) assert.ok(model.canonicalReviewUrl(href), href);
  }
  const empty = render({section: 'members', q: 'definitely-no-match'}); assert.match(empty, /没有找到匹配的成员/);
});
test('public work inventory is 22 releases, 17 MVs, one stage; all details render exact kind keys', () => {
  for (const [format, expected] of [['release',22],['mv',17],['stage',1]]) {
    const fields = {section:'works', ...(format === 'release' ? {} : {format})};
    const html = render(fields);
    assert.equal((html.match(new RegExp(format === 'release' ? 'class="release-tile"' : 'class="video-tile"','g')) ?? []).length, expected);
    for (const item of model.reviewMusicList(format)) {
      const detail = render(model.reviewMusicFields(item));
      assert.ok(detail.includes(`detail-page-${format}`));
      assert.match(detail, /id="work-dialog-title"/);
      if (format !== 'release') assert.match(detail, /detail-record-actions/);
      for (const href of internalHrefs(detail)) assert.ok(model.canonicalReviewUrl(href), href);
    }
  }
});
test('Japanese unit release linkage and member filter are verified-only', () => {
  for (const key of ['untitled','password-single','secrethimitsubimil']) assert.equal(model.reviewDimensionKey(model.triplesReviewReleases.find(item => item.key === key)), 'hatchi');
  const route = model.readTriplesReviewRoute(model.triplesReviewHref({section:'works',participant:catalog.members[0].id}));
  for (const item of model.filteredReviewMusic(route)) {assert.ok(item.participationStatus.startsWith('official_')); assert.ok(item.participantIds.includes(catalog.members[0].id));}
  const item = model.triplesReviewReleases.find(item => item.participationStatus === 'not_verified');
  assert.deepEqual(model.reviewVerifiedParticipants({...item, participantIds:[catalog.members[0].id]}), []);
});
test('canonical timeline retains all 24 event IDs, dates and every year when selected', () => {
  const ready = model.reviewTimeline(timeline,catalog); assert.equal(ready.events.length,24);
  const html = render({section:'updates'});
  assert.equal((html.match(/data-timeline-event=/g) ?? []).length,24);
  for (const event of timeline.events) assert.ok(html.includes(`data-timeline-event="${event.id}"`),event.id);
  for (const fields of [{section:'updates',year:'2024'},{section:'updates',event:timeline.events[0].id}]) assert.equal((render(fields).match(/data-timeline-event=/g) ?? []).length,24);
  assert.ok(internalHrefs(html).includes(model.triplesReviewHref({section:'works'})));
});
test('timeline invalid schema fails closed, held assertions do not render, missing identities do not delete facts', () => {
  assert.equal(model.reviewTimeline({...timeline,schemaVersion:2},catalog).events.length,0);
  const held = structuredClone(timeline); held.events[0].reviewStatus='hold'; held.events[0].holdReasons=['Test hold'];
  const prepared = model.reviewTimeline(held,catalog); assert.equal(prepared.events.length,23);
  const partial = {...catalog,works:[]}; assert.equal(model.reviewTimeline(timeline,partial).events.length,24);
});
test('missing/foreign/duplicate identities never invent people or record actions', () => {
  assert.deepEqual(model.triplesReviewMembers(null),[]);
  assert.deepEqual(model.triplesReviewMembers({...catalog,scope:{type:'artist',groupId:'recWrong'}}),[]);
  const duplicate = {...catalog,members:[...catalog.members,catalog.members[0]]};
  assert.equal(model.triplesReviewMembers(duplicate).length,23);
  const missing = render({section:'works',format:'mv',media:model.triplesReviewVideos[0].key},{...catalog,works:[]});
  assert.doesNotMatch(missing,/detail-record-actions/);
  const malformed = {...catalog,members:[...catalog.members,{id:'recBad',groupIds:null}]};
  assert.equal(model.triplesReviewMembers(malformed).length,24);
});
test('route adapter rejects cross-origin, foreign, malformed, duplicate and unknown fields', () => {
  const path=model.TRIPLES_REVIEW_PATH;
  for (const url of ['https://evil.test'+path,'//evil.test'+path,'/artists/triples',path+'#x',path+'?q=x&q=y',path+'?unknown=x',path+'?section=works&format=release',path+'?section=members&member=recWrong',path+'?section=works&format=stage&media=untitled',path+'/../triples-v2',path+'?section=overview&unit=hatchi']) assert.equal(model.canonicalReviewUrl(url),null,url);
  assert.equal(model.reviewUrlFromCanonical('/artists/rescene'),null);
  assert.ok(model.canonicalReviewUrl(model.triplesReviewHref({section:'works',format:'mv',media:'untitled'})));
  assert.ok(model.canonicalReviewUrl(model.triplesReviewHref({section:'works',release:'untitled'})));
});
test('live navigation gates block foreign modal and pending save; dirty decline is respected', () => {
  let confirms=0,alerts=0; const own={};
  const root=(modals=[],pending=false,dirty=false)=>({querySelectorAll:()=>modals,querySelector:s=>s.includes('navigation-blocked')?pending?{}:null:dirty?{}:null});
  const ask=()=>{confirms++;return false;}, alert=()=>{alerts++;};
  assert.equal(component.reviewMayLeave(root(),null,ask,alert),true);
  assert.equal(component.reviewMayLeave(root([own]),own,ask,alert),true);
  assert.equal(component.reviewMayLeave(root([{}]),own,ask,alert),false);
  assert.equal(component.reviewMayLeave(root([],true,true),own,ask,alert),false);assert.equal(alerts,1);assert.equal(confirms,0);
  assert.equal(component.reviewMayLeave(root([],false,true),own,ask,alert),false);assert.equal(confirms,1);
  assert.equal(component.reviewMayLeave(root([],false,true),own,()=>true,alert),true);
});
test('integration source contains no fixture, arbitrary script, iframe, private editor or mutation API', () => {
  const files=['components/design-review/triples-visual-review.tsx','components/design-review/triples-visual-works.tsx','components/design-review/triples-visual-timeline.tsx','lib/idol/design-review/triples-visual-model.ts'];
  for (const file of files) {
    const source=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(source,/triples-public-fixture\.json|snapshot\.json|dangerouslySetInnerHTML|<iframe|<script|localStorage|sessionStorage|method:\s*['"](?:POST|PUT|PATCH|DELETE)|\/api\/(?:save|record|write)/,file);
  }
  const source=fs.readFileSync(files[0],'utf8');
  assert.match(source,/publicMediaActionHref/);assert.match(source,/publicMemberActionHref/);assert.match(source,/currentUrl\(\) !== url/);assert.match(source,/pendingBack\.current = true; history\.back\(\)/);
  assert.doesNotMatch(source,/PhotoLightbox/);assert.match(source,/imageDialog\.current/);
  const label=fs.readFileSync('components/design-review/review-label.tsx','utf8');assert.match(label,/尚未获得 Figma 或浏览器视觉验收/);
});

test('history plan preserves immediate list opener and never invents a predecessor for direct details', () => {
  const list=model.triplesReviewHref({section:'works',q:'Girls',sort:'oldest'});
  const release=model.triplesReviewHref({section:'works',release:'assemble24'});
  const mv=model.triplesReviewHref({section:'works',format:'mv',media:'girls-never-die'});
  const person=model.triplesReviewHref({section:'members',member:catalog.members[0].id});
  const nextPerson=model.triplesReviewHref({section:'members',member:catalog.members[1].id});
  const open=model.reviewNavigationPlan(list,release,null,release);assert.equal(open.method,'pushState');assert.equal(open.opener.href,list);assert.equal(open.opener.parentEntry,true);
  const related=model.reviewNavigationPlan(release,mv,open.opener,mv);assert.equal(related.method,'replaceState');assert.deepEqual(related.opener,open.opener);
  const direct=model.reviewNavigationPlan(release,mv,null,mv);assert.equal(direct.method,'replaceState');assert.equal(direct.opener.parentEntry,false);assert.equal(direct.opener.href,model.triplesReviewHref({section:'works'}));
  const directMember=model.reviewNavigationPlan(person,nextPerson,null,nextPerson);assert.equal(directMember.opener.parentEntry,false);assert.equal(directMember.opener.href,model.triplesReviewHref({section:'members'}));
  const legacyPerson=model.triplesReviewHref({section:'members',member:catalog.members[0].id,release:'assemble24'});
  const legacyToRelease=model.reviewNavigationPlan(legacyPerson,release,null,release);assert.equal(legacyToRelease.method,'pushState');assert.equal(legacyToRelease.opener.href,legacyPerson);assert.equal(legacyToRelease.opener.parentEntry,true);
  const fromRelease=model.reviewNavigationPlan(release,person,open.opener,person);assert.equal(fromRelease.method,'pushState');assert.equal(fromRelease.opener.href,release);assert.equal(fromRelease.opener.parentEntry,true);
  const immediateList=model.reviewNavigationPlan(person,list,fromRelease.opener,list);assert.equal(immediateList.opener,null);
  const newDetail=model.reviewNavigationPlan(list,mv,immediateList.opener,mv);assert.equal(newDetail.opener.href,list);
  for(const value of [{href:'https://evil.test',focus:null,parentEntry:true},{href:list,focus:null,parentEntry:'true'},{href:list,focus:'//evil.test',parentEntry:true}])assert.equal(model.readReviewOpener(value),null);
});


test('public image and unit captions keep factual labels without internal audit notes', () => {
  const data = JSON.parse(fs.readFileSync('data/triples-artist.json', 'utf8'));
  assert.match(data.hero.caption, /拍摄日期及本次图片阵容时期未确认/);
  assert.match(data.hero.scopeLabel, /阵容时期未确认/);
  const home = render();
  assert.match(home, /<figcaption>tripleS 日本官网团体资料照<\/figcaption>/);
  assert.doesNotMatch(home, /拍摄日期|阵容时期|核于/);
  for (const unit of model.triplesReviewDimensions) {
    const html = render({section: 'members', rosterView: 'units', unit: unit.key});
    assert.ok(html.includes(`data-unit-key="${unit.key}"`));
    assert.doesNotMatch(html, /review-evidence-note|不等同于逐支 MV|核于|拍摄日期/);
  }
});
