import type {CatalogView} from './types';
import {CATALOG_READ_TIMEOUT_MS} from './catalog-read-deadline';

const recordId = /^rec[A-Za-z0-9]{1,80}$/;
const detailPrefix = 'work-detail=';
const displayPreference = 'omit-stage-candidates';
export const workCatalogUrl = '/api/catalog?shape=display-v1';
export const openingCatalogElement = 'initial-work-catalog';
export const catalogAccessHeader = 'X-Catalog-Access';
export const catalogAccessChangedMessage = '登录状态已变化，请刷新页面后重新打开作品。';

export function validDetailWork(id: string | null): string | null {
  return id && recordId.test(id) ? id : null;
}

export function workCatalogHeaders(workId: string | null) {
  const id = validDetailWork(workId);
  return {Prefer: id ? displayPreference + ', ' + detailPrefix + id : displayPreference};
}

export function preferredDetailWork(header: string | null): string | null {
  const targets = (header ?? '').split(',').map(value => value.trim()).filter(value => value.startsWith(detailPrefix));
  return targets.length === 1 ? validDetailWork(targets[0].slice(detailPrefix.length)) : null;
}

export function catalogCoversRoute(catalog: CatalogView | null, workId: string | null): boolean {
  return !!catalog && (!catalog.scope || (catalog.scope.type === 'work' && catalog.scope.workId === workId));
}

type OpeningCatalog = {
  workId: string;
  canEdit: boolean;
  response: Promise<Response>;
  controller: AbortController;
  forget: () => void;
};
type OpeningScript = HTMLScriptElement & {openingCatalog?: OpeningCatalog};

// The document parser runs this before React needs its imported modules. All
// interpolations below are fixed application constants. URLs come from the browser.
export const openingCatalogScript = `(() => {
  const script = document.currentScript;
  if (!script || location.pathname !== '/' || document.prerendering || !document.referrer ||
      history.state?.idolBrowse || performance.getEntriesByType('navigation')[0]?.type !== 'navigate') return;
  const params = new URLSearchParams(location.search);
  const workId = params.get('work');
  if (params.get('view') !== 'works' || params.getAll('work').length !== 1 ||
      !workId || !${recordId}.test(workId) || params.has('member') || params.has('group')) return;
  const originPage = new URL(document.referrer);
  const returnPath = params.get('returnTo');
  if (!returnPath || !/^\\/artists\\/[a-z0-9-]+$/.test(originPage.pathname) ||
      originPage.origin !== location.origin || returnPath.split('?')[0] !== originPage.pathname) return;
  const controller = new AbortController();
  const response = fetch(${JSON.stringify(workCatalogUrl)}, {
    cache: 'no-store', signal: controller.signal,
    headers: {Prefer: ${JSON.stringify(displayPreference + ', ' + detailPrefix)} + workId}
  });
  response.catch(() => {});
  const cancel = () => { forget(); controller.abort(); };
  const timer = setTimeout(cancel, ${CATALOG_READ_TIMEOUT_MS});
  const forget = () => {
    clearTimeout(timer);
    window.removeEventListener('pagehide', cancel);
    delete script.openingCatalog;
  };
  script.openingCatalog = {workId, canEdit: script.dataset.canEdit === '1', response, controller, forget};
  window.addEventListener('pagehide', cancel, {once: true});
})();`;

export function takeOpeningCatalog(workId: string | null, canEdit: boolean, signal: AbortSignal) {
  if (typeof document === 'undefined') return null;
  const script = document.getElementById(openingCatalogElement) as OpeningScript | null;
  const opening = script?.openingCatalog;
  if (!opening) return null;
  opening.forget();
  if (opening.workId !== workId || opening.canEdit !== canEdit || signal.aborted) {
    opening.controller.abort();
    return null;
  }
  const abort = () => opening.controller.abort();
  signal.addEventListener('abort', abort, {once: true});
  return {response: opening.response, release: () => signal.removeEventListener('abort', abort)};
}
