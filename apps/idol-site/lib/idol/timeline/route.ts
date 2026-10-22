import type { TimelineFilters } from './types';

const DEFAULTS: TimelineFilters = { type: 'all', importance: 'major', order: 'recent' };
const PARAMS = ['timelineType', 'timelineImportance', 'timelineOrder'] as const;
const VALUES = [['all', 'members', 'release', 'organization'], ['major', 'all'], ['recent', 'earliest']] as const;
export type TimelineRouteResult = { ok: true; filters: TimelineFilters } | { ok: false; reason: string };

/** Host must supply the authoritative 51 artist paths; no global journey access. */
export function readTimelineFilters(value: string, artistPaths: readonly string[]): TimelineRouteResult {
  let url: URL;
  try { url = new URL(value, 'https://timeline.invalid'); } catch { return { ok: false, reason: 'invalid_url' }; }
  // Only local artist return paths are accepted; absolute and protocol-relative inputs are rejected.
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value) || url.origin !== 'https://timeline.invalid') return { ok: false, reason: 'external_path' };
  if (!artistPaths.includes(url.pathname) || url.searchParams.getAll('section').length !== 1 || url.searchParams.get('section') !== 'updates') return { ok: false, reason: 'not_artist_updates' };
  for (let index = 0; index < PARAMS.length; index++) {
    const values = url.searchParams.getAll(PARAMS[index]);
    if (values.length > 1 || (values.length === 1 && !(VALUES[index] as readonly string[]).includes(values[0]))) return { ok: false, reason: 'invalid_' + PARAMS[index] };
  }
  return { ok: true, filters: {
    type: (url.searchParams.get('timelineType') ?? DEFAULTS.type) as TimelineFilters['type'],
    importance: (url.searchParams.get('timelineImportance') ?? DEFAULTS.importance) as TimelineFilters['importance'],
    order: (url.searchParams.get('timelineOrder') ?? DEFAULTS.order) as TimelineFilters['order'],
  } };
}

/** Preserves unrelated roster/work state. This is serialization only, not a navigation/guard. */
export function writeTimelineFilters(value: string, filters: TimelineFilters, artistPaths: readonly string[]): string | null {
  if (!readTimelineFilters(value, artistPaths).ok) return null;
  if (!VALUES[0].includes(filters.type) || !VALUES[1].includes(filters.importance) || !VALUES[2].includes(filters.order)) return null;
  const url = new URL(value, 'https://timeline.invalid');
  const selected = [filters.type, filters.importance, filters.order];
  const defaults = [DEFAULTS.type, DEFAULTS.importance, DEFAULTS.order];
  PARAMS.forEach((key, index) => { url.searchParams.delete(key); if (selected[index] !== defaults[index]) url.searchParams.set(key, selected[index]); });
  return url.pathname + (url.searchParams.size ? '?' + url.searchParams.toString() : '') + url.hash;
}
