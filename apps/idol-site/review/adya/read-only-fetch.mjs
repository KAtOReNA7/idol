/** No native-fetch fallback, identity call, write, image proxy or real service. */
export function createReadOnlyReviewFetch(catalog, origin) {
  return async function reviewFetch(input, init = {}) {
    const request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
    const signal = init.signal ?? request?.signal;
    if (signal?.aborted) throw new DOMException('Review read was cancelled', 'AbortError');
    const method = (init.method ?? request?.method ?? 'GET').toUpperCase();
    const json = (body, status) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
    if (method !== 'GET') return json({error: 'REVIEW_READ_ONLY'}, 405);
    let url;
    try { url = new URL(request?.url ?? String(input), origin); }
    catch { return json({error: 'REVIEW_INVALID_REQUEST'}, 400); }
    if (url.origin !== origin) return json({error: 'REVIEW_EXTERNAL_SERVICE_DISABLED'}, 403);
    if (url.pathname !== '/api/catalog') return json({error: 'REVIEW_ENDPOINT_UNAVAILABLE'}, 404);
    const params = url.searchParams;
    if ([...params.keys()].some(key => !['artist', 'shape'].includes(key)) || params.getAll('artist').length > 1 || params.getAll('shape').length > 1 || params.get('shape') !== 'display-v1' || params.has('artist') && params.get('artist') !== 'adya') {
      return json({error: 'REVIEW_CATALOG_SCOPE'}, 400);
    }
    return json(catalog, 200);
  };
}
