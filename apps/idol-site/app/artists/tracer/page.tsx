import TracerArtist from '@/components/tracer-artist';
import content from '@/data/tracer-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <TracerArtist content={content} initialSearch={initialSearch}/>;
}
