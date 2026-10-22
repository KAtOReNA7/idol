import type { CatalogView } from '../types';
import type { TimelineGroupIdentity, TimelineValidationContext } from './types';

export type TimelineIdentityCatalog = Pick<CatalogView, 'members' | 'works'>;
export type TimelineIdentityKind = 'member' | 'work';
export type TimelineIdentityReason = 'not-loaded' | 'missing' | 'conflict' | 'invalid' | 'unknown-group' | 'wrong-group';

/** UI/audit metadata only. None of these properties belongs in a timeline JSON. */
export interface TimelineIdentityUsability {
  id: string;
  kind: TimelineIdentityKind;
  usable: boolean;
  reason: TimelineIdentityReason | null;
  groupIds: readonly string[];
  currentGroupIds: readonly string[];
  formerGroupIds: readonly string[];
}

export interface TimelineIdentityConflict {
  id: string;
  kind: TimelineIdentityKind;
  reason: 'conflict';
}

export interface TimelineIdentityContext {
  context: TimelineValidationContext;
  loaded: boolean;
  members: ReadonlyMap<string, TimelineIdentityUsability>;
  works: ReadonlyMap<string, TimelineIdentityUsability>;
  conflicts: readonly TimelineIdentityConflict[];
}

const RECORD_ID = /^rec[A-Za-z0-9]+$/;
const emptyGroups: readonly string[] = [];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stableGroups(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const groupId of value) {
    if (typeof groupId !== 'string' || !RECORD_ID.test(groupId)) return null;
    if (!seen.has(groupId)) {
      seen.add(groupId);
      result.push(groupId);
    }
  }
  return result;
}

function signature(current: readonly string[], former: readonly string[]): string {
  // Membership order is not identity; current versus former membership is.
  return JSON.stringify([[...current].sort(), [...former].sort()]);
}

/**
 * A read-only bridge from the Catalog identity fields into timeline validation.
 * Members retain current and historical membership; works use original groupIds.
 * Conflicting duplicate records never acquire a union of contradictory identities.
 */
export function createTimelineIdentityContext(
  catalog: TimelineIdentityCatalog | null,
  groups: readonly TimelineGroupIdentity[],
): TimelineIdentityContext {
  const members = new Map<string, TimelineIdentityUsability>();
  const works = new Map<string, TimelineIdentityUsability>();
  const conflicts: TimelineIdentityConflict[] = [];
  const knownGroups = new Set(groups.map(group => group.groupId));
  const context: TimelineValidationContext = { groups };
  const loaded = catalog !== null;
  const runtimeCatalog: unknown = catalog;

  function identities(kind: TimelineIdentityKind, value: unknown, index: Map<string, TimelineIdentityUsability>) {
    if (!Array.isArray(value)) return undefined;
    const signatures = new Map<string, string>();
    for (const item of value) {
      // Rows without a stable string ID cannot be a navigation target.
      if (!record(item) || typeof item.id !== 'string') continue;
      const current = stableGroups(item.groupIds);
      const former = kind === 'member' ? stableGroups(item.formerGroupIds === undefined ? [] : item.formerGroupIds) : [];
      const valid = RECORD_ID.test(item.id) && current !== null && former !== null;
      const currentGroupIds = current ?? [];
      const formerGroupIds = former ?? [];
      const groupIds = [...new Set([...currentGroupIds, ...formerGroupIds])];
      // Keep malformed rows as unusable metadata rather than corrupting strict context.
      const itemSignature = valid
        ? signature(currentGroupIds, formerGroupIds)
        : 'invalid';
      if (signatures.has(item.id)) {
        if (signatures.get(item.id) !== itemSignature && index.get(item.id)?.reason !== 'conflict') {
          index.set(item.id, { id: item.id, kind, usable: false, reason: 'conflict', groupIds: [], currentGroupIds: [], formerGroupIds: [] });
          conflicts.push({ id: item.id, kind, reason: 'conflict' });
        }
        continue;
      }
      signatures.set(item.id, itemSignature);
      const reason = !valid ? 'invalid' : groupIds.some(groupId => !knownGroups.has(groupId)) ? 'unknown-group' : null;
      index.set(item.id, { id: item.id, kind, usable: reason === null, reason, groupIds, currentGroupIds, formerGroupIds });
    }
    return [...index.values()].filter(identity => identity.usable).map(({ id, groupIds }) => ({ id, groupIds }));
  }

  if (record(runtimeCatalog)) {
    context.members = identities('member', runtimeCatalog.members, members);
    context.works = identities('work', runtimeCatalog.works, works);
  }
  return { context, loaded, members, works, conflicts };
}

/** Check each target again at navigation time, including its requested group scope. */
export function getTimelineIdentityUsability(
  adapter: TimelineIdentityContext,
  kind: TimelineIdentityKind,
  id: string,
  groupId: string,
): TimelineIdentityUsability {
  const missing = (reason: TimelineIdentityReason): TimelineIdentityUsability => ({
    id, kind, usable: false, reason,
    groupIds: emptyGroups, currentGroupIds: emptyGroups, formerGroupIds: emptyGroups,
  });
  if (!adapter.loaded) return missing('not-loaded');
  const identity = (kind === 'member' ? adapter.members : adapter.works).get(id);
  if (!identity) return missing('missing');
  if (!identity.usable) return identity;
  if (!identity.groupIds.includes(groupId)) return { ...identity, usable: false, reason: 'wrong-group' };
  return identity;
}
