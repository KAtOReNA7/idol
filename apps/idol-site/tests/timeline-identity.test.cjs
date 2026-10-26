'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadTimeline } = require('./timeline-test-loader.cjs');
const { createTimelineIdentityContext, getTimelineIdentityUsability } = loadTimeline('identity');
const { prepareTimelinePresentation } = loadTimeline('presentation');
const { validateTimeline } = loadTimeline('validate');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/timeline/synthetic-baseline.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/timeline/synthetic-registry.json'), 'utf8'));
const groups = registry.groups;
const groupId = baseline.groupId;
const otherGroupId = groups[1].groupId;
function copy(value) { return structuredClone(value); }
function catalog() { return { members: copy(registry.members), works: copy(registry.works) }; }
function emptyReferences() {
  const value = copy(baseline);
  value.events[0].memberIds = [];
  value.events[0].workIds = [];
  return value;
}
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

test('identity adapter retains stable current + former union without changing Catalog objects', () => {
  const input = catalog();
  input.members[0].groupIds = [otherGroupId, otherGroupId];
  input.members[0].formerGroupIds = [groupId, otherGroupId, groupId];
  input.works[0].formerGroupIds = [otherGroupId]; // Works never use historical groups.
  const before = copy(input);
  deepFreeze(input);
  const adapter = createTimelineIdentityContext(input, groups);
  assert.deepEqual(adapter.context.members[0].groupIds, [otherGroupId, groupId]);
  assert.deepEqual(adapter.context.works[0].groupIds, [groupId]);
  const former = getTimelineIdentityUsability(adapter, 'member', registry.members[0].id, groupId);
  assert.equal(former.usable, true);
  assert.deepEqual(former.currentGroupIds, [otherGroupId]);
  assert.deepEqual(former.formerGroupIds, [groupId, otherGroupId]);
  assert.deepEqual(input, before);
});

test('former member association validates without rewriting timeline references or facts', () => {
  const input = copy(baseline);
  const identities = catalog();
  identities.members[0].groupIds = [otherGroupId];
  identities.members[0].formerGroupIds = [groupId];
  const before = copy(input);
  deepFreeze(input);
  const prepared = prepareTimelinePresentation(input, identities, groups);
  assert.equal(prepared.state, 'ready');
  assert.equal(prepared.timeline, input);
  assert.equal(prepared.strictAudit.ok, true);
  assert.deepEqual(input, before);
});

test('unknown member keeps all wire facts and safe work links while disabling unknown navigation', () => {
  const input = copy(baseline);
  input.events[0].memberIds.push('recSyntheticMissingMember');
  const prepared = prepareTimelinePresentation(input, catalog(), groups);
  assert.equal(prepared.state, 'context-unavailable');
  assert.equal(prepared.timeline, input);
  assert.equal(prepared.strictAudit.ok, false);
  assert.equal(prepared.identityIssues.length, 1);
  assert.equal(prepared.identityIssues[0].targetId, 'recSyntheticMissingMember');
  assert.equal(prepared.identityIssues[0].reason, 'missing');
  assert.equal(prepared.timeline.events[0].sources, input.events[0].sources);
  assert.equal(getTimelineIdentityUsability(prepared.identity, 'work', registry.works[0].id, groupId).usable, true);
});

test('cross-group references never navigate, even if the stable ID is known', () => {
  const input = copy(baseline);
  input.events[0].memberIds = [registry.members[1].id];
  input.events[0].workIds = [registry.works[1].id];
  const prepared = prepareTimelinePresentation(input, catalog(), groups);
  assert.equal(prepared.state, 'context-unavailable');
  assert.deepEqual(prepared.identityIssues.map(issue => issue.reason), ['wrong-group', 'wrong-group']);
  assert.equal(prepared.timeline, input);
});

test('partial Catalog and missing work identity are context-unavailable, not invalid facts', () => {
  const partial = { members: copy(registry.members), works: [] };
  const prepared = prepareTimelinePresentation(baseline, partial, groups);
  assert.equal(prepared.state, 'context-unavailable');
  assert.equal(prepared.identityIssues[0].kind, 'work');
  const missingCollection = prepareTimelinePresentation(baseline, { members: copy(registry.members) }, groups);
  assert.equal(missingCollection.state, 'context-unavailable');
  assert.equal(missingCollection.timeline, baseline);
});

test('identical duplicate membership identities dedup without a strict registry error', () => {
  const input = catalog();
  input.members[0].formerGroupIds = [otherGroupId];
  input.members.push({ ...input.members[0], groupIds: [groupId, groupId], formerGroupIds: [otherGroupId, otherGroupId] });
  input.works.push(copy(input.works[0]));
  const adapter = createTimelineIdentityContext(input, groups);
  assert.equal(adapter.context.members.length, 2);
  assert.equal(adapter.context.works.length, 2);
  assert.equal(adapter.conflicts.length, 0);
  assert.equal(validateTimeline(baseline, adapter.context).ok, true);
});

test('conflicting duplicate member IDs fail closed rather than union contradictory records', () => {
  const input = catalog();
  input.members.push({ ...input.members[0], groupIds: [otherGroupId] });
  const prepared = prepareTimelinePresentation(baseline, input, groups);
  assert.equal(prepared.state, 'context-unavailable');
  assert.equal(prepared.identity.conflicts.length, 1);
  assert.equal(prepared.identityIssues[0].reason, 'conflict');
  assert.equal(prepared.identity.context.members.some(member => member.id === registry.members[0].id), false);
  assert.deepEqual(prepared.identity.members.get(registry.members[0].id).groupIds, []);
});

