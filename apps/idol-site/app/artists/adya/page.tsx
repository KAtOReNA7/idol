import {ArtistRecognition} from '@/components/artist-recognition';
import AdyaArtist from '@/components/adya-artist';
import content from '@/data/adya-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <ArtistRecognition slug="adya"><AdyaArtist content={content} initialSearch={initialSearch}/></ArtistRecognition>;
}
