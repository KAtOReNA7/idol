export type ArtistPageSearchParams = Record<string, string | string[] | undefined>;

// Preload only an unambiguous homepage entry. Inner/deep-link and duplicate
// query parameters must not download a homepage image that may never be shown.
export function isPlainArtistHomepage(params: ArtistPageSearchParams): boolean {
  const keys = Object.keys(params);
  return keys.length === 0 || (keys.length === 1 && keys[0] === 'section' && params.section === 'overview');
}
