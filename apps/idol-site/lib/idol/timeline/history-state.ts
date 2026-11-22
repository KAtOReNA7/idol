/** A fresh entry never inherits another entry's return target or geometry. */
export function newArtistHistoryState(value: unknown): Record<string, unknown> {
  const next = value && typeof value === 'object' && !Array.isArray(value) ? {...value} as Record<string, unknown> : {};
  for (const key of ['timelineReturn', 'timelineOverviewFilters', 'artistScroll', 'artistRosterFocus', 'artistRosterOrigin', 'memberWorkFocus', 'artistTimelineLink']) delete next[key];
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
