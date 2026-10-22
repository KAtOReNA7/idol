/** Exact schemaVersion=1 wire types; audit/UI fields belong outside these objects. */
export type DatePrecision = 'year' | 'month' | 'day';
export interface TimelineDate { value: string; precision: DatePrecision }
export type EventType = 'member_join' | 'member_departure' | 'debut' | 'release' | 'disband' | 'agency_change' | 'contract_end' | 'rename' | 'hiatus' | 'resume' | 'notice' | 'other';
export type EventStatus = 'confirmed' | 'announced' | 'planned' | 'postponed' | 'cancelled' | 'uncertain';
export interface TimelineSource {
  id: string;
  url: string;
  publisher: string;
  title: string;
  sourcePublishedAt: TimelineDate | null;
  checkedAt: string;
  scopeNote: string;
  evidenceRef: string | null;
}
export interface TimelineEvent {
  id: string;
  groupId: string;
  eventType: EventType;
  title: string;
  summary: string;
  scopeNote: string;
  eventDate: TimelineDate | null;
  announcementDate: TimelineDate | null;
  plannedDate: TimelineDate | null;
  status: EventStatus;
  importance: 'major' | 'supporting';
  memberIds: string[];
  workIds: string[];
  releaseKey: string | null;
  relatedEventIds: string[];
  sources: TimelineSource[];
  reviewStatus: 'ready' | 'hold';
  holdReasons: string[];
}
export interface ArtistTimeline {
  schemaVersion: 1;
  groupId: string;
  slug: string;
  events: TimelineEvent[];
  gaps: string[];
}
export interface TimelineGroupIdentity { groupId: string; slug: string }
export interface TimelineEntityIdentity { id: string; groupIds: readonly string[] }
export interface TimelineValidationContext {
  groups: readonly TimelineGroupIdentity[];
  members?: readonly TimelineEntityIdentity[];
  works?: readonly TimelineEntityIdentity[];
}
export interface TimelineValidationIssue { path: string; code: string; message: string }
export type TimelineValidationResult =
  | { ok: true; value: ArtistTimeline; issues: [] }
  | { ok: false; issues: TimelineValidationIssue[] };
export interface TimelineFilters {
  type: 'all' | 'members' | 'release' | 'organization';
  importance: 'major' | 'all';
  order: 'recent' | 'earliest';
}
