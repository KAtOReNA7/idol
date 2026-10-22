import type {
  ArtistTimeline,
  TimelineValidationContext,
  TimelineValidationIssue,
  TimelineValidationResult,
} from './types';

const RECORD_ID = /^rec[A-Za-z0-9]+$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const EVENT_TYPES = ['member_join', 'member_departure', 'debut', 'release', 'disband', 'agency_change', 'contract_end', 'rename', 'hiatus', 'resume', 'notice', 'other'] as const;
const STATUSES = ['confirmed', 'announced', 'planned', 'postponed', 'cancelled', 'uncertain'] as const;
const TIMELINE_KEYS = ['schemaVersion', 'groupId', 'slug', 'events', 'gaps'];
const EVENT_KEYS = ['id', 'groupId', 'eventType', 'title', 'summary', 'scopeNote', 'eventDate', 'announcementDate', 'plannedDate', 'status', 'importance', 'memberIds', 'workIds', 'releaseKey', 'relatedEventIds', 'sources', 'reviewStatus', 'holdReasons'];
const SOURCE_KEYS = ['id', 'url', 'publisher', 'title', 'sourcePublishedAt', 'checkedAt', 'scopeNote', 'evidenceRef'];

type RecordValue = Record<string, unknown>;
type EntityIndex = Map<string, Set<string>> | undefined;

