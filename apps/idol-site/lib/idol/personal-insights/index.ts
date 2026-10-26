import type {InsightOptions, InsightsCatalog, PersonalInsightModel} from './contract';
import {prepareCatalog} from './prepare';
import {compareGroups, summarizeScores, summarizeWatching} from './overview';
import {summarizeMembers} from './members';
import {buildRevisitLists} from './revisit';

function freezeDerivedModel<T>(value: T): T {
  const seen = new WeakSet<object>();
  function visit(current: unknown): void {
    if (current === null || typeof current !== 'object' || seen.has(current)) return;
    seen.add(current);
    for (const child of Object.values(current)) visit(child);
    Object.freeze(current);
  }
  visit(value);
  return value;
}
/** No IO, persistence, navigation or implicit eligibility inference. */
export function analyzeCatalog(catalog: InsightsCatalog, options?: InsightOptions): PersonalInsightModel {
  const p = prepareCatalog(catalog);
  return freezeDerivedModel<PersonalInsightModel>({
    uniqueWorkCount: p.works.length,
    watching: summarizeWatching(p.works),
    mv: summarizeScores(p.works, 'mv', options),
    stage: summarizeScores(p.works, 'stage', options),
    mvGroups: compareGroups(p, 'mv', 'mean', options),
    stageGroups: compareGroups(p, 'stage', 'mean', options),
    members: summarizeMembers(p),
    mvRevisit: buildRevisitLists(p, 'mv', options),
    stageRevisit: buildRevisitLists(p, 'stage', options),
    diagnostics: p.diagnostics,
  });
}
export {prepareCatalog} from './prepare';
export {validScore, isStageEligible} from './score';
export {compareGroups, summarizeScores, summarizeWatching} from './overview';
export {summarizeMembers} from './members';
export {buildRevisitLists} from './revisit';
export type {
  ScoreDomain, GroupSort, InsightOptions, ScoreStats, WatchingStats,
  IdentityDiagnostics, PreparedCatalog, GroupRow, MetricStats, MemberRow,
  MemberAnalysis, RevisitItem, RevisitLists, PersonalInsightModel, InsightsCatalog,
} from './contract';