test('current-versus-former disagreement is a conflict even when the overall union matches', () => {
  const input = catalog();
  input.members[0].formerGroupIds = [otherGroupId];
  input.members.push({ ...input.members[0], groupIds: [otherGroupId], formerGroupIds: [groupId] });
  const adapter = createTimelineIdentityContext(input, groups);
  assert.equal(getTimelineIdentityUsability(adapter, 'member', registry.members[0].id, groupId).reason, 'conflict');
});

test('conflicting duplicate work IDs fail closed and unrelated conflicts do not hide ready facts', () => {
  const input = catalog();
  input.works.push({ ...input.works[0], groupIds: [otherGroupId] });
  assert.equal(prepareTimelinePresentation(baseline, input, groups).identityIssues[0].reason, 'conflict');
  const noWorkRefs = copy(baseline);
  noWorkRefs.events[0].workIds = [];
  assert.equal(prepareTimelinePresentation(noWorkRefs, input, groups).state, 'ready');
});

test('loading, legal empty, invalid schema, unavailable identity and ready are distinct', () => {
  assert.equal(prepareTimelinePresentation(undefined, null, groups).state, 'loading');
  assert.equal(prepareTimelinePresentation(null, catalog(), groups).state, 'loading');
  const loading = prepareTimelinePresentation(baseline, null, groups);
  assert.equal(loading.state, 'loading');
  assert.equal(loading.timeline, baseline);
  const empty = { ...copy(baseline), events: [] };
  assert.equal(prepareTimelinePresentation(empty, catalog(), groups).state, 'empty');
  assert.equal(prepareTimelinePresentation({ ...baseline, custom: true }, catalog(), groups).state, 'invalid');
  assert.equal(prepareTimelinePresentation(baseline, { members: [], works: [] }, groups).state, 'context-unavailable');
  assert.equal(prepareTimelinePresentation(baseline, catalog(), groups).state, 'ready');
});

test('structural invalidity never bypasses audit merely because Catalog is missing', () => {
  const cases = [
    value => { value.events[0].eventDate = { value: '2023-02-29', precision: 'day' }; },
    value => { value.events[0].sources[0].url = 'javascript:alert(1)'; },
    value => { value.events[0].memberIds.push(value.events[0].memberIds[0]); },
    value => { value.events[0].workIds.push('bad-id'); },
    value => { value.events[0].relatedEventIds = ['missing-related-event']; },
    value => { value.slug = 'wrong-slug'; },
  ];
  for (const mutate of cases) {
    const input = copy(baseline);
    mutate(input);
    const prepared = prepareTimelinePresentation(input, null, groups);
    assert.equal(prepared.state, 'invalid');
    assert.equal(prepared.timeline, null);
    assert.equal(prepared.strictAudit.ok, false);
  }
});

test('hold-only identity issues preserve strict audit without blocking ready facts or copying held titles', () => {
  const input = copy(baseline);
  const held = { ...copy(input.events[0]), id: 'synthetic-held-secret', title: '合成待核标题：不得呈现断言', reviewStatus: 'hold', holdReasons: ['合成：待核身份'], memberIds: ['recSyntheticUnknownHeldMember'], workIds: ['recSyntheticUnknownHeldWork'] };
  input.events.push(held);
  const prepared = prepareTimelinePresentation(input, catalog(), groups);
  assert.equal(prepared.state, 'ready');
  assert.equal(prepared.strictAudit.ok, false);
  assert.equal(prepared.heldIdentityIssueCount, 2);
  assert.deepEqual(prepared.identityIssues, []);
  assert.equal(JSON.stringify(prepared.identityIssues).includes(held.title), false);
  assert.equal(JSON.stringify(prepared.issues).includes(held.title), false);
  assert.equal(prepared.timeline, input);
  const onlyHeld = { ...input, events: [held] };
  assert.equal(prepareTimelinePresentation(onlyHeld, catalog(), groups).state, 'empty');
});

test('all known public groups come from caller registry; unknown membership is not inferred', () => {
  const input = catalog();
  input.members[0].formerGroupIds = ['recUnknownGroup'];
  const prepared = prepareTimelinePresentation(baseline, input, groups);
  assert.equal(prepared.state, 'context-unavailable');
  assert.equal(prepared.identityIssues[0].reason, 'unknown-group');
  const invalidGroup = { ...copy(baseline), groupId: 'recUnknownGroup' };
  assert.equal(prepareTimelinePresentation(invalidGroup, input, groups).state, 'invalid');
});

test('membership-free facts remain ready with an empty loaded Catalog and never strip full ID fields', () => {
  const input = emptyReferences();
  const prepared = prepareTimelinePresentation(input, { members: [], works: [] }, groups);
  assert.equal(prepared.state, 'ready');
  assert.deepEqual(Object.keys(prepared.timeline.events[0]), Object.keys(baseline.events[0]));
  assert.equal(getTimelineIdentityUsability(prepared.identity, 'member', 'recUnknown', groupId).usable, false);
});
