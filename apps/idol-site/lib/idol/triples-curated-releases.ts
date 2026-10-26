import evidence from '../../data/triples/curated-release-evidence.json';
import { TRIPLES_GROUP_ID } from './triples-identity';
import type { Work } from './types';

type IndexedWork = Pick<Work, 'id' | 'groupIds' | 'url' | 'song' | 'officialTitle'>;
export interface TriplesCuratedReleaseEntry<W> {
  readonly title: string;
  readonly releaseKey: string;
  readonly work: W;
  readonly sourceKind: 'curated-public-evidence';
  readonly sourceScope: string;
  readonly sourceUrls: readonly string[];
  readonly displayScope: string;
}

/**
 * Separately reviewed public curation, not a timeline assertion or workIds patch.
 * Only original, uniquely identified catalog videos are returned. No performers,
 * dates, membership, new videos or album artwork are derived from this mapping.
 */
export function triplesCuratedReleaseEntries<W extends IndexedWork>(
  works: readonly W[],
): readonly TriplesCuratedReleaseEntry<W>[] {
  return Object.freeze(evidence.entries.flatMap(mapping => {
    if (mapping.reviewStatus !== 'ready' || mapping.sourceKind !== 'curated-public-evidence'
      || mapping.groupId !== TRIPLES_GROUP_ID
      || evidence.entries.filter(entry => entry.releaseKey === mapping.releaseKey || entry.workId === mapping.workId).length !== 1) return [];
    const matches = works.filter(work => work.id === mapping.workId);
    if (matches.length !== 1) return [];
    const work = matches[0];
    if (!work.groupIds.includes(TRIPLES_GROUP_ID) || work.url !== mapping.videoUrl
      || work.song !== mapping.workTitle || work.officialTitle !== mapping.officialTitle) return [];
    return [Object.freeze({
      title: mapping.releaseTitle, releaseKey: mapping.releaseKey, work,
      sourceKind: 'curated-public-evidence' as const, sourceScope: mapping.sourceScope,
      sourceUrls: Object.freeze([mapping.sourceUrl]), displayScope: mapping.displayScope,
    })];
  }));
}
