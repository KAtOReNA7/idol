import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeCatalog, compareGroups, isStageEligible, prepareCatalog, validScore,
} from '../../lib/idol/personal-insights/index';
import {
  catalog, deepFreeze, forbidRead, group, member, rating, rawField, stage, work,
} from './fixtures';

function close(actual: number | null, expected: number): void {
  assert.ok(actual !== null, 'expected a numeric mean, received null');
  assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' differs from ' + expected);
}
function sorted(values: readonly string[]): string[] { return [...values].sort(); }

test('validScore preserves zero and accepts only finite numeric values in [0,10]', () => {
  for (const value of [0, 0.25, 8.99, 9, 9.5, 10]) assert.equal(validScore(value), value);
  assert.equal(validScore(-0) === 0, true);
  const hostileObject = { valueOf() { throw new Error('must not coerce'); } };
  for (const value of [
    null, undefined, NaN, Infinity, -Infinity, -0.001, 10.001,
    '0', '9', '', true, false, [], [9], {}, hostileObject,
  ]) assert.equal(validScore(value), null);
});

test('MV statistics distinguish missing and invalid fields and use floor bins', () => {
  const values: unknown[] = [0, 10, 9.5, 8.99, null, undefined, NaN, -1, 11, '7', Infinity];
  const input = deepFreeze(catalog({
    works: values.map((value, index) => rawField(work('score-' + index), 'score', value)),
  }));
  const result = analyzeCatalog(input);
  assert.equal(result.uniqueWorkCount, 11);
  assert.deepEqual(result.mv, {
    eligibleCount: 11, ratedCount: 4, mean: (0 + 10 + 9.5 + 8.99) / 4, highCount: 2,
    bins: [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    missingCount: 2, invalidCount: 5, unqualifiedCount: 0,
  });
  assert.equal(result.stage.eligibleCount, 0);
  assert.equal(result.stage.ratedCount, 0);
  assert.equal(result.stage.mean, null);
  assert.equal(result.stage.unqualifiedCount, 11);
});

test('MV and stage have separate scores; stage requires a stage and exact adapter approval', () => {
  const approved = work('approved', { score: 0, stageScore: 10, stage: stage() });
  const approvedZero = work('approved-zero', { score: 10, stageScore: 0, stage: stage() });
  const denied = work('denied', { score: null, stageScore: 9, stage: stage() });
  const absent = work('absent', { score: 9, stageScore: 9 });
  const input = catalog({ works: [approved, approvedZero, denied, absent] });
  const options = { isStageScoreEligible: (item: Readonly<typeof approved>) => item.id !== 'denied' };
  assert.equal(isStageEligible(approved), false);
  assert.equal(isStageEligible(approved, options), true);
  assert.equal(isStageEligible(denied, options), false);
  assert.equal(isStageEligible(absent, options), false);
  const truthyAdapter = { isStageScoreEligible: () => true };
  Object.defineProperty(truthyAdapter, 'isStageScoreEligible', { value: () => 'yes' });
  assert.equal(isStageEligible(approved, truthyAdapter), false);
  const result = analyzeCatalog(input, options);
  close(result.mv.mean, 19 / 3);
  assert.equal(result.mv.ratedCount, 3);
  assert.equal(result.mv.missingCount, 1);
  assert.equal(result.stage.eligibleCount, 2);
  assert.equal(result.stage.unqualifiedCount, 2);
  assert.equal(result.stage.ratedCount, 2);
  assert.equal(result.stage.mean, 5);
  assert.equal(result.stage.highCount, 1);
  assert.equal(result.stage.bins[0], 1);
  assert.equal(result.stage.bins[10], 1);
  assert.equal(analyzeCatalog(input).stage.unqualifiedCount, 4);
});

test('a throwing stage adapter fails closed without throwing from analysis', () => {
  const item = work('adapter-throws', { stage: stage(), stageScore: 10 });
  const options = { isStageScoreEligible: () => { throw new Error('TEST ONLY adapter failure'); } };
  assert.equal(isStageEligible(item, options), false);
  const result = analyzeCatalog(catalog({ works: [item] }), options);
  assert.equal(result.stage.eligibleCount, 0);
  assert.equal(result.stage.unqualifiedCount, 1);
  assert.deepEqual(result.stageRevisit.highRated, []);
});

test('ineligible stage scores never enter missing or invalid counts', () => {
  const input = catalog({ works: [
    rawField(work('valid-stage', { stage: stage(), stageScore: 0 }), 'score', undefined),
    rawField(work('missing-stage-score', { stage: stage() }), 'stageScore', undefined),
    rawField(work('invalid-stage-score', { stage: stage() }), 'stageScore', '9'),
    rawField(work('unqualified-invalid', { stage: stage() }), 'stageScore', NaN),
    rawField(work('unqualified-missing'), 'stageScore', undefined),
  ] });
  const result = analyzeCatalog(input, {
    isStageScoreEligible: (item) => !item.id.startsWith('unqualified'),
  });
  assert.deepEqual(result.stage, {
    eligibleCount: 3, ratedCount: 1, mean: 0, highCount: 0,
    bins: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    missingCount: 1, invalidCount: 1, unqualifiedCount: 2,
  });
  assert.equal(result.mv.missingCount, 5);
});

test('multi-group works count once globally and once per distinct canonical group', () => {
  const input = deepFreeze(catalog({
    groups: [group('b'), group('a'), group('c')],
    works: [
      work('both', { groupIds: ['a', 'a', 'b'], score: 0 }),
      work('a-only', { groupIds: ['a'], score: 10 }),
      work('b-only', { groupIds: ['b'], score: 9 }),
      work('unrated', { groupIds: ['c'], score: null }),
    ],
  }));
  const result = analyzeCatalog(input);
  assert.equal(result.uniqueWorkCount, 4);
  assert.equal(result.mv.ratedCount, 3);
  close(result.mv.mean, 19 / 3);
  const a = result.mvGroups.find((item) => item.groupId === 'a');
  const b = result.mvGroups.find((item) => item.groupId === 'b');
  const c = result.mvGroups.find((item) => item.groupId === 'c');
  assert.ok(a && b && c);
  assert.equal(a.workCount, 2);
  assert.equal(a.stats.mean, 5);
  assert.equal(b.workCount, 2);
  assert.equal(b.stats.mean, 4.5);
  assert.equal(c.workCount, 1);
  assert.equal(c.stats.ratedCount, 0);
  assert.equal(c.stats.mean, null);
  const prepared = prepareCatalog(input);
  assert.deepEqual(compareGroups(prepared, 'mv').map((item) => item.groupId), ['a', 'b', 'c']);
  assert.deepEqual(compareGroups(prepared, 'mv', 'samples').map((item) => item.groupId), ['b', 'a', 'c']);
  assert.deepEqual(compareGroups(prepared, 'mv', 'high').map((item) => item.groupId), ['b', 'a', 'c']);
  assert.deepEqual(compareGroups(prepared, 'stage').map((item) => item.groupId), ['b', 'a', 'c']);
});

test('watch states use exact source strings and an honest known-state denominator', () => {
  const states: unknown[] = ['已观看', '未观看', '', 'unknown', '已观看 ', undefined];
  const result = analyzeCatalog(catalog({
    works: states.map((value, index) => rawField(work('watch-' + index), 'watched', value)),
  }));
  assert.deepEqual(result.watching, {
    total: 6, watched: 1, unwatched: 1, unmarked: 1, unknown: 3,
    knownCount: 3, watchedRatio: 1 / 3,
  });
  const unknownOnly = analyzeCatalog(catalog({ works: [work('unknown', { watched: '?' })] }));
  assert.equal(unknownOnly.watching.knownCount, 0);
  assert.equal(unknownOnly.watching.watchedRatio, null);
});

test('revisit lists preserve versions, use raw null for MV pending reviews, and never infer stage watching', () => {
  const input = catalog({ works: [
    work('original', { name: 'TEST ONLY Echo', version: 'original', score: 9, watched: '未观看' }),
    work('dance', { name: 'TEST ONLY Echo', version: 'dance', score: 10, watched: '' }),
    work('waiting', { score: null, watched: '已观看', stage: stage(), stageScore: 9 }),
    rawField(work('undefined', { watched: '已观看', stage: stage(), stageScore: 10 }), 'score', undefined),
    rawField(work('invalid', { watched: '已观看' }), 'score', NaN),
    work('zero', { score: 0, watched: '已观看' }),
    work('unwatched-null', { score: null, watched: '未观看' }),
  ] });
  const result = analyzeCatalog(input, { isStageScoreEligible: () => true });
  assert.deepEqual(sorted(result.mvRevisit.highRated.map((item) => item.workId)), ['dance', 'original']);
  const originals = new Map(result.mvRevisit.highRated.map((item) => [item.workId, item]));
  assert.deepEqual(originals.get('original'), {
    workId: 'original', name: 'TEST ONLY Echo', version: 'original', score: 9, reason: 'high-score',
  });
  assert.deepEqual(originals.get('dance'), {
    workId: 'dance', name: 'TEST ONLY Echo', version: 'dance', score: 10, reason: 'high-score',
  });
  assert.deepEqual(result.mvRevisit.watchedUnrated.map((item) => ({
    workId: item.workId, score: item.score, reason: item.reason,
  })), [{ workId: 'waiting', score: null, reason: 'watched-unrated' }]);
  assert.deepEqual(sorted(result.stageRevisit.highRated.map((item) => item.workId)), ['undefined', 'waiting']);
  assert.deepEqual(result.stageRevisit.watchedUnrated, []);
  assert.equal(result.mv.missingCount, 3);
  assert.equal(result.mv.invalidCount, 1);
});

test('member axes have independent denominators; all-invalid records remain diagnosed', () => {
  const works = [
    work('w1', { ratingIds: ['r1'] }), work('w2', { ratingIds: ['r2'] }),
    work('w3', { ratingIds: ['r3'] }), work('w4', { ratingIds: ['r4'] }),
    work('w5', { ratingIds: ['empty'] }), work('w6', { ratingIds: ['invalid'] }),
    work('w7', { ratingIds: ['undefined-empty'] }),
    work('wa', { ratingIds: ['ambiguous'] }), work('wm', { ratingIds: ['missing-member'] }),
  ];
  const result = analyzeCatalog(deepFreeze(catalog({
    members: [member('a', { favorite: 10 }), member('b', { favorite: 0 })],
    works,
    ratings: [
      rating('r1', { memberIds: ['a', 'a'], workIds: ['w1', 'w1'], score: 0, stylingScore: 10 }),
      rating('r2', { memberIds: ['a'], workIds: ['w2'], score: 10, stylingScore: 0 }),
      rating('r3', { memberIds: ['b'], workIds: ['w3'], score: null, stylingScore: 0 }),
      rawField(rating('r4', { memberIds: ['a'], workIds: ['w4'], stylingScore: 8 }), 'score', NaN),
      rating('empty', { memberIds: ['a'], workIds: ['w5'] }),
      rating('invalid', { memberIds: ['a'], workIds: ['w6'], score: 11, stylingScore: null }),
      rawField(rating('undefined-empty', { memberIds: ['a'], workIds: ['w7'] }), 'score', undefined),
      rating('ambiguous', { memberIds: ['a', 'b'], workIds: ['wa'], score: 10 }),
      rating('missing-member', { memberIds: ['absent'], workIds: ['wm'], score: 10 }),
      rating('missing-work', { memberIds: ['a'], workIds: ['absent'], score: 10 }),
      rating('unlinked', { memberIds: ['a'], workIds: ['w1'], score: 10 }),
    ],
  })));
  assert.equal(result.members.rows.length, 2);
  const a = result.members.rows.find((item) => item.memberId === 'a');
  const b = result.members.rows.find((item) => item.memberId === 'b');
  assert.ok(a && b);
  assert.deepEqual(a.performance, { sampleCount: 2, mean: 5, invalidCount: 2 });
  assert.deepEqual(a.styling, { sampleCount: 3, mean: 6, invalidCount: 0 });
  assert.deepEqual(sorted(a.workIds), ['w1', 'w2', 'w4']);
  assert.deepEqual(sorted(a.ratingIds), ['r1', 'r2', 'r4']);
  assert.deepEqual(b.performance, { sampleCount: 0, mean: null, invalidCount: 0 });
  assert.deepEqual(b.styling, { sampleCount: 1, mean: 0, invalidCount: 0 });
  assert.deepEqual(result.members.excluded, {
    ambiguousRelations: 1, missingRelations: 2, unlinkedRatings: 1,
    emptyScores: 2, invalidScores: 1,
  });
});

test('duplicate IDs are quarantined; raw placeholder diagnostics may overlap duplicate records', () => {
  const hidden = { reason: 'TEST ONLY placeholder', originalRow: 42, verifiedAt: '2026-10-16' };
  const result = analyzeCatalog(catalog({
    groups: [group('dup-group'), group('dup-group'), group('g'), group('')],
    members: [member('dup-member'), member('dup-member'), member('m'), member('\t')],
    works: [
      work('dup-work', { score: 10 }), work('dup-work', { score: 0 }),
      work('dup-hidden', { placeholder: hidden }), work('dup-hidden', { placeholder: hidden }),
      work('placeholder', { placeholder: hidden }),
      work(' kept ', { groupIds: ['g'], score: 0, ratingIds: ['r'] }),
      work(' ', { score: 10 }),
    ],
    ratings: [
      rating('dup-rating', { score: 10 }), rating('dup-rating', { score: 0 }),
      rating('r', { memberIds: ['m'], workIds: [' kept '], score: 0 }),
      rating('  '),
    ],
  }));
  assert.equal(result.uniqueWorkCount, 1);
  assert.equal(result.mv.ratedCount, 1);
  assert.equal(result.mv.mean, 0);
  assert.deepEqual(result.members.rows.map((item) => item.memberId), ['m']);
  assert.deepEqual(result.members.rows[0]?.workIds, [' kept ']);
  assert.deepEqual(sorted(result.diagnostics.duplicateWorkIds), ['dup-hidden', 'dup-work']);
  assert.deepEqual(result.diagnostics.duplicateGroupIds, ['dup-group']);
  assert.deepEqual(result.diagnostics.duplicateMemberIds, ['dup-member']);
  assert.deepEqual(result.diagnostics.duplicateRatingIds, ['dup-rating']);
  assert.deepEqual(result.diagnostics.emptyIds, { works: 1, groups: 1, members: 1, ratings: 1 });
  // This diagnostic counts raw records, independently of identity quarantine.
  assert.equal(result.diagnostics.placeholderCount, 3);
});

test('a duplicated group or member is not selected arbitrarily for a canonical relationship', () => {
  const result = analyzeCatalog(catalog({
    groups: [group('g', { name: 'TEST ONLY first' }), group('g', { name: 'TEST ONLY second' })],
    members: [member('m'), member('m')],
    works: [work('w', { groupIds: ['g'], ratingIds: ['r'], score: 9 })],
    ratings: [rating('r', { memberIds: ['m'], workIds: ['w'], score: 10 })],
  }));
  assert.equal(result.uniqueWorkCount, 1);
  assert.deepEqual(result.mvGroups, []);
  assert.deepEqual(result.members.rows, []);
  assert.equal(result.members.excluded.missingRelations, 1);
});

test('empty catalogs produce zeros and null means without invented comparisons', () => {
  const result = analyzeCatalog(deepFreeze(catalog()));
  assert.equal(result.uniqueWorkCount, 0);
  assert.deepEqual(result.watching, {
    total: 0, watched: 0, unwatched: 0, unmarked: 0, unknown: 0,
    knownCount: 0, watchedRatio: null,
  });
  for (const stats of [result.mv, result.stage]) {
    assert.deepEqual(stats, {
      eligibleCount: 0, ratedCount: 0, mean: null, highCount: 0,
      bins: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      missingCount: 0, invalidCount: 0, unqualifiedCount: 0,
    });
  }
  assert.deepEqual(result.mvGroups, []);
  assert.deepEqual(result.stageGroups, []);
  assert.deepEqual(result.members, {
    rows: [],
    excluded: { ambiguousRelations: 0, missingRelations: 0, unlinkedRatings: 0, emptyScores: 0, invalidScores: 0 },
  });
  assert.deepEqual(result.mvRevisit, { highRated: [], watchedUnrated: [] });
  assert.deepEqual(result.stageRevisit, { highRated: [], watchedUnrated: [] });
});

test('frozen inputs remain intact and refreshing a catalog recomputes the same IDs', () => {
  const original = deepFreeze(catalog({
    groups: [group('g')],
    works: [work('same', { groupIds: ['g'], score: 0, watched: '未观看' })],
  }));
  const before = JSON.stringify(original);
  const worksReference = original.works;
  const workReference = original.works[0];
  const first = analyzeCatalog(original);
  const prepared = prepareCatalog(original);
  compareGroups(prepared, 'mv', 'high');
  assert.equal(JSON.stringify(original), before);
  assert.equal(original.works, worksReference);
  assert.equal(original.works[0], workReference);
  const refreshed = deepFreeze(catalog({
    groups: [group('g')],
    works: [work('same', { groupIds: ['g'], score: 10, watched: '已观看' })],
  }));
  const second = analyzeCatalog(refreshed);
  assert.equal(first.mv.mean, 0);
  assert.equal(second.mv.mean, 10);
  assert.equal(first.watching.watched, 0);
  assert.equal(second.watching.watched, 1);
  assert.equal(analyzeCatalog(original).mv.mean, 0);
});

test('analysis never reads personal notes, memories, profiles, favorites, or sources', () => {
  const input = catalog({
    groups: [group('g')], members: [member('m')],
    works: [work('w', { groupIds: ['g'], ratingIds: ['r'], score: 0, stage: stage(), stageScore: 10 })],
    ratings: [rating('r', { memberIds: ['m'], workIds: ['w'], score: 0, stylingScore: 10 })],
  });
  for (const item of input.groups) forbidRead(item, ['note']);
  for (const item of input.members) forbidRead(item, ['note', 'profile', 'favorite']);
  for (const item of input.works) forbidRead(item, ['note', 'source']);
  for (const item of input.ratings) forbidRead(item, ['note', 'memory', 'source']);
  const result = analyzeCatalog(deepFreeze(input), { isStageScoreEligible: () => true });
  assert.equal(result.mv.mean, 0);
  assert.equal(result.stage.mean, 10);
  assert.equal(result.members.rows[0]?.performance.mean, 0);
  assert.equal(result.members.rows[0]?.styling.mean, 10);
});
