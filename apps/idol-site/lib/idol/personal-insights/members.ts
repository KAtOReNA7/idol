import type {MemberAnalysis, MemberRow, MetricStats, PreparedCatalog} from './contract';
import {validScore} from './score';
import {publicCollaboratorIds} from '../public-work-credits';
import {videoId} from '../values';

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
/** Native relationships require reciprocal links. Independent owner entries bind their exact MV and member. */
export function summarizeMembers(prepared: PreparedCatalog): MemberAnalysis {
  const excluded: MemberAnalysis['excluded'] =
    {ambiguousRelations: 0, missingRelations: 0, unlinkedRatings: 0, emptyScores: 0, invalidScores: 0};
  const linkedRatingIdsByWork = new Map<string, ReadonlySet<string>>();
  for (const [workId, work] of prepared.workById)
    linkedRatingIdsByWork.set(workId, new Set(work.ratingIds));
  const accumulators = new Map<string, MemberAccumulator>();
  const personal = prepared.personalMvRatings ?? [];
  const nativePairs = new Set<string>();
  function add(memberId: string, workId: string, score: unknown, stylingScore: unknown, ratingId?: string) {
    let a = accumulators.get(memberId);
    if (!a) {
      a = {performance: createMetric(), styling: createMetric(), ratingIds: new Set(), workIds: new Set()};
      accumulators.set(memberId, a);
    }
    const performance = accumulate(a.performance, score);
    const styling = accumulate(a.styling, stylingScore);
    if (performance === null && styling === null) {
      if (score == null && stylingScore == null) excluded.emptyScores += 1;
      else excluded.invalidScores += 1;
      return;
    }
    if (ratingId) a.ratingIds.add(ratingId);
    a.workIds.add(workId);
  }
  for (const rating of prepared.ratings) {
    const memberIds = [...new Set(rating.memberIds)], workIds = [...new Set(rating.workIds)];
    if (personal.length) for (const memberId of memberIds) for (const workId of workIds) nativePairs.add(memberId + ':' + workId);
    if (memberIds.length > 1 || workIds.length > 1) {excluded.ambiguousRelations += 1; continue;}
    if (memberIds.length !== 1 || workIds.length !== 1) {excluded.missingRelations += 1; continue;}
    const memberId = memberIds[0], workId = workIds[0];
    if (!prepared.memberById.has(memberId) || !prepared.workById.has(workId)) {
      excluded.missingRelations += 1; continue;
    }
    if (!linkedRatingIdsByWork.get(workId)?.has(rating.id)) {excluded.unlinkedRatings += 1; continue;}
    add(memberId, workId, rating.score, rating.stylingScore, rating.id);
  }
  for (const entry of personal) {
    const pair = entry.memberId + ':' + entry.workId;
    const member = prepared.memberById.get(entry.memberId), work = prepared.workById.get(entry.workId);
    if (!member || !work || nativePairs.has(pair) || videoId(work.url) !== entry.videoId) continue;
    if (!work.groupIds.some(id => member.groupIds.includes(id) || member.formerGroupIds?.includes(id)) && !publicCollaboratorIds(work).includes(member.id)) continue;
    nativePairs.add(pair);
    add(entry.memberId, entry.workId, entry.score, entry.stylingScore);
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
