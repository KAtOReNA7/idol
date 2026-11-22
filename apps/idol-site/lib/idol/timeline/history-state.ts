/** A fresh entry never inherits another entry's return target or geometry. */
export function newArtistHistoryState(value: unknown, destination?: string): Record<string, unknown> {
  const next = value && typeof value === 'object' && !Array.isArray(value) ? {...value} as Record<string, unknown> : {};
  const source = next.artistTimelineLink as {href?:unknown; entry?:unknown} | undefined;
  for (const key of ['timelineReturn', 'timelineOverviewFilters', 'artistScroll', 'artistRosterFocus', 'artistRosterOrigin', 'memberWorkFocus', 'artistTimelineLink', 'artistTimelineOrigin']) delete next[key];
  if (destination && source?.href === destination && typeof source.entry === 'string') next.artistTimelineOrigin = source.entry;
  return next;
}

/** Browsers can refuse same-document history updates under navigation rate limits. */
export function tryArtistHistoryChange(change: () => void): boolean {
  try {
    change();
    return true;
  } catch (error) {
    if ((error as Error)?.name === 'SecurityError') return false;
    throw error;
  }
}

/** A release detail can return to a cover that is mounted after the catalog arrives. */
export function focusLinkedRelease(anchor: HTMLAnchorElement | null) {
  if (!anchor || location.hash !== '#' + anchor.id) return;
  anchor.focus({preventScroll:true});
  anchor.scrollIntoView({block:'center', behavior:'instant'});
  tryArtistHistoryChange(() => history.replaceState(history.state, '', location.pathname + location.search));
}
