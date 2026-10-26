import type {Group, Member, RatingView, Work} from '../types';
import type {IdentityDiagnostics, InsightsCatalog, PreparedCatalog} from './contract';

interface IdentityRow {readonly id: string;}
interface IdentityScan<T extends IdentityRow> {
  byId: Map<string, Readonly<T>>; duplicateIds: readonly string[]; emptyCount: number;
}
/** All occurrences of a duplicate identity are excluded, even identical rows. */
function scanIdentities<T extends IdentityRow>(
  records: readonly Readonly<T>[],
): IdentityScan<T> {
  const candidates: Array<{id: string; value: Readonly<T>}> = [];
  const counts = new Map<string, number>();
  let emptyCount = 0;
  for (const record of records) {
    if (record === null || typeof record !== 'object') {emptyCount += 1; continue;}
    const id: unknown = record.id;
    if (typeof id !== 'string' || id.trim().length === 0) {emptyCount += 1; continue;}
    // Only test emptiness: do not rewrite the identity.
    candidates.push({id, value: record});
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const duplicateIds: string[] = [];
  for (const [id, count] of counts) if (count > 1) duplicateIds.push(id);
  const byId = new Map<string, Readonly<T>>();
  for (const c of candidates) if (counts.get(c.id) === 1) byId.set(c.id, c.value);
  return {byId, duplicateIds: Object.freeze(duplicateIds), emptyCount};
}
export function prepareCatalog(catalog: InsightsCatalog): PreparedCatalog {
  const sourceWorks: readonly Readonly<Work>[] = Array.isArray(catalog?.works) ? catalog.works : [];
  const sourceGroups: readonly Readonly<Group>[] = Array.isArray(catalog?.groups) ? catalog.groups : [];
  const sourceMembers: readonly Readonly<Member>[] = Array.isArray(catalog?.members) ? catalog.members : [];
  const sourceRatings: readonly Readonly<RatingView>[] = Array.isArray(catalog?.ratings) ? catalog.ratings : [];
  const workScan = scanIdentities<Work>(sourceWorks);
  const groupScan = scanIdentities<Group>(sourceGroups);
  const memberScan = scanIdentities<Member>(sourceMembers);
  const ratingScan = scanIdentities<RatingView>(sourceRatings);
  // Raw-input placeholder diagnostics may overlap duplicate/empty-ID exclusions.
  let placeholderCount = 0;
  for (const work of sourceWorks)
    if (work !== null && typeof work === 'object' && Boolean(work.placeholder)) placeholderCount += 1;
  const workById = new Map<string, Readonly<Work>>();
  for (const [id, work] of workScan.byId) if (!work.placeholder) workById.set(id, work);
  const diagnostics: IdentityDiagnostics = Object.freeze({
    duplicateWorkIds: workScan.duplicateIds, duplicateGroupIds: groupScan.duplicateIds,
    duplicateMemberIds: memberScan.duplicateIds, duplicateRatingIds: ratingScan.duplicateIds,
    emptyIds: Object.freeze({works: workScan.emptyCount, groups: groupScan.emptyCount,
      members: memberScan.emptyCount, ratings: ratingScan.emptyCount}), placeholderCount,
  });
  // Freeze only new containers, never the original entities.
  return Object.freeze({
    works: Object.freeze(Array.from(workById.values())),
    groups: Object.freeze(Array.from(groupScan.byId.values())),
    members: Object.freeze(Array.from(memberScan.byId.values())),
    ratings: Object.freeze(Array.from(ratingScan.byId.values())),
    workById, groupById: groupScan.byId, memberById: memberScan.byId, diagnostics,
  });
}
