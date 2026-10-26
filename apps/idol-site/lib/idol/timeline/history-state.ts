/** A fresh entry never inherits another entry's return target or geometry. */
export function newArtistHistoryState(value: unknown): Record<string, unknown> {
  const next = value && typeof value === 'object' && !Array.isArray(value) ? {...value} as Record<string, unknown> : {};
  for (const key of ['timelineReturn', 'timelineOverviewFilters', 'artistScroll', 'artistRosterFocus', 'memberWorkFocus']) delete next[key];
  return next;
}
