import GeeniusArtist from '@/components/geenius-artist';
import content from '@/data/geenius-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <GeeniusArtist content={content} initialSearch={initialSearch}/>;
}
