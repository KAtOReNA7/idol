import type {ArtistPageSearchParams} from './home-image-preload';

// Recreate the request query for the first render. The existing artist router
// interprets it on both server and client, including repeated keys and searches.
export function artistRequestSearch(values: ArtistPageSearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params.size ? '?' + params.toString() : '';
}
