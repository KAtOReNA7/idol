const pages = new Set(['home', 'members', 'member', 'works', 'work', 'timeline']);
export function parseRoute(hash = '') {
  const value = hash.replace(/^#\/?/, '');
  const [path, rawQuery = ''] = value.split(/\?(.*)/s);
  let parts;
  try { parts = path.split('/').filter(Boolean).map(decodeURIComponent); } catch { return {slug: null, page: 'not-found', key: null, query: new URLSearchParams()}; }
  const [slug = null, page = 'home', key = null, ...rest] = parts;
  return {slug, page: pages.has(page) && !rest.length && (['member','work'].includes(page) ? Boolean(key) : key === null) ? page : 'not-found', key, query: new URLSearchParams(rawQuery)};
}
