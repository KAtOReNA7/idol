const eventRow = '[data-artist-timeline] > li[id]';
const documentTransferKey = 'idol.nativeTimelineDocument';

export interface NativeTimelineLinkFocus {
  path: string;
  eventId: string;
  href: string;
  index: number;
  entry: string;
}

function sameDestination(row: Element, href: string) {
  return [...row.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .filter(link => link.getAttribute('href') === href);
}

/** A cover and its text link can open the same record from the same event. */
export function nativeTimelineLinkFocus(source: Element | undefined, path: string): NativeTimelineLinkFocus | undefined {
  if (source?.tagName !== 'A') return;
  const row = source.closest(eventRow);
  const href = source.getAttribute('href');
  if (!row || !href?.startsWith('/') || href.startsWith('//')) return;
  const index = sameDestination(row, href).findIndex(link => link === source);
  if (index >= 0) return {path, eventId: row.id, href, index, entry: crypto.getRandomValues(new Uint32Array(4)).join('-')};
}

type DocumentTransfer = {phase:'opening'; entry:string; href:string} | {phase:'leaving'; entry:string};

function readTransfer(): DocumentTransfer | null {
  try { return JSON.parse(sessionStorage.getItem(documentTransferKey) ?? 'null'); }
  catch { return null; }
}

function storeTransfer(value: DocumentTransfer | null) {
  try {
    if (value) sessionStorage.setItem(documentTransferKey, JSON.stringify(value));
    else sessionStorage.removeItem(documentTransferKey);
  } catch { /* The browser can disable tab storage. Ordinary link navigation still works. */ }
}

/** Pass only the navigation identity to a shared work page loaded as a new document. */
export function openTimelineWorkDocument(link: NativeTimelineLinkFocus) {
  if (link.href.startsWith('/?')) storeTransfer({phase:'opening', entry:link.entry, href:link.href});
}

export function trackTimelineWorkDocument() {
  const href = location.pathname + location.search;
  const opening = readTransfer();
  if (opening?.phase === 'opening') {
    storeTransfer(null);
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (opening.href === href && navigation?.type === 'navigate' && typeof opening.entry === 'string') {
      try {
        history.replaceState({...history.state, artistTimelineOrigin:opening.entry}, '', location.href);
      } catch { /* Focus restoration is optional when history updates are restricted. */ }
    }
  }
  return recordLeavingTimelineDetail();
}

export function recordLeavingTimelineDetail() {
  // Reloading a native detail can also turn its next Back into a document traversal.
  const leaving = () => {
    const entry = history.state?.artistTimelineOrigin;
    if (typeof entry === 'string') storeTransfer({phase:'leaving', entry});
    else if (readTransfer()?.phase === 'leaving') storeTransfer(null);
  };
  addEventListener('pagehide', leaving);
  return () => removeEventListener('pagehide', leaving);
}

export function returnedFromTimelineWorkDocument(link: NativeTimelineLinkFocus) {
  const leaving = readTransfer();
  if (leaving?.phase !== 'leaving') return false;
  storeTransfer(null);
  return leaving.entry === link.entry;
}

export function restoreNativeTimelineLink(saved: NativeTimelineLinkFocus) {
  if (typeof saved.eventId !== 'string' || typeof saved.href !== 'string' ||
      !saved.href.startsWith('/') || saved.href.startsWith('//') || !Number.isInteger(saved.index) || saved.index < 0) return;
  const row = document.getElementById(saved.eventId);
  if (!row?.matches(eventRow)) return;
  const link = sameDestination(row, saved.href)[saved.index];
  if (!link) return;

  const events = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin'] as const;
  const cancel = () => {
    cancelAnimationFrame(frame);
    events.forEach(name => document.removeEventListener(name, cancel, true));
  };
  const frame = requestAnimationFrame(() => {
    cancel();
    const active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement && active !== document.getElementById('artist-content')) return;
    if (location.pathname + location.search !== saved.path || !link.isConnected ||
        !link.getClientRects().length || link.closest('[hidden], [inert], [aria-hidden="true"]') ||
        document.querySelector('[aria-modal="true"],dialog[open]')) return;
    link.focus({preventScroll: true});
  });
  events.forEach(name => document.addEventListener(name, cancel, {capture:true, passive:true}));
  return cancel;
}
