const eventRow = '[data-artist-timeline] > li[id]';

export interface NativeTimelineLinkFocus {
  path: string;
  eventId: string;
  href: string;
  index: number;
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
  if (index >= 0) return {path, eventId: row.id, href, index};
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
