import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeCatalog, validScore } from '../../lib/idol/personal-insights/index';
import {
  catalog, deepFreeze, group, member, rating, rawField, stage, work,
} from './fixtures';

type Stats = ReturnType<typeof analyzeCatalog>['mv'];
function assertStats(stats: Stats): void {
  assert.equal(stats.bins.length, 11);
  assert.ok(stats.bins.every((count) => Number.isInteger(count) && count >= 0));
  assert.equal(stats.bins.reduce((sum, count) => sum + count, 0), stats.ratedCount);
  assert.equal(stats.eligibleCount, stats.ratedCount + stats.missingCount + stats.invalidCount);
  assert.ok(stats.highCount >= 0 && stats.highCount <= stats.ratedCount);
  if (stats.ratedCount === 0) assert.equal(stats.mean, null);
  else {
    assert.ok(stats.mean !== null);
    assert.ok(Number.isFinite(stats.mean) && stats.mean >= 0 && stats.mean <= 10);
  }
}
function generator(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

test('deterministic generated catalogs satisfy count, range, and identity invariants', () => {
  const pool: unknown[] = [0, 1, 4.5, 8.99, 9, 10, null, undefined, NaN, -1, 11, '9'];
  for (let seed = 1; seed <= 48; seed += 1) {
    const random = generator(seed);
    const works = Array.from({ length: 48 }, (_, index) => {
      const item = work('seed-' + seed + '-work-' + index, {
        groupIds: index % 3 === 0 ? ['a', 'a', 'b'] : [index % 2 === 0 ? 'a' : 'b'],
        stage: index % 3 === 0 ? null : stage(),
        videoType: index % 2 === 0 ? 'TEST ONLY eligible' : 'TEST ONLY denied',
        watched: ['已观看', '未观看', '', '?'][random() % 4],
      });
      return rawField(rawField(item, 'score', pool[random() % pool.length]),
        'stageScore', pool[random() % pool.length]);
    });
    const input = deepFreeze(catalog({ groups: [group('b'), group('a')], works }));
    const snapshot = input.works.map((item) => ({
      id: item.id, score: item.score, stageScore: item.stageScore, groupIds: [...item.groupIds],
    }));
    const result = analyzeCatalog(input, {
      isStageScoreEligible: (item) => item.videoType === 'TEST ONLY eligible',
    });
    assert.equal(result.uniqueWorkCount, 48);
    assertStats(result.mv);
    assertStats(result.stage);
    assert.equal(result.mv.eligibleCount, 48);
    assert.equal(result.mv.unqualifiedCount, 0);
    assert.equal(result.stage.eligibleCount + result.stage.unqualifiedCount, 48);
    assert.equal(result.stage.eligibleCount, works.filter((item) => (
      item.stage !== null && item.videoType === 'TEST ONLY eligible'
    )).length);
    assert.equal(result.watching.total, 48);
    assert.equal(result.watching.total,
      result.watching.knownCount + result.watching.unknown);
    assert.equal(result.watching.knownCount,
      result.watching.watched + result.watching.unwatched + result.watching.unmarked);
    for (const row of [...result.mvGroups, ...result.stageGroups]) {
      assert.ok(row.workCount > 0 && row.workCount <= 48);
      assert.ok(row.stats.ratedCount <= row.workCount);
      assertStats(row.stats);
    }
    assert.deepEqual(result.stageRevisit.watchedUnrated, []);
    assert.deepEqual(input.works.map((item) => ({
      id: item.id, score: item.score, stageScore: item.stageScore, groupIds: [...item.groupIds],
    })), snapshot);
  }
});

test('score boundaries retain tiny positive values and distinguish bins immediately below 9 and 10', () => {
  const values = [0, Number.MIN_VALUE, 0.999999, 1, 8.999999, 9, 9.999999, 10];
  assert.equal(validScore(Number.MIN_VALUE), Number.MIN_VALUE);
  assert.equal(validScore(-Number.MIN_VALUE), null);
  assert.equal(validScore(10.000001), null);
  const result = analyzeCatalog(catalog({
    works: values.map((score, index) => work('boundary-' + index, { score })),
  }));
  assert.deepEqual(result.mv.bins, [3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 1]);
  assert.equal(result.mv.highCount, 3);
  assert.equal(result.mv.ratedCount, values.length);
});

test('permuting source works does not alter aggregate or per-group statistics', () => {
  const works = Array.from({ length: 33 }, (_, index) => work('permutation-' + index, {
    score: index % 11, stageScore: 10 - (index % 11), stage: stage(),
    groupIds: index % 3 === 0 ? ['a', 'b', 'a'] : [index % 2 === 0 ? 'a' : 'b'],
    watched: index % 2 === 0 ? '已观看' : '未观看',
  }));
  const make = (items: typeof works) => analyzeCatalog(deepFreeze(catalog({
    groups: [group('b'), group('a')], works: items,
  })), { isStageScoreEligible: () => true });
  const first = make(works);
  const second = make([...works].reverse());
  assert.deepEqual(second.watching, first.watching);
  assert.deepEqual(second.mv, first.mv);
  assert.deepEqual(second.stage, first.stage);
  const byId = (rows: typeof first.mvGroups) => [...rows].sort((a, b) => a.groupId.localeCompare(b.groupId));
  assert.deepEqual(byId(second.mvGroups), byId(first.mvGroups));
  assert.deepEqual(byId(second.stageGroups), byId(first.stageGroups));
});

test('relationship order and repeated identical links never pick an arbitrary ambiguous entity', () => {
  const run = (memberIds: string[], workIds: string[]) => analyzeCatalog(catalog({
    members: [member('a'), member('b')],
    works: [work('w1', { ratingIds: ['r'] }), work('w2', { ratingIds: ['r'] })],
    ratings: [rating('r', { memberIds, workIds, score: 0, stylingScore: 10 })],
  }));
  for (const [members, works] of [
    [['a', 'b'], ['w1']], [['b', 'a', 'b'], ['w1', 'w1']],
    [['a'], ['w1', 'w2']], [['a', 'a'], ['w2', 'w1', 'w2']],
  ]) {
    const result = run(members, works);
    assert.deepEqual(result.members.rows, []);
    assert.equal(result.members.excluded.ambiguousRelations, 1);
  }
  const unique = run(['a'], ['w1']);
  const repeated = run(['a', 'a', 'a'], ['w1', 'w1']);
  assert.deepEqual(repeated.members, unique.members);
  assert.equal(repeated.members.rows[0]?.performance.mean, 0);
  assert.equal(repeated.members.rows[0]?.styling.mean, 10);
});

test('one-sided rating associations are excluded even when the other direction is populated', () => {
  const noBacklink = analyzeCatalog(catalog({
    members: [member('a')], works: [work('w')],
    ratings: [rating('r', { memberIds: ['a'], workIds: ['w'], score: 10 })],
  }));
  assert.deepEqual(noBacklink.members.rows, []);
  assert.equal(noBacklink.members.excluded.unlinkedRatings, 1);
  const noForwardLink = analyzeCatalog(catalog({
    members: [member('a')], works: [work('w', { ratingIds: ['r'] })],
    ratings: [rating('r', { memberIds: ['a'], workIds: [], score: 10 })],
  }));
  assert.deepEqual(noForwardLink.members.rows, []);
  assert.equal(noForwardLink.members.excluded.missingRelations, 1);
});

test('5000 distinct synthetic works and ratings retain exact counts without a timing claim', () => {
  const works = Array.from({ length: 5000 }, (_, index) => work('scale-' + index, {
    score: index % 11,
    stageScore: index % 2 === 0 ? 10 : null,
    stage: index % 2 === 0 ? stage() : null,
    groupIds: index % 5 === 0 ? ['a', 'a', 'b'] : [index % 2 === 0 ? 'a' : 'b'],
    ratingIds: ['scale-rating-' + index],
    watched: ['已观看', '未观看', '', '?'][index % 4],
  }));
  const ratings = works.map((item, index) => rating('scale-rating-' + index, {
    memberIds: ['m'], workIds: [item.id], score: index % 11, stylingScore: 10 - (index % 11),
  }));
  const input = deepFreeze(catalog({
    groups: [group('b'), group('a')], members: [member('m', { favorite: 10 })], works, ratings,
  }));
  const result = analyzeCatalog(input, { isStageScoreEligible: () => true });
  assert.equal(result.uniqueWorkCount, 5000);
  assert.equal(result.mv.ratedCount, 5000);
  assert.equal(result.mv.mean, 24985 / 5000);
  assert.equal(result.mv.highCount, 908);
  assert.deepEqual(result.mv.bins, [455, 455, 455, 455, 455, 455, 454, 454, 454, 454, 454]);
  assert.equal(result.stage.eligibleCount, 2500);
  assert.equal(result.stage.unqualifiedCount, 2500);
  assert.equal(result.stage.mean, 10);
  assert.equal(result.stage.highCount, 2500);
  assert.deepEqual(result.stageRevisit.watchedUnrated, []);
  assert.deepEqual(result.watching, {
    total: 5000, watched: 1250, unwatched: 1250, unmarked: 1250, unknown: 1250,
    knownCount: 3750, watchedRatio: 1 / 3,
  });
  const row = result.members.rows[0];
  assert.ok(row);
  assert.equal(result.members.rows.length, 1);
  assert.equal(row.performance.sampleCount, 5000);
  assert.equal(row.performance.mean, 24985 / 5000);
  assert.equal(row.styling.sampleCount, 5000);
  assert.equal(row.styling.mean, 25015 / 5000);
  assert.equal(row.workIds.length, 5000);
  assert.equal(new Set(row.workIds).size, 5000);
  assert.equal(row.ratingIds.length, 5000);
  assert.equal(new Set(row.ratingIds).size, 5000);
});
