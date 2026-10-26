import registry from '@/data/artist-timeline-registry.json';
import content from '@/data/triples-artist.json';
import {safeArtistReturn} from '../artist-navigation';
import {candidatePortrait} from '../candidate/portrait';
import {publicArtistDetailOrigin, publicArtistHref, resolvePublicArtistEntity, type PublicArtistFields, type PublicArtistCatalog} from '../public-artist-bridge';
import {triplesChineseLabel, triplesPublicDimensions, triplesPublicReleases, triplesPublicVideos, triplesPublicStages, type TriplesPublicMusic} from '../triples-design-catalog';
import {triplesRoster, TRIPLES_GROUP_ID} from '../triples-identity';
import {prepareTimelinePresentation} from '../timeline/presentation';
import {sortTimelineEvents} from '../timeline/model';
import type {CatalogView, Member} from '../types';

export const TRIPLES_REVIEW_PATH = '/design-review/triples-v2';
export const TRIPLES_CANONICAL_PATH = '/artists/triples';
export const triplesReviewContent = content;
export const triplesReviewWordmark = '/artist/triples/approved-design/logo-triples.svg';
export const triplesReviewDimensions = triplesPublicDimensions;
export const triplesReviewReleases = triplesPublicReleases;
export const triplesReviewVideos = triplesPublicVideos;
export const triplesReviewStages = triplesPublicStages;
export type ReviewMusic = TriplesPublicMusic;
export type ReviewMember = {member: Member; id: string; sNumber: number; name: string; stageName: string; image: string | null; sourceUrl: string | null};
export type ReviewFields = PublicArtistFields;
export type ReviewRoute = {valid: boolean; canonical: string | null; fields: ReviewFields; section: string; member: string | null; release: string | null; media: string | null; format: 'release' | 'mv' | 'stage'; query: string; unit: string; sort: 'newest' | 'oldest'; rosterView: 'members' | 'units'; participant: string | null; event: string | null; year: string | null};

