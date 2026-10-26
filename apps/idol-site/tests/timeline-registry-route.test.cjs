'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTimeline } = require('./timeline-test-loader.cjs');
const { readTimelineFilters, writeTimelineFilters } = loadTimeline('route');
const groups = require('../HANDOFF/artist-registry51.json');
const paths = groups.map(group => group.path);
const defaults = { type: 'all', importance: 'major', order: 'recent' };

test('all authoritative 51 paths accept only artist updates filter context (no page migration claim)', () => {
  assert.equal(paths.length, 51);
  for (const path of paths) assert.deepEqual(readTimelineFilters(path + '?section=updates', paths), { ok: true, filters: defaults });
});
test('rejects foreign paths, external URLs, duplicate sections and duplicate/invalid timeline fields', () => {
  for (const value of [
    '/artists/unknown?section=updates', '/?section=updates', '/artists/meovv?section=overview',
    '//evil.example/artists/meovv?section=updates', 'https://evil.example/artists/meovv?section=updates',
    '/artists/meovv?section=updates&section=updates', '/artists/meovv?section=updates&timelineType=release&timelineType=members',
    '/artists/meovv?section=updates&timelineOrder=invalid', '/artists/meovv?section=updates&timelineImportance=',
    '/artists/meovv?section=updates&timelineType=all&timelineType=all', '/artists/meovv?section=updates&timelineType=release%0A',
  ]) assert.equal(readTimelineFilters(value, paths).ok, false, value);
});
test('roundtrip preserves roster, q, queue, format and event hash; omits defaults', () => {
  const start = '/artists/loona?section=updates&roster=history&q=synthetic&queue=tonight&format=stage#timeline-event-x';
  const custom = { type: 'members', importance: 'all', order: 'earliest' };
  const output = writeTimelineFilters(start, custom, paths);
  assert.deepEqual(readTimelineFilters(output, paths), { ok: true, filters: custom });
  const url = new URL(output, 'https://fixture.invalid');
  for (const [key, val] of [['roster', 'history'], ['q', 'synthetic'], ['queue', 'tonight'], ['format', 'stage']]) assert.equal(url.searchParams.get(key), val);
  assert.equal(url.hash, '#timeline-event-x');
  assert.equal(writeTimelineFilters(output, defaults, paths), start);
});
test('serializer refuses invalid input instead of rewriting it', () => {
  assert.equal(writeTimelineFilters('/artists/meovv?section=updates&timelineOrder=bad', defaults, paths), null);
  assert.equal(writeTimelineFilters('/artists/meovv?section=updates', { ...defaults, type: 'bad' }, paths), null);
});
test('registry has no production events or implicit identities; all 51 known groups are honest empty states when injected', () => {
  const { getArtistTimeline } = loadTimeline('registry');
  assert.deepEqual(getArtistTimeline('recUnknown'), { state: 'unknown', timeline: null, issues: [] });
  const registry = Object.freeze({ groups: Object.freeze(groups.map(row => Object.freeze({ groupId: row.groupId, slug: row.slug }))) });
  for (const group of groups) {
    const result = getArtistTimeline(group.groupId, registry);
    assert.equal(result.state, 'empty');
    assert.deepEqual(result.timeline.events, []);
    assert.deepEqual(result.timeline.gaps, ['已核事件待整理']);
    assert.equal(result.timeline.slug, group.slug);
  }
});
test('registry separates malformed documents from absent data and ignores inherited document keys', () => {
  const { getArtistTimeline } = loadTimeline('registry');
  const group = groups[0];
  assert.equal(getArtistTimeline(group.groupId, { groups, timelines: { [group.groupId]: {} } }).state, 'invalid');
  assert.equal(getArtistTimeline(group.groupId, { groups, timelines: Object.create({ [group.groupId]: {} }) }).state, 'empty');
});
test('registry empty path rejects malformed or ambiguous identity registries without throwing', () => {
  const { getArtistTimeline } = loadTimeline('registry');
  for (const registry of [null, {}, { groups: [null] }, { groups: [{ groupId: 'recGroup', slug: 'BAD' }] },
    { groups: [{ groupId: 'recGroup', slug: 'one' }, { groupId: 'recGroup', slug: 'two' }] }]) {
    assert.equal(getArtistTimeline('recGroup', registry).state, 'invalid');
  }
});
