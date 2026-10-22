import {contract} from './contract.js';
import {parseReviewRoute, productionReturn, resolveReviewEntity, reviewHref} from './bridge.mjs';
import {helpers as originalHelpers} from './shared/helpers.js';
export const REVIEW_PATH = '/design-review/sol15/udtt-private';
export const group = contract.group;
export const assets = contract.assets;
export const urlNow = win => win.location.pathname + win.location.search + win.location.hash;
export function readReviewUrl(value) {
  if (typeof value !== 'string' || !value.startsWith(REVIEW_PATH) || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://review.invalid');
    if (url.origin !== 'https://review.invalid' || url.pathname !== REVIEW_PATH || url.search) return null;
    return parseReviewRoute(group, url.hash || '#/udtt');
  } catch {return null;}
}
export function catalogBelongs(catalog) {
  return !!catalog && Array.isArray(catalog.groups) && Array.isArray(catalog.members) && Array.isArray(catalog.works) &&
    catalog.scope?.type === 'artist' && catalog.scope.groupId === group.groupId &&
    catalog.groups.filter(row => row?.id === group.groupId).length === 1;
}
/** Native actions require the actual source, not merely a card key or image. */
export function resolveNative(reference, catalog, production) {
  if (!catalogBelongs(catalog)) return null;
  const result = resolveReviewEntity(group, reference, catalog, production);
  if (!result || result.kind === 'member') return result;
  const work = catalog.works.find(row => row.id === result.workId);
  if (work.videoType !== '官方MV') return null;
  if (result.kind === 'stage' && (work.stage?.clip != null || work.stage?.kind !== '官方舞台化表演' || production.stageSourceKey(work.stage) !== result.videoId)) return null;
  return {...result, sourceKey:result.videoId, clip:null, originalType:work.videoType, slotType:result.kind === 'stage' ? 'STAGE' : 'MV'};
}
export function nativeHref({reference, action, catalog, route, mountedUrl, currentUrl, mayLeave}, production) {
  if (!mayLeave || mountedUrl !== currentUrl || !readReviewUrl(currentUrl) || !['play','records','member-records'].includes(action)) return null;
  const entity = resolveNative(reference,catalog,production);
  if (!entity || (entity.kind === 'member') !== (action === 'member-records') || entity.kind === 'stage' && action === 'records' && !entity.stageScoreBindingValid) return null;
  const artistReturn = productionReturn(group,route,production);
  if (!artistReturn) return null;
  return production.routeUrl(entity.kind === 'member'
    ? {nav:'members',member:entity.memberId,work:null,video:'mv',artistReturn}
    : {nav:'works',member:null,work:entity.workId,video:entity.kind,artistReturn});
}
export function referenceFor(route) {
  if (route?.page === 'member') return {kind:'member',key:route.key};
  if (route?.page === 'work') {const media = group.media.find(row=>row.key===route.key);return media ? {kind:media.kind,key:media.key} : null;}
  return null;
}
export function reviewTarget(hash) {
  return parseReviewRoute(group,hash) ? REVIEW_PATH + hash : null;
}
export function reviewHistoryState(previous, url, y=0, focus=null) {
  const next = previous && typeof previous === 'object' && !Array.isArray(previous) ? {...previous} : {};
  for (const key of ['timelineReturn','timelineOverviewFilters','artistScroll','artistRosterFocus','memberWorkFocus','sol15Review']) delete next[key];
  next.sol15Review = {path:url,y:Number.isFinite(y)&&y>=0?y:0,focus:typeof focus==='string'?focus:null};
  return next;
}
export function savedReviewPosition(state,url) {
  const saved=state?.sol15Review;
  return saved?.path===url && Number.isFinite(saved.y) && saved.y>=0 ? saved : null;
}
/** Private images are validated and handed to the queue, never directly loaded here. */
export const helpers=Object.freeze({...originalHelpers,href:(slug,page,key,query)=>slug===group.slug?reviewHref(slug,page,key,query):'',image:()=>{throw new Error('Private image references are required.');},resolveMediaAsset:()=>null});
