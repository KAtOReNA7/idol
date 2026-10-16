import type {CatalogView, Work, Group, Member, RatingView} from '../types';

export type ScoreDomain = 'mv' | 'stage';
export type GroupSort = 'mean' | 'samples' | 'high';
export type InsightOptions = {
  /** Pure host adapter; stage-source binding cannot be inferred from this input. */
  isStageScoreEligible?: (work: Readonly<Work>) => boolean;
};
export type ScoreStats = {
  eligibleCount: number;
  ratedCount: number;
  mean: number | null;
  highCount: number;
  /** Integer intervals [0,1)..[9,10), plus exact 10. */
  bins: readonly number[];
  missingCount: number;
  invalidCount: number;
  unqualifiedCount: number;
};
export type WatchingStats = {
  total: number;
  watched: number;
  unwatched: number;
  unmarked: number;
  unknown: number;
  knownCount: number;
  watchedRatio: number | null;
};
export type IdentityDiagnostics = {
  duplicateWorkIds: readonly string[];
  duplicateGroupIds: readonly string[];
  duplicateMemberIds: readonly string[];
  duplicateRatingIds: readonly string[];
  emptyIds: {works: number; groups: number; members: number; ratings: number};
  placeholderCount: number;
};
export type PreparedCatalog = {
  works: readonly Readonly<Work>[];
  groups: readonly Readonly<Group>[];
  members: readonly Readonly<Member>[];
  ratings: readonly Readonly<RatingView>[];
  workById: ReadonlyMap<string, Readonly<Work>>;
  groupById: ReadonlyMap<string, Readonly<Group>>;
  memberById: ReadonlyMap<string, Readonly<Member>>;
  diagnostics: IdentityDiagnostics;
};
export type GroupRow = {
  groupId: string;
  name: string;
  workCount: number;
  stats: ScoreStats;
};
export type MetricStats = {
  sampleCount: number;
  mean: number | null;
  invalidCount: number;
};
export type MemberRow = {
  memberId: string;
  performance: MetricStats;
  styling: MetricStats;
  ratingIds: readonly string[];
  workIds: readonly string[];
};
export type MemberAnalysis = {
  rows: readonly MemberRow[];
  excluded: {
    ambiguousRelations: number;
    missingRelations: number;
    unlinkedRatings: number;
    emptyScores: number;
    invalidScores: number;
  };
};
export type RevisitItem = {
  workId: string;
  name: string;
  version: string;
  score: number | null;
  reason: 'high-score' | 'watched-unrated';
};
export type RevisitLists = {
  highRated: readonly RevisitItem[];
  watchedUnrated: readonly RevisitItem[];
};
export type PersonalInsightModel = {
  uniqueWorkCount: number;
  watching: WatchingStats;
  mv: ScoreStats;
  stage: ScoreStats;
  mvGroups: readonly GroupRow[];
  stageGroups: readonly GroupRow[];
  members: MemberAnalysis;
  mvRevisit: RevisitLists;
  stageRevisit: RevisitLists;
  diagnostics: IdentityDiagnostics;
};
export type InsightsCatalog = Readonly<CatalogView>;
