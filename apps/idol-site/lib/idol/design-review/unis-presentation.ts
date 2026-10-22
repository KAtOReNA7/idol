import {artistExperienceRouteUrl} from './artist-route';
import extraCovers from '@/data/design-review/unis-extra-release-covers.json';
import {unisEditorialReleases, type UNISEditorialRelease} from '@/lib/idol/unis-editorial';
import {artistRoute} from '@/lib/idol/artist-preview';
import type {Member, Work} from '@/lib/idol/types';

export const UNIS_PATH = '/design-review/unis';
export const UNIS_GROUP_ID = 'rec28ldfRTiCWc';
export const UNIS_FEATURED_RELEASE = 'unis-swicy';
export const UNIS_FEATURED_WORK = 'rec28ldfRTrEdW';

// Presentation order only. A member still has to exist in the live scoped catalog.
export const unisMemberOrder = [
  'recvxAPQCFeTtL', 'recvxAPQCFgu8Z', 'recvxAPQCFgfOW', 'recvxAPQCFWScb',
  'recvxAPQCFnjrP', 'recvxAPQCFwHoN', 'recvxAPQCF822A', 'recvxAPQCFOtuE',
] as const;

export function orderUNISMembers(members: readonly Member[]): Member[] {
  const rank = new Map<string, number>(unisMemberOrder.map((id, index) => [id, index]));
  return [...members].sort((a, b) => (rank.get(a.id) ?? 100) - (rank.get(b.id) ?? 100) || a.id.localeCompare(b.id));
}

export function unisReleaseFromUrl(url: string) {
  const params = new URL(url, 'https://site.invalid').searchParams;
  const keys = params.getAll('release');
  return {requested: keys.length > 0, release: keys.length === 1 ? unisEditorialReleases.find(row => row.releaseKey === keys[0]) ?? null : null};
}

export function unisRouteUrl(route: ReturnType<typeof artistRoute>, releaseKey: string | null = null, basePath: '/artists/unis' | typeof UNIS_PATH = UNIS_PATH): string {
  const base = artistExperienceRouteUrl(route, basePath);
  if (!releaseKey || !unisEditorialReleases.some(row => row.releaseKey === releaseKey)) return base;
  return base + (base.includes('?') ? '&' : '?') + 'release=' + encodeURIComponent(releaseKey);
}

/** Editorial release artwork, never a video poster, MV still, or personal photo. */
export function unisWorkRelease(work: Work): UNISEditorialRelease | null {
  if (!work.groupIds.includes(UNIS_GROUP_ID)) return null;
  return unisEditorialReleases.find(release => release.workIds.includes(work.id) && unisReleaseCover(release)) ?? null;
}

export function unisReleaseWorks(release: UNISEditorialRelease, works: readonly Work[]): Work[] {
  return works.filter(work => work.groupIds.includes(UNIS_GROUP_ID) && release.workIds.includes(work.id));
}

export function unisHasStage(work: Work): boolean {
  return !!(work.stage || work.stageSupplement?.alternatives.length);
}

export function unisReleaseDate(release: UNISEditorialRelease): string {
  return release.eventDate?.value.replaceAll('-', '.') ?? '';
}

/** The first five are the reviewed Figma editorial selection; keep the complete catalog below. */
export function unisDisplayReleases(): UNISEditorialRelease[] {
  const chosen = ['unis-swicy', 'unis-we-unis', 'unis-curious', 'unis:milky-way-digital', 'unis:moshimoshi-jp-digital'];
  return [...chosen.flatMap(key => unisEditorialReleases.filter(release => release.releaseKey === key)),
    ...unisEditorialReleases.filter(release => !chosen.includes(release.releaseKey))];
}

/** Verified public artwork only; no canonical record, edition or member relation mutation. */
export function unisReleaseCover(release: UNISEditorialRelease) {
  return release.cover ?? extraCovers.find(asset => asset.releaseKey === release.releaseKey && asset.canonicalEventId === release.canonicalEventId) ?? null;
}

export function unisReleaseCoverDetails(release: UNISEditorialRelease) {
  return extraCovers.find(asset => asset.releaseKey === release.releaseKey && asset.canonicalEventId === release.canonicalEventId) ?? null;
}
