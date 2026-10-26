/** Navigation preferences only. Never persist catalog data, scores or private text. */
export interface InsightsViewState {
  domain: 'mv' | 'stage';
  groupSort: 'mean' | 'samples' | 'high';
  memberMetric: 'performance' | 'styling';
  revisitKind: 'high-score' | 'watched-unrated';
  pageSize: 10 | 20;
  groupsPage: number;
  membersPage: number;
  revisitPage: number;
  tracePage: number;
  selectedMemberId: string | null;
}
export const defaultInsightsViewState = (): InsightsViewState => ({
  domain: 'mv', groupSort: 'mean', memberMetric: 'performance', revisitKind: 'high-score',
  pageSize: 10, groupsPage: 1, membersPage: 1, revisitPage: 1, tracePage: 1, selectedMemberId: null,
});
/** Reconstruct an allowlisted object rather than spreading untrusted history. */
export function readInsightsViewState(value: unknown): InsightsViewState {
  const result = defaultInsightsViewState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  const v = value as Record<string, unknown>;
  if (v.domain === 'mv' || v.domain === 'stage') result.domain = v.domain;
  if (v.groupSort === 'mean' || v.groupSort === 'samples' || v.groupSort === 'high') result.groupSort = v.groupSort;
  if (v.memberMetric === 'performance' || v.memberMetric === 'styling') result.memberMetric = v.memberMetric;
  if (v.revisitKind === 'high-score' || v.revisitKind === 'watched-unrated') result.revisitKind = v.revisitKind;
  if (v.pageSize === 10 || v.pageSize === 20) result.pageSize = v.pageSize;
  for (const key of ['groupsPage', 'membersPage', 'revisitPage', 'tracePage'] as const) {
    const page = v[key];
    if (typeof page === 'number' && Number.isSafeInteger(page) && page >= 1 && page <= 10000) result[key] = page;
  }
  if (typeof v.selectedMemberId === 'string' && /^rec[A-Za-z0-9]+$/.test(v.selectedMemberId) && v.selectedMemberId.length <= 100) result.selectedMemberId = v.selectedMemberId;
  return result;
}
