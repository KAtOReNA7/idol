/**
 * Review-only, pure adapter. No router, persistence, fetch, or global mutation.
 * Production functions are injected from the existing main site's modules.
 * Candidate keys are never used as native database IDs.
 */
const isObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
const youtubeId = value => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) return null;
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1).split('/')[0] : url.searchParams.get('v');
    return /^[A-Za-z0-9_-]{11}$/.test(id ?? '') ? id : null;
  } catch { return null; }
};
const belongs = (row, groupId) => Array.isArray(row?.groupIds) && row.groupIds.includes(groupId);

export function resolveReviewEntity(group, reference, catalog, production) {
  if (!group || !isObject(catalog) || !Array.isArray(catalog.groups) ||
      !Array.isArray(catalog.members) || !Array.isArray(catalog.works)) return null;
  if (catalog.scope !== undefined && (!isObject(catalog.scope) ||
      catalog.scope.type !== 'artist' || catalog.scope.groupId !== group.groupId)) return null;
  if (catalog.groups.filter(row => row?.id === group.groupId).length !== 1) return null;
  if (reference?.kind === 'member') {
    const entries = group.members.filter(row => row.key === reference.key);
    if (entries.length !== 1) return null;
    const hits = catalog.members.filter(row => row?.id === entries[0].memberId);
    if (hits.length !== 1 || !belongs(hits[0], group.groupId) &&
      !(Array.isArray(hits[0].formerGroupIds) && hits[0].formerGroupIds.includes(group.groupId))) return null;
    return {kind: 'member', memberId: hits[0].id};
  }
  if (!['mv', 'stage'].includes(reference?.kind)) return null;
  const entries = group.media.filter(row => row.kind === reference.kind && row.key === reference.key);
  if (entries.length !== 1) return null;
  const entry = entries[0];
  // A deduplicated visual stage may represent several existing parent records.
  // Do not choose one silently. A future explicit picker may supply one.
  const bindings = reference.parentWorkId
    ? entry.bindings.filter(row => row.workId === reference.parentWorkId) : entry.bindings;
  if (bindings.length !== 1 || !entry.videoId) return null;
  const binding = bindings[0];
  const hits = catalog.works.filter(row => row?.id === binding.workId);
  if (hits.length !== 1 || hits[0].placeholder || !belongs(hits[0], group.groupId)) return null;
  const work = hits[0];
  if (entry.kind === 'mv') {
    if (work.url !== binding.url || youtubeId(work.url) !== entry.videoId) return null;
    if (catalog.works.filter(row => !row?.placeholder && belongs(row, group.groupId) && youtubeId(row.url) === entry.videoId).length !== 1) return null;
  } else {
    const stage = work.stage;
    if (!stage || stage.url !== binding.url || stage.videoId !== entry.videoId ||
        production.stageSourceKey(stage) !== entry.videoId) return null;
    // Multiple source aliases require the explicit parent selection above.
    const aliases = catalog.works.filter(row => !row?.placeholder && belongs(row, group.groupId) &&
      production.stageSourceKey(row.stage) === entry.videoId);
    if (aliases.some(row => !entry.bindings.some(item => item.workId === row.id))) return null;
    if (!reference.parentWorkId && aliases.length !== 1) return null;
  }
  return {kind: entry.kind, workId: work.id, videoId: entry.videoId,
    stageScoreBindingValid: entry.kind === 'stage' && production.stageHasValidBinding(work.stage)};
}

/** The review deep link stays in browser history, never in editor returnTo. */
export function productionReturn(group, route, production) {
  const path = `/artists/${group.slug}`;
  const params = new URLSearchParams();
  if (['members', 'member'].includes(route.page)) params.set('section', 'members');
  else if (['works', 'work'].includes(route.page)) params.set('section', 'works');
  else if (route.page === 'timeline') params.set('section', 'updates');
  if (route.page === 'member' && group.members.some(row => row.key === route.key)) params.set('member', route.key);
  const type = route.page === 'work' ? group.media.find(row => row.key === route.key)?.kind : route.query?.get('type');
  if (['mv', 'stage'].includes(type)) params.set('format', type);
  const query = route.query?.get('q');
  if (query && query.length <= 200 && ['works', 'work'].includes(route.page)) params.set('q', query);
  // Review-only release/event/chapter/type aliases are intentionally not widened.
  return production.safeArtistReturn(path + (params.size ? `?${params}` : '')) ??
    production.safeArtistReturn(path + '?section=' + (route.page === 'member' ? 'members' : 'works'));
}

export function nativeActionHref({group, reference, action, catalog, route, mountedUrl, currentUrl, mayLeave}, production) {
  if (!['play', 'records', 'member-records'].includes(action) || mountedUrl !== currentUrl || !mayLeave) return null;
  const entity = resolveReviewEntity(group, reference, catalog, production);
  if (!entity || entity.kind === 'member' && action !== 'member-records' ||
      entity.kind !== 'member' && action === 'member-records') return null;
  const artistReturn = productionReturn(group, route, production);
  if (!artistReturn) return null;
  return production.routeUrl(entity.kind === 'member'
    ? {nav: 'members', work: null, member: entity.memberId, video: 'mv', artistReturn}
    : {nav: 'works', work: entity.workId, member: null, video: entity.kind, artistReturn});
}

/** Preserve route/query bytes for review navigation; never use it as authorization. */
export function reviewHref(slug, page = 'home', key = null, query = new URLSearchParams()) {
  const parts = [slug, ...(page === 'home' ? [] : [page]), ...(key == null ? [] : [String(key)])];
  const params = query instanceof URLSearchParams ? query : new URLSearchParams(query);
  return `#/${parts.map(encodeURIComponent).join('/')}${params.size ? `?${params}` : ''}`;
}

export function parseReviewRoute(group, value) {
  if (typeof value !== 'string' || !value.startsWith('#/') || value.length > 4096 || /[\\\u0000-\u0020]/.test(value)) return null;
  const [path, ...queries] = value.slice(2).split('?');
  if (queries.length > 1) return null;
  let parts;
  try { parts = path.split('/').map(decodeURIComponent); } catch { return null; }
  const [slug, page = 'home', key = null, ...rest] = parts;
  if (slug !== group.slug || rest.length || !['home', 'members', 'member', 'works', 'work', 'timeline'].includes(page)) return null;
  if (['member', 'work'].includes(page) ? key === null : key !== null) return null;
  if (page === 'member' && !group.members.some(row => row.key === key)) return null;
  if (page === 'work' && ![...group.media, ...group.releases].some(row => row.key === key)) return null;
  const query = new URLSearchParams(queries[0] ?? '');
  // Query arrays are transported unchanged; they are never flattened into identity.
  return {slug, page, key, query};
}

/** Read-only source link validation against the exact active entity. */
export function verifiedSourceHref(sourceUrls, href) {
  if (!Array.isArray(sourceUrls) || !sourceUrls.includes(href)) return null;
  try { return ['https:', 'http:'].includes(new URL(href).protocol) ? href : null; } catch { return null; }
}

export function remapAsset(asset, map) {
  if (!asset) return asset;
  const object = typeof asset === 'string' ? {src: asset} : asset;
  const path = (object.src ?? object.path ?? object.url ?? '').replace(/^\.\//, '');
  const entry = map[path];
  if (!entry) return {...object, src: null, path: null, url: null};
  if (object.sha256 && object.sha256 !== entry.sha256) return {...object, src: null, path: null, url: null};
  return {...object, src: entry.targetUrl};
}
