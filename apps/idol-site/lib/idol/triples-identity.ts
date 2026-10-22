import evidence from '../../data/triples/identity-evidence.json';
import releaseEvidence from '../../data/triples/release-evidence.json';
import { memberChineseName, memberDisplayName } from './member-display-name';
import type { Member, Work } from './types';
import type { TimelineEvent } from './timeline/types';

export const TRIPLES_GROUP_ID = 'rec28ldfRTiCtw';
type NamedMember = Pick<Member, 'id' | 'name' | 'cnName' | 'stageName' | 'groupIds'>;
type IndexedWork = Pick<Work, 'id' | 'groupIds' | 'url' | 'song' | 'officialTitle'>;
export interface TriplesIdentity {
  readonly sNumber: number;
  readonly officialStageName: string;
  readonly sourceUrl: string;
}
export interface TriplesRosterEntry<M> {
  /** Exact input reference, including unmatched entries; never write display fields back. */
  readonly member: M;
  readonly identity: TriplesIdentity | null;
  readonly displayName: string;
  readonly chineseName: string;
  readonly displayKind: 'existingMemberDisplayName';
  readonly chineseSourceUrls: readonly string[];
}

/** Full caller-supplied roster in original order. No index-derived identity or filtering. */
export function triplesRoster<M extends NamedMember>(members: readonly M[]): readonly TriplesRosterEntry<M>[] {
  const counts = new Map<string, number>();
  for (const member of members) counts.set(member.id, (counts.get(member.id) ?? 0) + 1);
  return Object.freeze(members.map(member => {
    const matches = evidence.entries.filter(entry => entry.memberId === member.id);
    const match = matches.length === 1 ? matches[0] : undefined;
    const valid = counts.get(member.id) === 1 && member.groupIds.includes(TRIPLES_GROUP_ID)
      && match?.officialStageName === member.stageName;
    const identity = valid && match ? Object.freeze({
      sNumber: match.sNumber, officialStageName: match.officialStageName, sourceUrl: evidence.sourceUrl,
    }) : null;
    return Object.freeze({
      member, identity, chineseName: memberChineseName(member),
      displayName: memberDisplayName(member),
      displayKind: 'existingMemberDisplayName' as const,
      chineseSourceUrls: Object.freeze([]),
    });
  }));
}

const RELEASES = releaseEvidence.entries;
export interface TriplesReleaseEntry<W> {
  readonly title: string;
  readonly eventId: string;
  readonly releaseKey: string;
  readonly work: W;
  readonly sourceUrls: readonly string[];
}

/**
 * Pass ONLY events admitted by the existing timeline validation/publication gate.
 * No raw timeline import: unpublished evidence cannot become a playable entry here.
 * These are release-to-catalog navigation links, not performer or unit membership.
 */
export function triplesReleaseEntries<W extends IndexedWork>(
  works: readonly W[], publishedEvents: readonly TimelineEvent[],
): readonly TriplesReleaseEntry<W>[] {
  return Object.freeze(RELEASES.flatMap(mapping => {
    const events = publishedEvents.filter(event => event.id === mapping.eventId || event.releaseKey === mapping.releaseKey);
    const candidates = works.filter(work => work.id === mapping.workId);
    if (events.length !== 1 || candidates.length !== 1) return [];
    const event = events[0], work = candidates[0];
    if (event.id !== mapping.eventId || event.releaseKey !== mapping.releaseKey
      || event.groupId !== TRIPLES_GROUP_ID || !work.groupIds.includes(TRIPLES_GROUP_ID)
      || event.eventType !== 'release' || event.status !== 'confirmed'
      || event.reviewStatus !== 'ready' || event.holdReasons.length !== 0
      || event.workIds.length !== 1 || event.workIds[0] !== mapping.workId
      || work.url !== mapping.url || work.song !== mapping.song || work.officialTitle !== mapping.officialTitle
      || !mapping.sourceUrls.every(url => event.sources.some(source => source.url === url))) return [];
    return [Object.freeze({ title: mapping.title, eventId: mapping.eventId,
      releaseKey: mapping.releaseKey, work,
      sourceUrls: Object.freeze([...mapping.sourceUrls]),
    })];
  }));
}
