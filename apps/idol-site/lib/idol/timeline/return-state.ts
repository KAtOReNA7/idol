import {billlieEventReleases} from '../billlie-public-context';
import type {TimelineFilters} from './types';
import {CHRONOLOGICAL_TIMELINE_FILTERS} from './model';

/** UI navigation context only. Never contains catalog records or draft data. */
export interface TimelineReturnIdentity {
  eventId: string;
  kind: 'member' | 'work' | 'release';
  targetId: string;
}

export interface TimelineReturnState {
  version: 1;
  /** Exact pathname + query of this history entry, including timeline filters. */
  path: string;
  identity: TimelineReturnIdentity;
  filters: TimelineFilters;
  openDetails: string[];
  scrollY: number;
}

export interface TimelineReturnGates {
  ready: boolean;
  styleReady: boolean;
  dataReady: boolean;
  visible: boolean;
  blocked: boolean;
  modal: boolean;
  userTakeover: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const targetId = /^rec[A-Za-z0-9]+$/;
const boundedString = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 8192;
const ownKeys = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function isTimelineReturnIdentity(value: unknown): value is TimelineReturnIdentity {
  return isObject(value) && ownKeys(value, ['eventId', 'kind', 'targetId']) && boundedString(value.eventId) &&
    typeof value.targetId === 'string' && ((value.kind === 'member' || value.kind === 'work') && targetId.test(value.targetId) || value.kind === 'release' && Object.hasOwn(billlieEventReleases,value.eventId) && billlieEventReleases[value.eventId] === value.targetId);
}

export function sameTimelineReturnIdentity(left: TimelineReturnIdentity, right: TimelineReturnIdentity): boolean {
  return left.eventId === right.eventId && left.kind === right.kind && left.targetId === right.targetId;
}

export function isTimelineReturnFilters(value: unknown): value is TimelineFilters {
  return isObject(value) && ownKeys(value, ['type', 'importance', 'order']) &&
    ['all', 'members', 'release', 'organization'].includes(value.type as string) &&
    ['major', 'all'].includes(value.importance as string) && ['recent', 'earliest'].includes(value.order as string);
}

/** Validate legacy route shape, then normalize its retired preferences. */
export function timelineReturnFilters(path: string): TimelineFilters | null {
  if (typeof path !== 'string' || path.length > 4096 || !path.startsWith('/') || path.startsWith('//') || /[\\\u0000-\u0020#]/.test(path)) return null;
  let url: URL;
  try { url = new URL(path, 'https://timeline-return.invalid'); } catch { return null; }
  if (url.origin !== 'https://timeline-return.invalid' || !/^\/artists\/[a-z0-9][a-z0-9-]*$/.test(url.pathname) || path.split('?')[0] !== url.pathname) return null;
  const section = url.searchParams.get('section');
  if (url.searchParams.getAll('section').length > 1 || (section !== null && section !== 'overview' && section !== 'updates')) return null;
  const names = ['timelineType', 'timelineImportance', 'timelineOrder'];
  const choices = [['all', 'members', 'release', 'organization'], ['major', 'all'], ['recent', 'earliest']];
  for (let index = 0; index < names.length; index += 1) {
    const entries = url.searchParams.getAll(names[index]);
    if (entries.length > 1 || entries.length && (!choices[index].includes(entries[0]) || section !== 'updates')) return null;
  }
  return {...CHRONOLOGICAL_TIMELINE_FILTERS};
}

export function canUseTimelineReturn(gates: TimelineReturnGates): boolean {
  return gates.ready && gates.styleReady && gates.dataReady && gates.visible && !gates.blocked && !gates.modal && !gates.userTakeover;
}

export function createTimelineReturnState(
  path: string,
  identity: TimelineReturnIdentity,
  options: {openDetails?: readonly string[]; scrollY: number; filters?: TimelineFilters},
): TimelineReturnState | null {
  const routeFilters = timelineReturnFilters(path);
  if (!routeFilters || !isTimelineReturnIdentity(identity) || (identity.kind === 'release' && new URL(path,'https://timeline-return.invalid').pathname !== '/artists/billlie') || !Number.isFinite(options.scrollY) || options.scrollY < 0) return null;
  if (options.filters !== undefined && !isTimelineReturnFilters(options.filters)) return null;
  const filters = CHRONOLOGICAL_TIMELINE_FILTERS;
  const keys = options.openDetails ?? [];
  if (!Array.isArray(keys) || keys.length > 500 || !keys.every(boundedString)) return null;
  return {
    version: 1, path, identity: {...identity}, filters: {...filters},
    openDetails: [...new Set(keys)], scrollY: options.scrollY,
  };
}

/** Cross-group, cross-query, malformed and stale-shaped state fail closed. */
export function readTimelineReturnState(value: unknown, routeKey: string): TimelineReturnState | null {
  if (!isObject(value) || !ownKeys(value, ['version', 'path', 'identity', 'filters', 'openDetails', 'scrollY']) || value.version !== 1 || value.path !== routeKey || !isTimelineReturnIdentity(value.identity)) return null;
  if (!isTimelineReturnFilters(value.filters) || !Array.isArray(value.openDetails) || typeof value.scrollY !== 'number') return null;
  return createTimelineReturnState(routeKey, value.identity, {openDetails: value.openDetails, scrollY: value.scrollY, filters: value.filters});
}

/** Preserve unrelated history keys, especially memberWorkFocus and artistScroll. */
export function withTimelineReturnState(historyState: unknown, value: TimelineReturnState): Record<string, unknown> {
  return {...(isObject(historyState) ? historyState : {}), timelineReturn: value};
}
