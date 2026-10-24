export const ARTIST_PATH = '/artists/everglow';
export const RECORDS_PATH = '/review-everglow/records.html';

// Normalize only physical aliases owned by this review. The accepted GENBLUE
// root page and all unknown paths retain their existing identity.
export function canonicalReviewPath(pathname) {
  // Sites redirects named HTML files to extensionless URLs before rendering.
  if(pathname==='/review-everglow/records')return RECORDS_PATH;
  return ['/artists/everglow/', '/artists/everglow/index.html', '/review-everglow', '/review-everglow/', '/review-everglow/index.html'].includes(pathname) ? ARTIST_PATH : pathname;
}

export function normalizeReviewLocation(location, _history) {
  // Keep a physical address in the bar so reload/copy retains its query even
  // when the static server's directory redirect drops search parameters.
  return canonicalReviewPath(location.pathname);
}

export function installArtistHistory(history, location) {
  const original={pushState:history.pushState,replaceState:history.replaceState};
  for(const method of ['pushState','replaceState'])history[method]=function(...args){
    if(args.length>=3)args[2]=reviewArtistHref(args[2],location.href);
    return Reflect.apply(original[method],history,args);
  };
  return()=>{history.pushState=original.pushState;history.replaceState=original.replaceState;};
}

// Only used inside the everglow review document. Preserve the exact query and hash,
// including the native returnTo value, while keeping the everglow fixture selected
// after reloads, copied URLs and opening anchors in a new tab.
export function reviewRecordHref(value, baseUrl) {
  if (value === null || value === undefined) return value;
  let url, base;
  try { base = new URL(baseUrl); url = new URL(String(value), base); }
  catch { return value; }
  if (url.origin !== base.origin || !['/', '/index.html'].includes(url.pathname)) return value;
  return RECORDS_PATH + url.search + url.hash;
}

// Use the physical file for full document navigation. Internal history state
// remains canonical, and returnTo is never changed or widened.
export function reviewArtistHref(value, baseUrl) {
  if(value===null||value===undefined)return value;
  let url,base;try{base=new URL(baseUrl);url=new URL(String(value),base);}catch{return value;}
  if(url.origin!==base.origin||![ARTIST_PATH,ARTIST_PATH+'/'].includes(url.pathname))return value;
  return ARTIST_PATH+'/index.html'+url.search+url.hash;
}

// The shared App emits root URLs in both its initial replaceState and later
// navigation. Adapting only at this review boundary preserves its route/state
// protocol without changing production navigation or the GENBLUE root bundle.
export function installRecordHistory(history, location) {
  const original = {pushState: history.pushState, replaceState: history.replaceState};
  for (const method of ['pushState', 'replaceState']) {
    history[method] = function (...args) {
      if (args.length >= 3) args[2] = reviewRecordHref(args[2], location.href);
      return Reflect.apply(original[method], history, args);
    };
  }
  return () => { history.pushState = original.pushState; history.replaceState = original.replaceState; };
}

// Rewrite the actual href rather than intercepting click. Native onClick
// scroll/history handling, keyboard activation and modified/new-tab clicks all
// continue normally. Observe React commits and later href changes as well.
export function installReviewLinks(root, location, Observer = MutationObserver) {
  const update = () => {
    for (const anchor of root.querySelectorAll('a[href]')) {
      const original = anchor.getAttribute('href');
      const mapped = reviewArtistHref(reviewRecordHref(original, location.href), location.href);
      if (mapped !== original) anchor.setAttribute('href', mapped);
    }
  };
  const observer = new Observer(update);
  observer.observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['href']});
  update();
  return () => observer.disconnect();
}