function isRecord(input: unknown): input is RecordValue {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function own(input: RecordValue, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function calendarDate(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

/** Exact, non-null DateValue; supported Gregorian years are 0001–9999. */
export function validateTimelineDate(input: unknown): boolean {
  if (!isRecord(input) || Object.keys(input).length !== 2 || !own(input, 'value') || !own(input, 'precision')) return false;
  if (typeof input.value !== 'string') return false;
  if (input.precision === 'year') return /^\d{4}$/.test(input.value) && Number(input.value) > 0;
  if (input.precision === 'month') return /^\d{4}-(0[1-9]|1[0-2])$/.test(input.value) && Number(input.value.slice(0, 4)) > 0;
  return input.precision === 'day' && calendarDate(input.value);
}

/** Validate a source link without rewriting its URL or certifying its publisher. */
export function safeTimelineSourceUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const authority = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/.exec(input)?.[1];
  if (!authority || authority.includes('@')) return null;
  // WHATWG URL silently trims controls and normalizes backslashes: reject them first.
  if (/[\s\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\\]/u.test(input) || /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(input)) return null;
  try {
    const url = new URL(input);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname || url.username || url.password) return null;
    return input;
  } catch {
    return null;
  }
}

/**
 * Read-only validation of the shared v1 wire contract and supplied identities.
 * Unknown dates remain null. Status never infers occurrence, date, or publication.
 * Relationships are local to the supplied group timeline; source IDs are local
 * to an event and may be reused as evidence for another event.
 */
export function validateTimeline(input: unknown, context: TimelineValidationContext): TimelineValidationResult {
  const issues: TimelineValidationIssue[] = [];
  const add = (path: string, code: string, message: string) => { issues.push({ path, code, message }); };

  function object(value: unknown, keys: readonly string[], path: string): value is RecordValue {
    if (!isRecord(value)) {
      add(path, 'invalid_type', 'Expected an object.');
      return false;
    }
    for (const key of keys) if (!own(value, key)) add(`${path}.${key}`, 'required', 'Required field is missing.');
    for (const key of Object.keys(value)) if (!keys.includes(key)) add(`${path}.${key}`, 'additional_property', 'Field is not in the shared schema.');
    return true;
  }

  function string(value: unknown, path: string, nonempty = false, pattern?: RegExp): value is string {
    if (typeof value !== 'string') {
      add(path, 'invalid_type', 'Expected a string.');
      return false;
    }
    if (nonempty && value.length === 0) add(path, 'min_length', 'String must not be empty.');
    if (pattern && !pattern.test(value)) add(path, 'invalid_pattern', 'String does not match the shared schema.');
    return true;
  }

  function enumeration(value: unknown, allowed: readonly string[], path: string): void {
    if (typeof value !== 'string' || !allowed.includes(value)) add(path, 'invalid_enum', `Expected one of: ${allowed.join(', ')}.`);
  }

  function nullableDate(value: unknown, path: string): void {
    if (value !== null && !validateTimelineDate(value)) add(path, 'invalid_date', 'Expected null or an exact calendar DateValue with matching precision.');
  }

  function nullableString(value: unknown, path: string): void {
    if (value !== null) string(value, path);
  }

  function strings(value: unknown, path: string, unique = false, pattern?: RegExp): value is string[] {
    if (!Array.isArray(value)) {
      add(path, 'invalid_type', 'Expected an array.');
      return false;
    }
    const seen = new Set<string>();
    for (let i = 0; i < value.length; i += 1) {
      if (!string(value[i], `${path}[${i}]`, false, pattern)) continue;
      if (unique && seen.has(value[i])) add(`${path}[${i}]`, 'duplicate_id', 'Array values must be unique.');
      seen.add(value[i]);
    }
    return true;
  }

  const groupIndex = new Map<string, string>();
  const knownSlugs = new Set<string>();
  const runtimeContext: unknown = context;
  if (!isRecord(runtimeContext) || !Array.isArray(runtimeContext.groups)) {
    add('$context.groups', 'invalid_registry', 'A group identity registry is required.');
  } else {
    for (let i = 0; i < runtimeContext.groups.length; i += 1) {
      const group: unknown = runtimeContext.groups[i];
      const path = `$context.groups[${i}]`;
      if (!isRecord(group) || typeof group.groupId !== 'string' || !RECORD_ID.test(group.groupId) || typeof group.slug !== 'string' || !SLUG.test(group.slug)) {
        add(path, 'invalid_registry', 'Group registry entries require a valid groupId and slug.');
        continue;
      }
      if (groupIndex.has(group.groupId) || knownSlugs.has(group.slug)) add(path, 'duplicate_registry_id', 'Group IDs and slugs must have a unique mapping.');
      groupIndex.set(group.groupId, group.slug);
      knownSlugs.add(group.slug);
    }
  }

  function entities(name: 'members' | 'works'): EntityIndex {
    if (!isRecord(runtimeContext) || runtimeContext[name] === undefined) return undefined;
    const values = runtimeContext[name];
    const index = new Map<string, Set<string>>();
    if (!Array.isArray(values)) {
      add(`$context.${name}`, 'invalid_registry', 'Expected an entity identity registry array.');
      return index;
    }
    for (let i = 0; i < values.length; i += 1) {
      const entry: unknown = values[i];
      const path = `$context.${name}[${i}]`;
      if (!isRecord(entry) || typeof entry.id !== 'string' || !RECORD_ID.test(entry.id) || !Array.isArray(entry.groupIds)) {
        add(path, 'invalid_registry', 'Entity registry entries require an ID and groupIds array.');
        continue;
      }
      if (index.has(entry.id)) add(path, 'duplicate_registry_id', 'Entity IDs must be unique.');
      const groupIds = new Set<string>();
      for (let j = 0; j < entry.groupIds.length; j += 1) {
        const groupId: unknown = entry.groupIds[j];
        if (typeof groupId !== 'string' || !groupIndex.has(groupId)) add(`${path}.groupIds[${j}]`, 'invalid_registry', 'Entity group must exist in the group registry.');
        else {
          if (groupIds.has(groupId)) add(`${path}.groupIds[${j}]`, 'duplicate_registry_id', 'Entity groups must be unique.');
          groupIds.add(groupId);
        }
      }
      index.set(entry.id, groupIds);
    }
    return index;
  }

  const memberIndex = entities('members');
  const workIndex = entities('works');
  if (!object(input, TIMELINE_KEYS, '$')) return { ok: false, issues };
  if (input.schemaVersion !== 1) add('$.schemaVersion', 'invalid_version', 'Expected schemaVersion 1.');
  string(input.groupId, '$.groupId', false, RECORD_ID);
  string(input.slug, '$.slug', false, SLUG);
  if (typeof input.groupId === 'string') {
    if (!groupIndex.has(input.groupId)) add('$.groupId', 'unknown_group', 'Group ID is not in the supplied registry.');
    else if (groupIndex.get(input.groupId) !== input.slug) add('$.slug', 'group_slug_mismatch', 'Slug does not match this group ID.');
  }
  strings(input.gaps, '$.gaps');

  function identityReferences(value: unknown, path: string, index: EntityIndex, groupId: unknown): void {
    if (!strings(value, path, true, RECORD_ID)) return;
    if (value.length > 0 && index === undefined) {
      add(path, 'missing_registry', 'Nonempty identity references require the corresponding entity registry.');
      return;
    }
    for (let i = 0; i < value.length; i += 1) {
      if (typeof value[i] !== 'string') continue;
      const groups = index?.get(value[i]);
      if (!groups) add(`${path}[${i}]`, 'unknown_entity', 'Identity is not in the supplied registry.');
      else if (typeof groupId !== 'string' || !groups.has(groupId)) add(`${path}[${i}]`, 'entity_group_mismatch', 'Identity is not associated with this group.');
    }
  }

  function source(value: unknown, path: string): void {
    if (!object(value, SOURCE_KEYS, path)) return;
    string(value.id, `${path}.id`, true);
    if (safeTimelineSourceUrl(value.url) === null) add(`${path}.url`, 'unsafe_source_url', 'Expected an unambiguous HTTP(S) URL without credentials or controls.');
    string(value.publisher, `${path}.publisher`);
    string(value.title, `${path}.title`);
    nullableDate(value.sourcePublishedAt, `${path}.sourcePublishedAt`);
    if (typeof value.checkedAt !== 'string' || !calendarDate(value.checkedAt)) add(`${path}.checkedAt`, 'invalid_date', 'Expected a real YYYY-MM-DD calendar date.');
    string(value.scopeNote, `${path}.scopeNote`);
    nullableString(value.evidenceRef, `${path}.evidenceRef`);
  }

  const eventIds = new Map<string, unknown>();
  if (!Array.isArray(input.events)) add('$.events', 'invalid_type', 'Expected an array.');
  else {
    for (let i = 0; i < input.events.length; i += 1) {
      const event: unknown = input.events[i];
      const path = `$.events[${i}]`;
      if (!object(event, EVENT_KEYS, path)) continue;
      if (string(event.id, `${path}.id`, true)) {
        if (eventIds.has(event.id)) add(`${path}.id`, 'duplicate_event_id', 'Event ID occurs more than once in this timeline.');
        eventIds.set(event.id, event.groupId);
      }
      string(event.groupId, `${path}.groupId`, false, RECORD_ID);
      if (event.groupId !== input.groupId) add(`${path}.groupId`, 'event_group_mismatch', 'Event group must match the enclosing timeline.');
      enumeration(event.eventType, EVENT_TYPES, `${path}.eventType`);
      string(event.title, `${path}.title`, true);
      string(event.summary, `${path}.summary`);
      string(event.scopeNote, `${path}.scopeNote`);
      nullableDate(event.eventDate, `${path}.eventDate`);
      nullableDate(event.announcementDate, `${path}.announcementDate`);
      nullableDate(event.plannedDate, `${path}.plannedDate`);
      enumeration(event.status, STATUSES, `${path}.status`);
      enumeration(event.importance, ['major', 'supporting'], `${path}.importance`);
      identityReferences(event.memberIds, `${path}.memberIds`, memberIndex, event.groupId);
      identityReferences(event.workIds, `${path}.workIds`, workIndex, event.groupId);
      nullableString(event.releaseKey, `${path}.releaseKey`);
      strings(event.relatedEventIds, `${path}.relatedEventIds`, true);
      enumeration(event.reviewStatus, ['ready', 'hold'], `${path}.reviewStatus`);
      if (strings(event.holdReasons, `${path}.holdReasons`)) {
        if (event.reviewStatus === 'hold' && event.holdReasons.length < 1) add(`${path}.holdReasons`, 'hold_reason_required', 'Held events require at least one reason.');
        if (event.reviewStatus === 'ready' && event.holdReasons.length !== 0) add(`${path}.holdReasons`, 'ready_has_hold_reasons', 'Ready events must have an empty holdReasons array.');
      }
      if (!Array.isArray(event.sources)) add(`${path}.sources`, 'invalid_type', 'Expected an array.');
      else {
        if (event.sources.length < 1) add(`${path}.sources`, 'source_required', 'Each event requires at least one evidence source.');
        const sourceIds = new Set<string>();
        for (let j = 0; j < event.sources.length; j += 1) {
          const item: unknown = event.sources[j];
          source(item, `${path}.sources[${j}]`);
          if (isRecord(item) && typeof item.id === 'string') {
            if (sourceIds.has(item.id)) add(`${path}.sources[${j}].id`, 'duplicate_source_id', 'Source IDs must be unique within an event.');
            sourceIds.add(item.id);
          }
        }
      }
    }
    for (let i = 0; i < input.events.length; i += 1) {
      const event: unknown = input.events[i];
      if (!isRecord(event) || !Array.isArray(event.relatedEventIds)) continue;
      for (let j = 0; j < event.relatedEventIds.length; j += 1) {
        const related: unknown = event.relatedEventIds[j];
        const path = `$.events[${i}].relatedEventIds[${j}]`;
        if (typeof related !== 'string') continue;
        if (related === event.id) add(path, 'self_relationship', 'An event cannot relate to itself.');
        else if (!eventIds.has(related)) add(path, 'unknown_related_event', 'Related event is not in this group timeline.');
        else if (eventIds.get(related) !== event.groupId) add(path, 'related_group_mismatch', 'Related event must belong to the same group.');
      }
    }
  }
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as unknown as ArtistTimeline, issues: [] };
}
