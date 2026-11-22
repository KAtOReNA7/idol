import CandyshopArtist from '@/components/candyshop-artist';
import content from '@/data/candyshop-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function ArtistPage({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <CandyshopArtist content={content} initialSearch={initialSearch}/>;
}
