'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTimeline } = require('./timeline-test-loader.cjs');
const { validateTimeline, validateTimelineDate, safeTimelineSourceUrl } = loadTimeline('validate');
const baseline = require('./fixtures/timeline/synthetic-baseline.json');
const registry = require('./fixtures/timeline/synthetic-registry.json');
const clone = (value) => structuredClone(value);
function checkMutation(mutator) {
  const value = clone(baseline);
  mutator(value, value.events[0], value.events[0].sources[0]);
  const before = clone(value);
  const result = validateTimeline(value, registry);
  assert.equal(result.ok, false, JSON.stringify(value));
  assert.ok(result.issues.length > 0, 'rejection provides an inspectable diagnostic');
  for (const issue of result.issues) {
    assert.equal(typeof issue.path, 'string');
    assert.equal(typeof issue.code, 'string');
    assert.equal(typeof issue.message, 'string');
  }
  assert.deepEqual(value, before, 'validation cannot repair or mutate supplied evidence');
}
function deepFreeze(value) {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(deepFreeze); }
  return value;
}

test('exact shared-schema synthetic fixture validates without copying or mutating evidence', () => {
  const value = deepFreeze(clone(baseline));
  const context = deepFreeze(clone(registry));
  const before = JSON.stringify(value);
  const result = validateTimeline(value, context);
  assert.equal(result.ok, true, JSON.stringify(result.issues));
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.value, value);
  assert.equal(JSON.stringify(value), before);
});

test('real Gregorian dates reject overflow, year zero and precision/value disagreement', () => {
  const good = [
    ['0001', 'year'], ['9999', 'year'], ['2024-02', 'month'],
    ['2000-02-29', 'day'], ['2024-02-29', 'day'], ['1900-02-28', 'day'], ['2026-04-30', 'day'],
  ];
  const bad = [
    ['0000', 'year'], ['10000', 'year'], ['2026', 'day'], ['2026-03', 'year'],
    ['2026-03-01', 'month'], ['2026-00', 'month'], ['2026-13', 'month'],
    ['1900-02-29', 'day'], ['2100-02-29', 'day'], ['2023-02-29', 'day'],
    ['2026-04-31', 'day'], ['2026-02-30', 'day'], ['2026-01-00', 'day'],
    ['2026-1-01', 'day'], ['2026-01-1', 'day'], ['2026-01-01T00:00:00Z', 'day'],
  ];
  for (const [value, precision] of good) assert.equal(validateTimelineDate({value, precision}), true, value);
  for (const [value, precision] of bad) assert.equal(validateTimelineDate({value, precision}), false, value);
  for (const value of [null, undefined, '2026', [], {value: 2026, precision: 'year'}, {value: '2026', precision: 'century'}, ...['__proto__','constructor','toString'].map((precision) => ({value:'2026',precision})), {value: '2026', precision: 'year', effectiveAt: null}]) {
    assert.equal(validateTimelineDate(value), false, JSON.stringify(value));
  }
});

test('nullable date fields remain unknown rather than receiving invented day/month precision', () => {
  const value = clone(baseline);
  value.events[0].eventDate = null;
  value.events[0].announcementDate = null;
  value.events[0].sources[0].sourcePublishedAt = null;
  const result = validateTimeline(value, registry);
  assert.equal(result.ok, true, JSON.stringify(result.issues));
  assert.equal(result.value.events[0].eventDate, null);
  assert.equal(result.value.events[0].sources[0].sourcePublishedAt, null);
  for (const key of ['eventDate', 'announcementDate', 'plannedDate']) {
    checkMutation((timeline, event) => { event[key] = {value: '2026-02-30', precision: 'day'}; });
  }
  checkMutation((timeline, event, source) => { source.sourcePublishedAt = {value: '1900-02-29', precision: 'day'}; });
  checkMutation((timeline, event, source) => { source.checkedAt = '2026-02-30'; });
  checkMutation((timeline, event, source) => { source.checkedAt = '2026-10'; });
});

test('strict wire contract rejects unknown and missing fields at every object boundary', () => {
  checkMutation((timeline) => { timeline.effectiveAt = null; });
  checkMutation((timeline, event) => { event.synthetic = true; });
  checkMutation((timeline, event, source) => { source.official = true; });
  checkMutation((timeline, event) => { event.eventDate.extra = 'wrong'; });
  for (const key of Object.keys(baseline)) checkMutation((timeline) => { delete timeline[key]; });
  for (const key of Object.keys(baseline.events[0])) checkMutation((timeline, event) => { delete event[key]; });
  for (const key of Object.keys(baseline.events[0].sources[0])) checkMutation((timeline, event, source) => { delete source[key]; });
  checkMutation((timeline) => { timeline.schemaVersion = 2; });
  checkMutation((timeline) => { timeline.gaps = [null]; });
  checkMutation((timeline, event) => { event.eventType = 'graduation'; });
  checkMutation((timeline, event) => { event.status = 'complete'; });
  checkMutation((timeline, event) => { event.importance = 'normal'; });
  checkMutation((timeline, event) => { event.reviewStatus = 'published'; });
  checkMutation((timeline, event) => { event.title = ''; });
});

