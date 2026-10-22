import type { TimelineDate, TimelineEvent, TimelineFilters } from './types';

export const DEFAULT_TIMELINE_FILTERS: TimelineFilters = Object.freeze({
  type: 'all',
  importance: 'major',
  order: 'recent',
});

export interface TimelineEventGroup {
  /** The primary event id, stable across filtering and input ordering. */
  id: string;
  /** Primary event first; explicitly linked, ready context follows. */
  events: TimelineEvent[];
  date: TimelineDate | null;
  /** At least one visible group has an intersecting, imprecise date range. */
  ambiguousOrder: boolean;
}

export interface TimelineSection {
  id: 'confirmed' | 'announcements' | 'undated';
  label: string;
  groups: TimelineEventGroup[];
}

export interface TimelineSelection {
  sections: TimelineSection[];
  holdCount: number;
  readyCount: number;
  /** Number of timeline cards after explicit grouping and filtering. */
  visibleEventCount: number;
  /** Number of ready assertions, including context within visible cards. */
  visibleAssertionCount: number;
}

interface DateInterval { start: string; end: string }

function lexical(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function lastDay(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Calendar bounds are internal ordering aids, never invented display dates. */
export function dateInterval(date: TimelineDate | null): DateInterval | null {
  if (!date || typeof date.value !== 'string') return null;
  if (date.precision !== 'year' && date.precision !== 'month' && date.precision !== 'day') return null;
  const patterns = { year: /^\d{4}$/, month: /^\d{4}-\d{2}$/, day: /^\d{4}-\d{2}-\d{2}$/ };
  const pattern = patterns[date.precision];
  if (!pattern || !pattern.test(date.value)) return null;
  const [year, month, day] = date.value.split('-').map(Number);
  if (year < 1 || year > 9999) return null;
  if (date.precision === 'year') return { start: `${date.value}-01-01`, end: `${date.value}-12-31` };
  if (month < 1 || month > 12) return null;
  const monthEnd = lastDay(year, month);
  if (date.precision === 'month') return { start: `${date.value}-01`, end: `${date.value}-${monthEnd}` };
  if (day < 1 || day > monthEnd) return null;
  return { start: date.value, end: date.value };
}

export function formatTimelineDate(date: TimelineDate | null): string {
  if (!dateInterval(date) || !date) return '日期未明';
  const [year, month, day] = date.value.split('-').map(Number);
  if (date.precision === 'year') return `${year} 年（年内日期未详）`;
  if (date.precision === 'month') return `${year} 年 ${month} 月（月内日期未详）`;
  return `${year} 年 ${month} 月 ${day} 日`;
}

/**
 * A range-overlap comparator is not transitive. Instead, build the partial
 * order of strictly disjoint intervals, then use id priority in Kahn's
 * topological sort. Every provable ordering survives; intersecting ranges
 * receive only a deterministic presentation order. Unknown dates come last.
 */
export function sortTimelineEvents(
  events: readonly TimelineEvent[],
  order: TimelineFilters['order'] = 'recent',
): TimelineEvent[] {
  const entries = events.map((event, index) => ({ event, index, interval: dateInterval(event.eventDate) }));
  const dated = entries.filter((entry) => entry.interval !== null);
  const undated = entries.filter((entry) => entry.interval === null);
  const edges: number[][] = dated.map(() => []);
  const incoming = dated.map(() => 0);
  for (let left = 0; left < dated.length; left += 1) {
    for (let right = left + 1; right < dated.length; right += 1) {
      const a = dated[left].interval!;
      const b = dated[right].interval!;
      let earlier: number;
      let later: number;
      if (a.end < b.start) { earlier = left; later = right; }
      else if (b.end < a.start) { earlier = right; later = left; }
      else continue;
      const [before, after] = order === 'earliest' ? [earlier, later] : [later, earlier];
      edges[before].push(after);
      incoming[after] += 1;
    }
  }
  const compareEntry = (left: typeof entries[number], right: typeof entries[number]) =>
    lexical(left.event.id, right.event.id) || left.index - right.index;
  const available = incoming.flatMap((count, index) => count === 0 ? [index] : []);
  const sorted: TimelineEvent[] = [];
  while (available.length) {
    available.sort((left, right) => compareEntry(dated[left], dated[right]));
    const next = available.shift()!;
    sorted.push(dated[next].event);
    for (const after of edges[next]) {
      incoming[after] -= 1;
      if (incoming[after] === 0) available.push(after);
    }
  }
  return sorted.concat(undated.sort(compareEntry).map((entry) => entry.event));
}

function nonemptyReleaseKey(event: TimelineEvent): string | null {
  return typeof event.releaseKey === 'string' && event.releaseKey.trim() ? event.releaseKey : null;
}

function primaryOrder(left: TimelineEvent, right: TimelineEvent): number {
  const rank = (event: TimelineEvent): number =>
    (event.eventType === 'notice' ? 4 : 0) +
    (event.status === 'confirmed' && dateInterval(event.eventDate) ? 0 : 2) +
    (event.importance === 'major' ? 0 : 1);
  return rank(left) - rank(right) || lexical(left.id, right.id);
}

function linkedNotice(notice: TimelineEvent, event: TimelineEvent): boolean {
  if (notice.groupId !== event.groupId || event.eventType === 'notice') return false;
  // An explicit relation is supplied by the evidence author. It can identify
  // organizational, member or release context without a guessed text match.
  return notice.relatedEventIds.includes(event.id) || event.relatedEventIds.includes(notice.id);
}

/** Explicit identities only: no song-title, date, text or source heuristics. */
function groupReadyEvents(events: readonly TimelineEvent[]): TimelineEventGroup[] {
  const units: TimelineEvent[][] = [];
  const releases = new Map<string, Map<string, TimelineEvent[]>>();
  const notices: TimelineEvent[] = [];
  for (const event of events) {
    if (event.eventType === 'notice') { notices.push(event); continue; }
    const key = event.eventType === 'release' ? nonemptyReleaseKey(event) : null;
    if (key === null) { units.push([event]); continue; }
    let groupKeys = releases.get(event.groupId);
    if (!groupKeys) { groupKeys = new Map(); releases.set(event.groupId, groupKeys); }
    let release = groupKeys.get(key);
    if (!release) { release = []; groupKeys.set(key, release); units.push(release); }
    release.push(event);
  }
  for (const notice of notices) {
    const targets = units.filter((unit) => unit.some((event) => linkedNotice(notice, event)));
    // A broad notice must not merge two distinct events through transitivity.
    if (targets.length === 1) targets[0].push(notice);
    else units.push([notice]);
  }
  return units.map((eventsInGroup) => {
    const ordered = [...eventsInGroup].sort(primaryOrder);
    const primary = ordered[0];
    // Keep the primary fixed; context ordering is identity-based, not chronology.
    const context = ordered.slice(1).sort((left, right) => lexical(left.id, right.id));
    return {
      id: primary.id,
      events: [primary, ...context],
      date: dateInterval(primary.eventDate) ? primary.eventDate : null,
      ambiguousOrder: false,
    };
  });
}

function matchesType(event: TimelineEvent, type: TimelineFilters['type']): boolean {
  if (type === 'all') return true;
  if (type === 'members') return ['member_join', 'member_departure', 'debut', 'disband', 'rename'].includes(event.eventType);
  if (type === 'release') return event.eventType === 'release';
  return ['agency_change', 'contract_end', 'hiatus', 'resume'].includes(event.eventType);
}

function sortedGroups(groups: TimelineEventGroup[], order: TimelineFilters['order']): TimelineEventGroup[] {
  const byPrimary = new Map(groups.map((group) => [group.events[0], group]));
  const ordered = sortTimelineEvents(groups.map((group) => group.events[0]), order).map((event) => byPrimary.get(event)!);
  return ordered.map((group, index) => {
    const interval = dateInterval(group.date);
    const ambiguousOrder = interval !== null && ordered.some((other, otherIndex) => {
      if (index === otherIndex || !other.date || !group.date) return false;
      if (other.date.precision === 'day' && group.date.precision === 'day') return false;
      const otherInterval = dateInterval(other.date);
      return otherInterval !== null && interval.start <= otherInterval.end && otherInterval.start <= interval.end;
    });
    return { ...group, ambiguousOrder };
  });
}

export function selectTimeline(
  events: readonly TimelineEvent[],
  filters: Partial<TimelineFilters> = {},
): TimelineSelection {
  // Invalid runtime filter values fall back independently; URL validation is a
  // separate navigation concern. Never mutate the caller's filter object.
  const type = ['all', 'members', 'release', 'organization'].includes(filters.type ?? '') ? filters.type! : DEFAULT_TIMELINE_FILTERS.type;
  const importance = filters.importance === 'all' ? 'all' : 'major';
  const order = filters.order === 'earliest' ? 'earliest' : 'recent';
  const ready = events.filter((event) => event.reviewStatus === 'ready');
  const visible = groupReadyEvents(ready).filter((group) =>
    group.events.some((event) => matchesType(event, type)) &&
    (importance === 'all' || group.events.some((event) => event.importance === 'major')),
  );
  const sections: TimelineSection[] = [
    { id: 'confirmed', label: '已证事件', groups: [] },
    { id: 'announcements', label: '公告与计划', groups: [] },
    { id: 'undated', label: '事件日期未明', groups: [] },
  ];
  for (const group of visible) {
    const primary = group.events[0];
    // Only eventDate locates an assertion on the axis. Neither the clock nor
    // announcement/publication/verification/plan dates can confirm occurrence.
    const section = primary.status !== 'confirmed' ? sections[1] : group.date ? sections[0] : sections[2];
    section.groups.push(group);
  }
  for (const section of sections) section.groups = sortedGroups(section.groups, order);
  return {
    sections,
    holdCount: events.filter((event) => event.reviewStatus === 'hold').length,
    readyCount: ready.length,
    visibleEventCount: visible.length,
    visibleAssertionCount: visible.reduce((count, group) => count + group.events.length, 0),
  };
}

/** Fixed public presentation; legacy URL/state filters are never selectors. */
export const CHRONOLOGICAL_TIMELINE_FILTERS: TimelineFilters = Object.freeze({type:'all',importance:'all',order:'earliest'});

/** A dated announcement is an announcement, never a backfilled effective date. */
export function timelineDateKind(event: TimelineEvent): 'occurred'|'announcement'|'planned'|'unknown' {
  if (event.status === 'confirmed') return dateInterval(event.eventDate) ? 'occurred' : 'unknown';
  if (event.status === 'planned') return dateInterval(event.plannedDate) ? 'planned' : 'unknown';
  if (dateInterval(event.announcementDate)) return 'announcement';
  // A scheduled release date is not the date its postponement was announced.
  if (event.status === 'postponed' || event.status === 'cancelled') return 'unknown';
  if (dateInterval(event.plannedDate)) return 'planned';
  return dateInterval(event.eventDate) ? 'occurred' : 'unknown';
}

export function timelineDisplayDate(event: TimelineEvent): TimelineDate | null {
  const kind=timelineDateKind(event);
  return kind==='occurred'?event.eventDate:kind==='announcement'?event.announcementDate:kind==='planned'?event.plannedDate:null;
}

/** All ready facts share one axis, including distinct related releases/notices. */
export function selectChronologicalTimeline(events: readonly TimelineEvent[]): TimelineEvent[] {
  const ready=events.filter(event=>event.reviewStatus==='ready');
  const original=new Map(ready.map(event=>[event.id,event]));
  return sortTimelineEvents(ready.map(event=>({...event,eventDate:timelineDisplayDate(event)})),'earliest').map(event=>original.get(event.id)!);
}
