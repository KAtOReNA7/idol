import type { ArtistTimeline, TimelineValidationContext, TimelineValidationIssue } from './types';
import { validateTimeline } from './validate';

/** The host supplies reviewed documents and identities. This module performs no I/O. */
export interface TimelineRegistry extends TimelineValidationContext {
  timelines?: Readonly<Record<string, unknown>>;
}
export interface TimelineLookup {
  state: 'unknown' | 'empty' | 'invalid' | 'ready';
  timeline: ArtistTimeline | null;
  issues: TimelineValidationIssue[];
}
const EMPTY_REGISTRY: TimelineRegistry = { groups: [] };

export function getArtistTimeline(groupId: string, registry: TimelineRegistry = EMPTY_REGISTRY): TimelineLookup {
  const group = Array.isArray(registry?.groups) ? registry.groups.find(entry => entry?.groupId === groupId) : undefined;
  const empty: ArtistTimeline = { schemaVersion: 1, groupId, slug: group?.slug ?? 'unknown', events: [], gaps: ['已核事件待整理'] };
  const preflight = validateTimeline(empty, registry);
  const contextIssues = preflight.issues.filter(issue => issue.path.startsWith('$context'));
  if (contextIssues.length) return { state: 'invalid', timeline: null, issues: contextIssues };
  if (!group) return { state: 'unknown', timeline: null, issues: [] };
  if (!preflight.ok) return { state: 'invalid', timeline: null, issues: preflight.issues };
  if (!registry.timelines || !Object.hasOwn(registry.timelines, groupId)) {
    return { state: 'empty', timeline: empty, issues: [] };
  }
  const result = validateTimeline(registry.timelines[groupId], registry);
  if (!result.ok) return { state: 'invalid', timeline: null, issues: result.issues };
  if (result.value.groupId !== groupId) {
    return { state: 'invalid', timeline: null, issues: [{ path: '/groupId', code: 'registry_key', message: '资料所属团体与请求不一致。' }] };
  }
  return { state: result.value.events.length ? 'ready' : 'empty', timeline: result.value, issues: [] };
}