/** Review URLs are never added to the production editor's return allowlist. */
export function canonicalReviewUrl(value: string): string | null {
  try {
    if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return null;
    const url = new URL(value, 'https://site.invalid');
    if (url.pathname !== TRIPLES_REVIEW_PATH || url.hash || value.split('?')[0] !== TRIPLES_REVIEW_PATH) return null;
    return safeArtistReturn(TRIPLES_CANONICAL_PATH + url.search);
  } catch { return null; }
}
export function reviewUrlFromCanonical(value: string | null): string | null {
  if (!value) return null;
  const safe = safeArtistReturn(value);
  return safe && new URL(safe, 'https://site.invalid').pathname === TRIPLES_CANONICAL_PATH ? TRIPLES_REVIEW_PATH + new URL(safe, 'https://site.invalid').search : null;
}
export function triplesReviewHref(fields: ReviewFields = {}): string | null {
  return reviewUrlFromCanonical(publicArtistHref('triples', fields));
}
export function readTriplesReviewRoute(value: string): ReviewRoute {
  const canonical = canonicalReviewUrl(value);
  const params = new URL(canonical ?? TRIPLES_CANONICAL_PATH, 'https://site.invalid').searchParams;
  return {valid: !!canonical, canonical, fields: Object.fromEntries(params) as ReviewFields,
    section: params.get('section') ?? 'overview', member: params.get('member'), release: params.get('release'), media: params.get('media'),
    format: params.get('format') === 'stage' ? 'stage' : params.get('format') === 'mv' ? 'mv' : 'release', query: params.get('q') ?? '',
    unit: params.get('unit') ?? '', sort: params.get('sort') === 'oldest' ? 'oldest' : 'newest', rosterView: params.get('rosterView') === 'units' ? 'units' : 'members',
    participant: params.get('participant'), event: params.get('event'), year: params.get('year')};
}
export function triplesReviewMembers(catalog: PublicArtistCatalog | null): ReviewMember[] {
  const group = resolvePublicArtistEntity('triples', {kind: 'group', key: 'triples'}, catalog);
  if (!group || group.kind !== 'group' || !catalog) return [];
  return triplesRoster(catalog.members.filter(member => member && Array.isArray(member.groupIds) && member.groupIds.includes(TRIPLES_GROUP_ID))).flatMap(row => {
    const resolved = resolvePublicArtistEntity('triples', {kind: 'member', key: row.member.id}, catalog);
    if (!row.identity || !resolved || resolved.kind !== 'member') return [];
    const portrait = candidatePortrait(row.member, content.portraits);
    return [{member: row.member, id: row.member.id, sNumber: row.identity.sNumber, name: triplesChineseLabel(row.member), stageName: row.member.stageName, image: portrait?.official ? portrait.image : null, sourceUrl: portrait?.official ? portrait.sourceUrl : null}];
  }).sort((a, b) => a.sNumber - b.sNumber);
}
export function reviewMemberMatches(member: ReviewMember, query: string) {
  const normal = (text: string) => text.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  const q = normal(query), number = q.match(/^s0*(\d{1,2})$/);
  return !q || (number ? member.sNumber === Number(number[1]) : normal(member.name).includes(q) || normal(member.stageName).includes(q));
}
export function reviewVerifiedParticipants(item: ReviewMusic) {
  return item.participationStatus.startsWith('official_') ? item.participantIds : [];
}
/** Existing reviewed release/unit relations; never infer a media cast from a unit. */
export function reviewDimensionKey(item: ReviewMusic): string {
  if (item.dimensionKey) return item.dimensionKey;
  if (item.kind !== 'release') return '';
  const linked = triplesPublicVideos.find(video => video.releaseKey === item.key && triplesPublicDimensions.some(unit => unit.key === video.dimensionKey));
  if (linked?.dimensionKey) return linked.dimensionKey;
  const hatchi = triplesPublicDimensions.find(unit => unit.key === 'hatchi');
  const ids = reviewVerifiedParticipants(item);
  return hatchi && item.title.includes('∞!') && ids.length === hatchi.memberIds.length && ids.every(id => hatchi.memberIds.includes(id)) ? hatchi.key : '';
}
export function reviewMusicList(format: ReviewRoute['format']): readonly ReviewMusic[] {
  return format === 'mv' ? triplesPublicVideos : format === 'stage' ? triplesPublicStages : triplesPublicReleases;
}
export function filteredReviewMusic(route: ReviewRoute): ReviewMusic[] {
  const q = route.query.trim().normalize('NFKC').toLowerCase();
  return reviewMusicList(route.format).filter(item => {
    const unit = triplesPublicDimensions.find(unit => unit.key === reviewDimensionKey(item));
    return (!route.unit || unit?.key === route.unit) && (!route.participant || route.format === 'release' && reviewVerifiedParticipants(item).includes(route.participant))
      && (!q || [item.title, unit?.name, item.programme, item.episode].filter(Boolean).join(' ').normalize('NFKC').toLowerCase().includes(q));
  }).sort((a, b) => !a.date ? !b.date ? a.title.localeCompare(b.title) : 1 : !b.date ? -1 : (route.sort === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date));
}
export function reviewMusicFields(item: ReviewMusic): ReviewFields {
  return item.kind === 'release' ? {section: 'works', release: item.key} : {section: 'works', format: item.kind, media: item.key};
}
/** Schema + publication gate uses the canonical document, never the prototype fixture. */
export function reviewTimeline(input: unknown, catalog: CatalogView | null) {
  const presentation = prepareTimelinePresentation(input, catalog, registry);
  if (!catalog || !resolvePublicArtistEntity('triples', {kind: 'group', key: 'triples'}, catalog) || presentation.timeline?.groupId !== TRIPLES_GROUP_ID || presentation.state === 'invalid' || presentation.state === 'loading') return {...presentation, events: []};
  return {...presentation, events: sortTimelineEvents(presentation.timeline.events.filter(event => event.reviewStatus === 'ready' && !event.holdReasons.length), 'earliest')};
}

export type ReviewOpener = {href: string; focus: string | null; parentEntry: boolean};
export function readReviewOpener(value: unknown): ReviewOpener | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.href !== 'string' || !canonicalReviewUrl(row.href) || typeof row.parentEntry !== 'boolean' || row.focus !== null && (typeof row.focus !== 'string' || !canonicalReviewUrl(row.focus))) return null;
  return {href: row.href, focus: row.focus as string | null, parentEntry: row.parentEntry};
}
/** A replaced direct entry has no history predecessor owned by this preview. */
export function reviewNavigationPlan(currentUrl: string, targetUrl: string, storedOpener: unknown, focus: string | null = null) {
  const current = readTriplesReviewRoute(currentUrl), next = readTriplesReviewRoute(targetUrl);
  if (!current.valid || !next.valid) return null;
  const detailKind = (route: ReviewRoute) => route.member ? 'member' : route.release || route.media ? 'work' : null;
  const currentKind = detailKind(current), nextKind = detailKind(next);
  const sameDetail = currentKind !== null && currentKind === nextKind;
  let opener: ReviewOpener | null = null;
  if (next.member || next.release || next.media) {
    if (sameDetail) {
      opener = readReviewOpener(storedOpener);
      if (!opener) {
        const href = reviewUrlFromCanonical(publicArtistDetailOrigin('triples', current.canonical!));
        if (href) opener = {href, focus: null, parentEntry: false};
      }
    } else opener = {href: currentUrl, focus: focus && canonicalReviewUrl(focus) ? focus : null, parentEntry: true};
  }
  return {method: sameDetail ? 'replaceState' as const : 'pushState' as const, opener};
}
