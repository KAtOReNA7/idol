import {artistRoute, artistRouteUrl} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';

const routes = [
  ['/design-review/unis', '/artists/unis'],
  ['/design-review/kep1er', '/artists/kep1er'],
] as const;

function remap(value: string, toProduction: boolean): string {
  const url = new URL(value, 'https://site.invalid');
  const pair = routes.find(row => row[toProduction ? 0 : 1] === url.pathname);
  if (pair) url.pathname = pair[toProduction ? 1 : 0];
  return url.pathname + url.search + url.hash;
}
export const toProductionArtistUrl = (value: string) => remap(value, true);
export const toDesignReviewUrl = (value: string) => remap(value, false);
/** Parse through the canonical artist schema, including historical roster and format. */
export const reviewArtistRoute = (value: string) => artistRoute(toProductionArtistUrl(value));
/** Use the same canonical route schema in production and the isolated preview. */
export function artistExperienceRouteUrl(route: ReturnType<typeof artistRoute>, basePath: string) {
  const canonicalPath = toProductionArtistUrl(basePath);
  const target = artistRouteUrl(route, canonicalPath);
  return basePath === canonicalPath ? target : toDesignReviewUrl(target);
}
export function reviewArtistRouteUrl(route: ReturnType<typeof artistRoute>, reviewPath: string) {
  return artistExperienceRouteUrl(route, reviewPath);
}
/** Existing editors retain their unchanged, canonical safe-return boundary.
 * A UNIS editorial release key may fall back to the canonical works section.
 */
export function productionReturn(value: string): string {
  const canonical = toProductionArtistUrl(value);
  const direct = safeArtistReturn(canonical);
  if (direct) return direct;
  const url = new URL(canonical, 'https://site.invalid');
  url.searchParams.delete('release');
  return safeArtistReturn(url.pathname + url.search) ?? url.pathname;
}
