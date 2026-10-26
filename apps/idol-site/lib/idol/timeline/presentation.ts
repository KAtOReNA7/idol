import type { ArtistTimeline, TimelineGroupIdentity, TimelineValidationIssue, TimelineValidationResult } from './types';
import { validateTimeline } from './validate';
import { createTimelineIdentityContext, getTimelineIdentityUsability } from './identity';
import type { TimelineIdentityCatalog, TimelineIdentityContext, TimelineIdentityKind, TimelineIdentityReason } from './identity';

export type TimelinePresentationState = 'loading' | 'invalid' | 'empty' | 'context-unavailable' | 'ready';
export interface TimelinePresentationIdentityIssue extends TimelineValidationIssue {
  eventId: string;
  kind: TimelineIdentityKind;
  targetId: string;
  reason: TimelineIdentityReason;
}
export interface TimelinePresentation {
  state: TimelinePresentationState;
  /** The original complete wire object, never rewritten to make validation pass. */
  timeline: ArtistTimeline | null;
  identity: TimelineIdentityContext;
  /** Strict audit remains available even when only a link identity is unavailable. */
  strictAudit: TimelineValidationResult | null;
  issues: readonly TimelineValidationIssue[];
  /** Only ready event identities; held titles and assertions are not copied here. */
  identityIssues: readonly TimelinePresentationIdentityIssue[];
  heldIdentityIssueCount: number;
}

const LINK_ISSUE_CODES = new Set(['missing_registry', 'unknown_entity', 'entity_group_mismatch']);
const LINK_PATH = /^\$\.events\[(\d+)\]\.(memberIds|workIds)(?:\[(\d+)\])?$/;

function isLinkIdentityIssue(issue: TimelineValidationIssue): boolean {
  return LINK_ISSUE_CODES.has(issue.code) && LINK_PATH.test(issue.path);
}

/**
 * UI readiness is separate from strict data audit. Unavailable Catalog identities
 * disable only unsafe links; they never delete event IDs, facts, or evidence.
 */
export function prepareTimelinePresentation(
  input: unknown,
  catalog: TimelineIdentityCatalog | null,
  groups: readonly TimelineGroupIdentity[],
): TimelinePresentation {
  const identity = createTimelineIdentityContext(catalog, groups);
  const result: TimelinePresentation = {
    state: 'loading', timeline: null, identity, strictAudit: null,
    issues: [], identityIssues: [], heldIdentityIssueCount: 0,
  };
  if (input === null || input === undefined) return result;

  const strictAudit = validateTimeline(input, identity.context);
  const issues = strictAudit.issues;
  const structuralIssues = issues.filter(issue => !isLinkIdentityIssue(issue));
  // All fields, source URLs, dates, duplicate IDs, relationship references, and
  // the caller's group registry still go through the unchanged strict validator.
  if (structuralIssues.length > 0) return { ...result, state: 'invalid', strictAudit, issues };

  // A failure containing ONLY scoped link-identity issues has a fully validated
  // wire shape. The original object can be shown without inventing target links.
  const timeline = strictAudit.ok ? strictAudit.value : input as ArtistTimeline;
  const identityIssues: TimelinePresentationIdentityIssue[] = [];
  let heldIdentityIssueCount = 0;
  for (let eventIndex = 0; eventIndex < timeline.events.length; eventIndex += 1) {
    const event = timeline.events[eventIndex];
    for (const kind of ['member', 'work'] as const) {
      const field = kind === 'member' ? 'memberIds' : 'workIds';
      for (let targetIndex = 0; targetIndex < event[field].length; targetIndex += 1) {
        const targetId = event[field][targetIndex];
        const usability = getTimelineIdentityUsability(identity, kind, targetId, timeline.groupId);
        if (usability.usable) continue;
        if (event.reviewStatus === 'hold') { heldIdentityIssueCount += 1; continue; }
        identityIssues.push({
          path: `$.events[${eventIndex}].${field}[${targetIndex}]`,
          code: `identity_${usability.reason ?? 'missing'}`,
          message: 'The event is preserved; this identity is unavailable for navigation.',
          eventId: event.id, kind, targetId, reason: usability.reason ?? 'missing',
        });
      }
    }
  }
  const state = !identity.loaded ? 'loading'
    : timeline.events.every(event => event.reviewStatus === 'hold') ? 'empty'
      : identityIssues.length > 0 ? 'context-unavailable' : 'ready';
  return { state, timeline, identity, strictAudit, issues, identityIssues, heldIdentityIssueCount };
}
