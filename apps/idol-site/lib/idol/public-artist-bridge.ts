import identities from '../../data/public-artist-identity-map.json';
import {safeArtistReturn} from './artist-navigation';
import {routeUrl} from './journey';
import {publicArtistKeys, type PublicArtistSlug, type PublicMediaKind} from './public-artist-route-keys';
import {stageHasValidBinding, stageSourceKey} from './stage-source';
import {videoId as youtubeVideoId} from './values';
import type {CatalogView, Group, Member, Work} from './types';

export type {PublicArtistSlug, PublicMediaKind} from './public-artist-route-keys';
export type PublicArtistCatalog = Pick<CatalogView, 'scope'> & {
  readonly groups: readonly Group[];
  readonly members: readonly Member[];
  readonly works: readonly Work[];
};
export type PublicArtistFields = Partial<Record<'section' | 'member' | 'queue' | 'q' | 'format' | 'reader' | 'release' | 'media' | 'unit' | 'participant' | 'sort' | 'rosterView' | 'year' | 'event' | 'timelineType' | 'timelineImportance' | 'timelineOrder', string | null>>;
export type PublicEntityReference = {kind: 'group' | 'member' | 'release' | 'event' | PublicMediaKind; key: string};
export type ResolvedPublicMedia = {
  kind: PublicMediaKind; key: string; group: Group; work: Work;
  videoId: string; sourceKey: string; stageScoreBindingValid: boolean;
};
export type ResolvedPublicEntity = ResolvedPublicMedia
  | {kind: 'group'; key: string; group: Group}
  | {kind: 'member'; key: string; group: Group; member: Member}
  | {kind: 'release'; key: string; group: Group; releaseId: null; timelineReleaseKey: string | null; timelineEventId: string | null}
  | {kind: 'event'; key: string; group: Group; canonicalEventId: string};

function identityGroup(slug: string) {
  return Object.hasOwn(identities.groups, slug) ? identities.groups[slug as keyof typeof identities.groups] : null;
}
function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function hasGroup(value: unknown, groupId: string): boolean {
  return Array.isArray(value) && value.every(id => typeof id === 'string') && value.includes(groupId);
}
/** Never trust a build-time mapping alone. Missing, duplicated or foreign scope is closed. */
function runtimeGroup(slug: string, catalog: PublicArtistCatalog | null | undefined): Group | null {
  const group = identityGroup(slug);
  if (!group || !isObject(catalog) || !Array.isArray(catalog.groups)) return null;
  if (catalog.scope !== undefined && (!isObject(catalog.scope) || catalog.scope.type !== 'artist' || catalog.scope.groupId !== group.groupId)) return null;
  const hits = catalog.groups.filter(row => isObject(row) && row.id === group.groupId);
  return hits.length === 1 ? hits[0] as Group : null;
}
function sameArtistReturn(slug: string, value: string | null | undefined): string | null {
  const group = publicArtistKeys(slug);
  const safe = safeArtistReturn(value);
  return group && safe && new URL(safe, 'https://site.invalid').pathname === group.path ? safe : null;
}

