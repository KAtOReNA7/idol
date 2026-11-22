import Design from '@/components/oddyouth-artist';
import content from '@/data/oddyouth-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function ArtistPage({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <Design content={content} initialSearch={initialSearch}/>;
}