test('arrays are checked as arrays with string item types and exact identity guards', () => {
  for (const key of ['events', 'gaps']) checkMutation((timeline) => { timeline[key] = {}; });
  for (const key of ['memberIds', 'workIds', 'relatedEventIds', 'sources', 'holdReasons']) {
    checkMutation((timeline, event) => { event[key] = {}; });
  }
  for (const key of ['memberIds', 'workIds', 'relatedEventIds', 'holdReasons']) {
    checkMutation((timeline, event) => { event[key] = [42]; });
  }
  checkMutation((timeline, event) => { event.memberIds = ['recSyntheticMember', 'recSyntheticMember']; });
  checkMutation((timeline, event) => { event.workIds = ['recSyntheticWork', 'recSyntheticWork']; });
  checkMutation((timeline, event) => { event.sources = []; });
  checkMutation((timeline, event) => { event.sources = [null]; });
  checkMutation((timeline) => { timeline.events = [undefined]; });
  checkMutation((timeline) => { timeline.events = new Array(1); });
  checkMutation((timeline, event) => { event.eventDate = []; });
  checkMutation((timeline, event) => { event.sources = [[]]; });
  checkMutation((timeline, event) => { event.memberIds = new Array(1); });
  checkMutation((timeline, event) => { event.sources.push(clone(event.sources[0])); });
});

test('registry validates group slug and ownership, never guesses from names', () => {
  checkMutation((timeline) => { timeline.groupId = 'recUnknownGroup'; });
  checkMutation((timeline) => { timeline.slug = 'other-group'; });
  checkMutation((timeline, event) => { event.groupId = 'recSyntheticOtherGroup'; });
  checkMutation((timeline, event) => { event.memberIds = ['recUnknownMember']; });
  checkMutation((timeline, event) => { event.memberIds = ['recSyntheticOtherMember']; });
  checkMutation((timeline, event) => { event.workIds = ['recUnknownWork']; });
  checkMutation((timeline, event) => { event.workIds = ['recSyntheticOtherWork']; });
  checkMutation((timeline, event) => { event.memberIds = ['member-by-name']; });
  const noEntities = {groups: registry.groups};
  assert.equal(validateTimeline(clone(baseline), noEntities).ok, false, 'nonempty member/work IDs fail closed when registries were not delivered');
  const noLinks = clone(baseline);
  noLinks.events[0].memberIds = [];
  noLinks.events[0].workIds = [];
  assert.equal(validateTimeline(noLinks, noEntities).ok, true, 'unlinked event needs only group identity');
});

test('duplicate event IDs, broken relations and review hold contradictions fail closed', () => {
  checkMutation((timeline) => { timeline.events.push(clone(timeline.events[0])); });
  checkMutation((timeline, event) => { event.relatedEventIds = ['missing-event']; });
  checkMutation((timeline, event) => { event.relatedEventIds = [event.id]; });
  checkMutation((timeline, event) => { event.reviewStatus = 'hold'; event.holdReasons = []; });
  checkMutation((timeline, event) => { event.holdReasons = ['unresolved']; });
  const value = clone(baseline);
  value.events[0].reviewStatus = 'hold';
  value.events[0].holdReasons = ['合成测试：证据待核'];
  assert.equal(validateTimeline(value, registry).ok, true);
});

test('source links permit http(s) and reject script schemes, credentials and hidden controls', () => {
  for (const url of ['https://timeline-fixture.example/evidence?x=1#scope', 'http://timeline-fixture.example/evidence']) {
    assert.equal(safeTimelineSourceUrl(url), url);
  }
  for (const url of [null, 42, '', 'javascript:alert(1)', 'data:text/html,bad', 'ftp://timeline-fixture.example/evidence', '//timeline-fixture.example/evidence', 'https://', 'https://user:pass@timeline-fixture.example/evidence', 'https://timeline-fixture.example/\nattack', 'https://timeline-fixture.example/\tattack']) {
    assert.equal(safeTimelineSourceUrl(url), null, String(url));
  }
  checkMutation((timeline, event, source) => { source.url = 'javascript:alert(1)'; });
});

test('all six statuses are evidence states, independent of elapsed clock time', () => {
  for (const status of ['confirmed', 'announced', 'planned', 'postponed', 'cancelled', 'uncertain']) {
    const value = clone(baseline);
    value.events[0].status = status;
    value.events[0].plannedDate = {value: '2000-01-01', precision: 'day'};
    assert.equal(validateTimeline(value, registry).ok, true, status);
    assert.equal(value.events[0].status, status);
  }
});

test('malformed context entries fail closed without throwing or supplying name-based fallbacks', () => {
  for (const context of [null, {}, {groups: {}}, {groups: [null]}, {...clone(registry), groups: [...registry.groups, registry.groups[0]]}, {...clone(registry), members: [{id:'recSyntheticMember', groupIds:['recUnknownGroup']}]}]) {
    const result = validateTimeline(clone(baseline), context);
    assert.equal(result.ok,false);
    assert.ok(result.issues.length > 0);
  }
});

test('reusing a source for distinct stable events is allowed; local source IDs are not event identities', () => {
  const value = clone(baseline);
  value.events.push({...clone(value.events[0]), id:'synthetic-second-event', relatedEventIds:['synthetic-debut']});
  const result = validateTimeline(value,registry);
  assert.equal(result.ok,true,JSON.stringify(result.issues));
  assert.equal(result.value.events.length,2);
});
