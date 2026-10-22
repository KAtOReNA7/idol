// Read-only public editorial projection. Canonical dates, IDs and sources stay in one place.
// This layer creates no project releases, score targets, member portraits or video posters.
import index from '@/data/kep1er-figma-editorial.json';
import canonical from '@/data/artist-timelines/kep1er.json';

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type Kep1erEditorialAsset = DeepReadonly<Omit<(typeof index.assets)[number], 'role'> & {
  role: 'release-cover' | 'member-edition-cover';
}>;
export type Kep1erEditorialRelease = Readonly<{
  releaseKey: string;
  projectReleaseId: null;
  canonicalEventId: string;
  title: string;
  eventDate: DeepReadonly<(typeof canonical.events)[number]['eventDate']>;
  announcementDate: DeepReadonly<(typeof canonical.events)[number]['announcementDate']>;
  plannedDate: DeepReadonly<(typeof canonical.events)[number]['plannedDate']>;
  status: string;
  scopeNote: string;
  sources: DeepReadonly<(typeof canonical.events)[number]['sources']>;
  workIds: readonly string[];
  cover: Kep1erEditorialAsset | null;
}>;

/** These are edition artworks, never aliases for a member's portrait. */
export const kep1erEditorialAssets: readonly Kep1erEditorialAsset[] = index.assets as Kep1erEditorialAsset[];
export const kep1erMemberEditionCovers: readonly Kep1erEditorialAsset[] = kep1erEditorialAssets.filter(asset => asset.role === 'member-edition-cover');

/** Full reviewed canonical release list, oldest first; never substitute announcement for actual date. */
export const kep1erEditorialReleases: readonly Kep1erEditorialRelease[] = index.releaseBindings.map(binding => {
  const event = canonical.events.find(item => item.id === binding.canonicalEventId);
  if (!event?.releaseKey) throw new Error('Unknown kep1er canonical release: ' + binding.canonicalEventId);
  const asset = kep1erEditorialAssets.find(item => item.assetKey === binding.coverAssetKey);
  return {
    releaseKey: event.releaseKey,
    projectReleaseId: null,
    canonicalEventId: event.id,
    title: event.title.match(/《([^》]+)》/)?.[1] ?? event.title,
    eventDate: event.eventDate,
    announcementDate: event.announcementDate,
    plannedDate: event.plannedDate,
    status: event.status,
    scopeNote: event.scopeNote,
    sources: event.sources,
    workIds: event.workIds,
    cover: asset?.role === 'release-cover' ? asset : null,
  };
}).sort((a, b) => (a.eventDate?.value ?? '9999').localeCompare(b.eventDate?.value ?? '9999') || a.canonicalEventId.localeCompare(b.canonicalEventId));

export function getKep1erEditorialRelease(releaseKey: string): Kep1erEditorialRelease | null {
  return kep1erEditorialReleases.find(release => release.releaseKey === releaseKey) ?? null;
}