/** Exact (kind, key) resolution; release keys never masquerade as rated Works. */
export function resolvePublicArtistEntity(slug: PublicArtistSlug, reference: PublicEntityReference, catalog: PublicArtistCatalog | null | undefined): ResolvedPublicEntity | null {
  const ids = identityGroup(slug), group = runtimeGroup(slug, catalog);
  if (!ids || !group || !reference || typeof reference.key !== 'string') return null;
  if (reference.kind === 'group') return reference.key === slug ? {kind: 'group', key: reference.key, group} : null;
  if (reference.kind === 'member') {
    const mappings = ids.members.filter(member => member.key === reference.key || member.memberId === reference.key);
    if (mappings.length !== 1 || !Array.isArray(catalog?.members)) return null;
    const hits = catalog.members.filter(member => isObject(member) && member.id === mappings[0].memberId);
    if (hits.length !== 1 || !hasGroup(hits[0].groupIds, group.id) && !hasGroup(hits[0].formerGroupIds, group.id)) return null;
    return {kind: 'member', key: mappings[0].key, group, member: hits[0]};
  }
  if (reference.kind === 'release') {
    const mappings = ids.releases.filter(release => release.key === reference.key);
    if (mappings.length !== 1 || mappings[0].releaseId !== null) return null;
    // These are public editorial aliases, deliberately not database release/work IDs.
    return {kind: 'release', key: mappings[0].key, group, releaseId: null, timelineReleaseKey: mappings[0].timelineReleaseKey, timelineEventId: mappings[0].timelineEventId};
  }
  if (reference.kind === 'event') {
    const mappings = ids.events.filter(event => event.key === reference.key);
    const eventId = mappings.length === 1 ? mappings[0].canonicalEventId : null;
    return eventId ? {kind: 'event', key: reference.key, group, canonicalEventId: eventId} : null;
  }
  if (reference.kind !== 'mv' && reference.kind !== 'stage') return null;
  const mappings = ids.media.filter(media => media.kind === reference.kind && media.key === reference.key);
  if (mappings.length !== 1 || !Array.isArray(catalog?.works)) return null;
  const mapping = mappings[0];
  if (!mapping.workId || !mapping.videoId || !mapping.url) return null;
  const hits = catalog.works.filter(work => isObject(work) && work.id === mapping.workId);
  if (hits.length !== 1 || hits[0].placeholder || !hasGroup(hits[0].groupIds, group.id)) return null;
  const work = hits[0];
  const sourceMatches = (row: Work) => {
    if (!isObject(row) || row.placeholder || !hasGroup(row.groupIds, group.id)) return false;
    if (reference.kind === 'mv') return row.url === mapping.url && youtubeVideoId(row.url) === mapping.videoId;
    const stage = row.stage;
    return isObject(stage) && stage.videoId === mapping.videoId && stage.url === mapping.url && stageSourceKey(stage) === mapping.videoId;
  };
  // Canonical row URL bytes must match, while aliases of the SAME video still
  // count as duplicate sources. A youtu.be alias cannot hide an ambiguous Work.
  const sourceIdentityMatches = (row: Work) => {
    if (!isObject(row) || row.placeholder || !hasGroup(row.groupIds, group.id)) return false;
    return reference.kind === 'mv' ? youtubeVideoId(row.url) === mapping.videoId
      : isObject(row.stage) && stageSourceKey(row.stage) === mapping.videoId;
  };
  if (!sourceMatches(work) || catalog.works.filter(sourceIdentityMatches).length !== 1) return null;
  return {kind: reference.kind, key: reference.key, group, work, videoId: mapping.videoId, sourceKey: mapping.videoId,
    stageScoreBindingValid: reference.kind === 'stage' && stageHasValidBinding(work.stage)};
}

/** Pure serialization through the production sanitizer; never installs a router. */
export function publicArtistHref(slug: PublicArtistSlug, fields: PublicArtistFields = {}): string | null {
  const group = publicArtistKeys(slug);
  if (!group) return null;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) if (value !== undefined && value !== null) {
    if (typeof value !== 'string') return null;
    params.set(key, value);
  }
  return sameArtistReturn(slug, group.path + (params.size ? '?' + params : ''));
}

/** Both actions enter the established guarded detail; there is no new edit/save flag.
 * The caller supplies the current URL again at click-time to reject stale callbacks.
 */
export function publicMediaActionHref(input: {
  slug: PublicArtistSlug; kind: PublicMediaKind; key: string; action: 'play' | 'records';
  workId: string; videoId: string; returnTo: string; currentArtistUrl: string;
}, catalog: PublicArtistCatalog | null | undefined): string | null {
  if (input.action !== 'play' && input.action !== 'records') return null;
  const resolved = resolvePublicArtistEntity(input.slug, {kind: input.kind, key: input.key}, catalog);
  const returnTo = sameArtistReturn(input.slug, input.returnTo);
  if (!resolved || resolved.kind !== 'mv' && resolved.kind !== 'stage' || !returnTo || sameArtistReturn(input.slug, input.currentArtistUrl) !== returnTo) return null;
  if (input.workId !== resolved.work.id || input.videoId !== resolved.videoId) return null;
  return routeUrl({nav: 'works', work: resolved.work.id, member: null, video: resolved.kind === 'stage' ? 'stage' : 'mv', artistReturn: returnTo});
}

export function publicMemberActionHref(input: {
  slug: PublicArtistSlug; key: string; memberId: string; returnTo: string; currentArtistUrl: string;
}, catalog: PublicArtistCatalog | null | undefined): string | null {
  const resolved = resolvePublicArtistEntity(input.slug, {kind: 'member', key: input.key}, catalog);
  const returnTo = sameArtistReturn(input.slug, input.returnTo);
  if (!resolved || resolved.kind !== 'member' || resolved.member.id !== input.memberId || !returnTo || sameArtistReturn(input.slug, input.currentArtistUrl) !== returnTo) return null;
  return routeUrl({nav: 'members', work: null, member: resolved.member.id, video: 'mv', artistReturn: returnTo});
}

/** Exact editorial alias only. Unmapped Sol prototype events stay unmapped. */
export function publicTimelineReleaseHref(slug: PublicArtistSlug, timelineReleaseKey: string): string | null {
  const hits = identityGroup(slug)?.releases.filter(release => release.timelineReleaseKey === timelineReleaseKey) ?? [];
  return hits.length === 1 ? publicArtistHref(slug, {section: 'works', release: hits[0].key}) : null;
}

/** Immediate list wins over its upstream person opener. Nested details reuse their
 * own stored opener. Direct deep links get an unfiltered list that reveals the item.
 * Store the result only with the host's existing same-history-entry state/focus APIs.
 */
