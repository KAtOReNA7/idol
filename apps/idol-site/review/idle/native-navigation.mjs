/** Static directories may redirect without retaining their query string. Keep
 * native dirty/save guards and state capture, adapting only the final review URL. */
export function reviewNavigationSource(source) {
  const needle='window.location.assign(safe)';
  if(source.split(needle).length!==2)throw new Error('Native artist navigation changed; review this adapter before building');
  const referrer='safeArtistReturn(ref.pathname+ref.search)';
  if(source.split(referrer).length!==2)throw new Error('Native return guard changed; review this adapter before building');
  return 'import {reviewArtistHref,canonicalReviewPath} from "../review/idle/routes.mjs";\n'+source.replace(needle,'window.location.assign(reviewArtistHref(safe,location.href))').replace(referrer,'safeArtistReturn(canonicalReviewPath(ref.pathname)+ref.search)');
}

export function reviewTimelineSource(file,source) {
  const needle=file==='artist-timeline-host.tsx'?'window.location.pathname+window.location.search':file==='use-timeline-return.ts'?'location.pathname + location.search':null;
  if(!needle||source.split(needle).length!==2)throw new Error('Native timeline location changed; review this adapter before building');
  return 'import {canonicalReviewPath} from "../review/idle/routes.mjs";\n'+source.replace(needle,'canonicalReviewPath(location.pathname)+location.search');
}
