// Read-only public editorial projection. Canonical dates, IDs and sources stay in one place.
// This layer creates no project releases, score targets, member portraits or video posters.
import index from '@/data/unis-figma-editorial.json';
import canonical from '@/data/artist-timelines/unis.json';

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type UNISEditorialAsset = DeepReadonly<Omit<(typeof index.assets)[number], 'role'> & {
  role: 'release-cover' | 'member-edition-cover';
}>;
export type UNISEditorialRelease = Readonly<{
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
  cover: UNISEditorialAsset | null;
}>;

/** These are edition artworks, never aliases for a member's portrait. */
export const unisEditorialAssets: readonly UNISEditorialAsset[] = index.assets as UNISEditorialAsset[];
export const unisMemberEditionCovers: readonly UNISEditorialAsset[] = unisEditorialAssets.filter(asset => asset.role === 'member-edition-cover');

/** Full reviewed canonical release list, oldest first; never substitute announcement for actual date. */
export const unisEditorialReleases: readonly UNISEditorialRelease[] = index.releaseBindings.map(binding => {
  const event = canonical.events.find(item => item.id === binding.canonicalEventId);
  if (!event?.releaseKey) throw new Error('Unknown unis canonical release: ' + binding.canonicalEventId);
  const asset = unisEditorialAssets.find(item => item.assetKey === binding.coverAssetKey);
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

export function getUNISEditorialRelease(releaseKey: string): UNISEditorialRelease | null {
  return unisEditorialReleases.find(release => release.releaseKey === releaseKey) ?? null;
}