export function publicArtistDetailOrigin(slug: PublicArtistSlug, current: string, storedOpener?: string | null): string | null {
  const safe = sameArtistReturn(slug, current);
  if (!safe) return null;
  const params = new URL(safe, 'https://site.invalid').searchParams;
  const isDetail = params.has('release') || params.has('media') || params.has('member');
  if (!isDetail) return safe;
  const opener = sameArtistReturn(slug, storedOpener);
  if (opener && opener !== safe) {
    const previous = new URL(opener, 'https://site.invalid').searchParams;
    if (!previous.has('release') && !previous.has('media')) return opener;
  }
  if (params.has('member')) return publicArtistHref(slug, {section: 'members'});
  return publicArtistHref(slug, {section: 'works', ...(params.has('media') ? {format: params.get('format')} : {})});
}

export type TranslatedPublicRoute = {href: string; opener: string | null};
/** Migration boundary only. Prototype hashes are never accepted as returnTo. */
export function translatePublicPrototypeRoute(slug: PublicArtistSlug, value: string): TranslatedPublicRoute | null {
  return translatePrototype(slug, value, 0);
}
function translatePrototype(slug: PublicArtistSlug, value: string, depth: number): TranslatedPublicRoute | null {
  const ids = identityGroup(slug);
  if (!ids || typeof value !== 'string' || !value.startsWith('#/') || value.length > 4096 || depth > 3 || /[\\\u0000-\u0020]/.test(value)) return null;
  const parts = value.slice(2).split('?');
  if (parts.length > 2) return null;
  const segments = parts[0].split('/');
  if (segments.length > 2) return null;
  let key: string;
  try { key = decodeURIComponent(segments[1] ?? ''); } catch { return null; }
  const page = segments[0], params = new URLSearchParams(parts[1] ?? '');
  const allowed = page === 'home' ? ['return'] : page === 'members' ? ['q', 'unit', 'view', 'return'] : ['person', 'member'].includes(page) ? ['return'] : ['works', 'work'].includes(page) ? ['q', 'unit', 'sort', 'type', 'member', 'detail', 'return'] : page === 'timeline' ? ['event', 'return'] : null;
  if (!allowed || [...params.keys()].some(name => !allowed.includes(name) || params.getAll(name).length !== 1)) return null;
  const fields: PublicArtistFields = {};
  if (params.has('q')) fields.q = params.get('q');
  if (page === 'home') { if (segments.length > 1) return null; }
  else if (page === 'members') {
    if (segments.length > 1) return null;
    fields.section = 'members';
    if (params.has('view')) fields.rosterView = params.get('view');
    if (params.has('unit')) fields.unit = params.get('unit') === 'hatch' ? 'hatchi' : params.get('unit');
  } else if (page === 'person' || page === 'member') {
    const hits = ids.members.filter(member => member.key === key || member.memberId === key);
    if (hits.length !== 1) return null;
    fields.section = 'members'; fields.member = hits[0].memberId;
  } else if (page === 'works' || page === 'work') {
    if (page === 'works' && segments.length > 1 || page === 'work' && (!key || params.has('detail'))) return null;
    const detail = page === 'work' ? key : params.get('detail');
    const wanted = params.get('type') ?? (slug === 'triples' ? 'release' : null);
    if (wanted !== null && !['release', 'mv', 'stage'].includes(wanted)) return null;
    const releases = !wanted || wanted === 'release' ? ids.releases.filter(release => release.key === detail) : [];
    const media = !wanted || wanted !== 'release' ? ids.media.filter(item => item.key === detail && (!wanted || item.kind === wanted)) : [];
    if (detail !== null && releases.length + media.length !== 1) return null;
    const kind = media[0]?.kind ?? wanted ?? 'release';
    fields.section = 'works';
    if (kind !== 'release') fields.format = kind;
    if (releases.length) fields.release = releases[0].key;
    if (media.length) fields.media = media[0].key;
    if (params.has('unit')) fields.unit = params.get('unit') === 'hatch' ? 'hatchi' : params.get('unit');
    if (params.has('member')) fields.participant = params.get('member');
    if (params.has('sort')) fields.sort = params.get('sort');
  } else {
    if (segments.length > 1) return null;
    fields.section = 'updates'; fields.timelineOrder = 'earliest';
    if (params.has('event')) {
      const event = params.get('event')!;
      if (event.startsWith('timeline-year-')) fields.year = event.slice('timeline-year-'.length);
      else {
        const hits = ids.events.filter(row => row.key === event && row.canonicalEventId !== null);
        if (hits.length !== 1) return null;
        fields.event = hits[0].canonicalEventId;
      }
    }
  }
  const href = publicArtistHref(slug, fields);
  if (!href) return null;
  const previous = params.has('return') ? translatePrototype(slug, params.get('return')!, depth + 1) : null;
  if (params.has('return') && !previous) return null;
  return {href, opener: previous?.href ?? null};
}
