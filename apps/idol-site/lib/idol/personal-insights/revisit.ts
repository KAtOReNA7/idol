import type {Work} from '../types';
import type {InsightOptions, PreparedCatalog, RevisitItem, RevisitLists, ScoreDomain} from './contract';
import {isStageEligible, validScore} from './score';

function revisitItem(work: Readonly<Work>, score: number | null, reason: RevisitItem['reason']): RevisitItem {
  return {workId: work.id, name: work.name, version: work.version, score, reason};
}
export function buildRevisitLists(
  prepared: PreparedCatalog, domain: ScoreDomain, options?: InsightOptions,
): RevisitLists {
  const highRated: {inputIndex: number; score: number; item: RevisitItem}[] = [];
  const watchedUnrated: RevisitItem[] = [];
  for (let inputIndex = 0; inputIndex < prepared.works.length; inputIndex += 1) {
    const work = prepared.works[inputIndex];
    if (domain === 'stage' && !isStageEligible(work, options)) continue;
    const rawScore = domain === 'stage' ? work.stageScore : work.score;
    const score = validScore(rawScore);
    if (score !== null && score >= 9)
      highRated.push({inputIndex, score, item: revisitItem(work, score, 'high-score')});
    // Only MV has a viewing-state field. Stage viewing must not be inferred.
    // A malformed/absent score is not an explicitly unrated (null) score.
    if (domain === 'mv' && work.watched === '已观看' && rawScore === null)
      watchedUnrated.push(revisitItem(work, null, 'watched-unrated'));
  }
  highRated.sort((a, b) => b.score - a.score || a.inputIndex - b.inputIndex);
  return {highRated: highRated.map(entry => entry.item), watchedUnrated};
}
