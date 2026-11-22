import BewaveArtist from '@/components/bewave-artist';
import content from '@/data/bewave-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <BewaveArtist content={content} initialSearch={initialSearch}/>;
}
