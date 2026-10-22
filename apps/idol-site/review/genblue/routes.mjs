// Static hosts can serve directory indexes with a trailing slash or an explicit
// filename. Normalize only the known review aliases before the native router runs.
export function canonicalReviewPath(pathname) {
  if (['/artists/genblue/', '/artists/genblue/index.html', '/review-genblue', '/review-genblue/', '/review-genblue/index.html'].includes(pathname)) return '/artists/genblue';
  return pathname === '/index.html' ? '/' : pathname;
}

export function normalizeReviewLocation(location, history) {
  const pathname = canonicalReviewPath(location.pathname);
  if (pathname !== location.pathname) history.replaceState(history.state, '', pathname + location.search + location.hash);
  return pathname;
}
