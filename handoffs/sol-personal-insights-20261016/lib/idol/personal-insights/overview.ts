import type {Work} from '../types';
import type {
  GroupRow, GroupSort, InsightOptions, PreparedCatalog, ScoreDomain,
  ScoreStats, WatchingStats,
} from './contract';
import {isStageEligible, validScore} from './score';

interface ScoreAccumulator {
  eligibleCount: number; ratedCount: number; sum: number; highCount: number;
  bins: number[]; missingCount: number; invalidCount: number; unqualifiedCount: number;
}
type ScoreObservation =
  | {kind: 'unqualified'} | {kind: 'missing'} | {kind: 'invalid'}
  | {kind: 'rated'; value: number};
interface GroupAccumulator {
  groupId: string; name: string; inputOrder: number; workCount: number;
  score: ScoreAccumulator;
}
function createScoreAccumulator(): ScoreAccumulator {
  return {eligibleCount: 0, ratedCount: 0, sum: 0, highCount: 0,
    bins: Array<number>(11).fill(0), missingCount: 0, invalidCount: 0, unqualifiedCount: 0};
}
function observeScore(
  work: Readonly<Work>, domain: ScoreDomain, options: InsightOptions,
): ScoreObservation {
  if (domain === 'stage' && !isStageEligible(work, options)) return {kind: 'unqualified'};
  const raw: unknown = domain === 'mv' ? work.score : work.stageScore;
  if (raw === null || raw === undefined) return {kind: 'missing'};
  const value = validScore(raw);
  return value === null ? {kind: 'invalid'} : {kind: 'rated', value};
}
function accumulateScore(a: ScoreAccumulator, observation: ScoreObservation): void {
  if (observation.kind === 'unqualified') {a.unqualifiedCount += 1; return;}
  a.eligibleCount += 1;
  if (observation.kind === 'missing') {a.missingCount += 1; return;}
  if (observation.kind === 'invalid') {a.invalidCount += 1; return;}
  const value = observation.value;
  a.ratedCount += 1;
  a.sum += value;
  if (value >= 9) a.highCount += 1;
  a.bins[value === 10 ? 10 : Math.floor(value)] += 1;
}
function finishScoreStats(a: ScoreAccumulator): ScoreStats {
  return {eligibleCount: a.eligibleCount, ratedCount: a.ratedCount,
    mean: a.ratedCount === 0 ? null : a.sum / a.ratedCount,
    highCount: a.highCount, bins: a.bins.slice(), missingCount: a.missingCount,
    invalidCount: a.invalidCount, unqualifiedCount: a.unqualifiedCount};
}
export function summarizeScores(
  works: readonly Readonly<Work>[], domain: ScoreDomain, options: InsightOptions = {},
): ScoreStats {
  const a = createScoreAccumulator();
  for (const work of works) accumulateScore(a, observeScore(work, domain, options));
  return finishScoreStats(a);
}
export function summarizeWatching(works: readonly Readonly<Work>[]): WatchingStats {
  let watched = 0, unwatched = 0, unmarked = 0, unknown = 0;
  for (const work of works) {
    if (work.watched === '已观看') watched += 1;
    else if (work.watched === '未观看') unwatched += 1;
    else if (work.watched === '') unmarked += 1;
    else unknown += 1;
  }
  const knownCount = watched + unwatched + unmarked;
  return {total: works.length, watched, unwatched, unmarked, unknown, knownCount,
    watchedRatio: knownCount === 0 ? null : watched / knownCount};
}
export function compareGroups(
  prepared: PreparedCatalog, domain: ScoreDomain, sort: GroupSort = 'mean',
  options: InsightOptions = {},
): GroupRow[] {
  const accumulators = new Map<string, GroupAccumulator>();
  let inputOrder = 0;
  for (const group of prepared.groups) {
    if (!accumulators.has(group.id)) accumulators.set(group.id,
      {groupId: group.id, name: group.name, inputOrder, workCount: 0,
        score: createScoreAccumulator()});
    inputOrder += 1;
  }
  const seenWorkIds = new Set<string>();
  for (const work of prepared.works) {
    if (seenWorkIds.has(work.id)) continue;
    seenWorkIds.add(work.id);
    const observation = observeScore(work, domain, options);
    for (const groupId of new Set(work.groupIds)) {
      const a = accumulators.get(groupId);
      if (!a) continue;
      a.workCount += 1;
      accumulateScore(a.score, observation);
    }
  }
  const rows: {row: GroupRow; inputOrder: number}[] = [];
  for (const a of accumulators.values()) {
    if (a.workCount === 0) continue;
    rows.push({inputOrder: a.inputOrder, row: {groupId: a.groupId, name: a.name,
      workCount: a.workCount, stats: finishScoreStats(a.score)}});
  }
  rows.sort((left, right) => {
    const a = left.row.stats, b = right.row.stats;
    let difference = 0;
    if (sort === 'samples') difference = b.ratedCount - a.ratedCount;
    else if (sort === 'high') difference = b.highCount - a.highCount;
    else {
      if (a.mean === null && b.mean !== null) return 1;
      if (a.mean !== null && b.mean === null) return -1;
      if (a.mean !== null && b.mean !== null) difference = b.mean - a.mean;
    }
    return difference || left.inputOrder - right.inputOrder;
  });
  return rows.map(({row}) => row);
}
