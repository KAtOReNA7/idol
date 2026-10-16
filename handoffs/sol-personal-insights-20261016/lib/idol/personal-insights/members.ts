import type {MemberAnalysis, MemberRow, MetricStats, PreparedCatalog} from './contract';
import {validScore} from './score';

interface MetricAccumulator {sampleCount: number; sum: number; invalidCount: number;}
interface MemberAccumulator {
  performance: MetricAccumulator; styling: MetricAccumulator;
  ratingIds: Set<string>; workIds: Set<string>;
}
function createMetric(): MetricAccumulator {return {sampleCount: 0, sum: 0, invalidCount: 0};}
function accumulate(metric: MetricAccumulator, raw: unknown): number | null {
  const score = validScore(raw);
  if (score !== null) {metric.sampleCount += 1; metric.sum += score;}
  else if (raw !== null && raw !== undefined) metric.invalidCount += 1;
  return score;
}
function summarizeMetric(m: MetricAccumulator): MetricStats {
  return {sampleCount: m.sampleCount, mean: m.sampleCount > 0 ? m.sum / m.sampleCount : null,
    invalidCount: m.invalidCount};
}
/** Count individual Rating records only after unambiguous, reciprocal linkage. */
export function summarizeMembers(prepared: PreparedCatalog): MemberAnalysis {
  const excluded: MemberAnalysis['excluded'] =
    {ambiguousRelations: 0, missingRelations: 0, unlinkedRatings: 0, emptyScores: 0, invalidScores: 0};
  const linkedRatingIdsByWork = new Map<string, ReadonlySet<string>>();
  for (const [workId, work] of prepared.workById)
    linkedRatingIdsByWork.set(workId, new Set(work.ratingIds));
  const accumulators = new Map<string, MemberAccumulator>();
  for (const rating of prepared.ratings) {
    const memberIds = [...new Set(rating.memberIds)], workIds = [...new Set(rating.workIds)];
    if (memberIds.length > 1 || workIds.length > 1) {excluded.ambiguousRelations += 1; continue;}
    if (memberIds.length !== 1 || workIds.length !== 1) {excluded.missingRelations += 1; continue;}
    const memberId = memberIds[0], workId = workIds[0];
    if (!prepared.memberById.has(memberId) || !prepared.workById.has(workId)) {
      excluded.missingRelations += 1; continue;
    }
    if (!linkedRatingIdsByWork.get(workId)?.has(rating.id)) {excluded.unlinkedRatings += 1; continue;}
    let a = accumulators.get(memberId);
    if (!a) {
      a = {performance: createMetric(), styling: createMetric(), ratingIds: new Set(), workIds: new Set()};
      accumulators.set(memberId, a);
    }
    const performance = accumulate(a.performance, rating.score);
    const styling = accumulate(a.styling, rating.stylingScore);
    if (performance === null && styling === null) {
      const missingPerformance = rating.score === null || rating.score === undefined;
      const missingStyling = rating.stylingScore === null || rating.stylingScore === undefined;
      if (missingPerformance && missingStyling) excluded.emptyScores += 1;
      else excluded.invalidScores += 1;
      continue;
    }
    a.ratingIds.add(rating.id); a.workIds.add(workId);
  }
  const rows: MemberRow[] = [];
  for (const member of prepared.members) {
    const a = accumulators.get(member.id);
    if (!a || (a.performance.sampleCount === 0 && a.styling.sampleCount === 0)) continue;
    rows.push({memberId: member.id, performance: summarizeMetric(a.performance),
      styling: summarizeMetric(a.styling), ratingIds: [...a.ratingIds], workIds: [...a.workIds]});
  }
  return {rows, excluded};
}
