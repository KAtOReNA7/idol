import WitchxArtist from '@/components/witchx-artist';
import content from '@/data/witchx-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <WitchxArtist content={content} initialSearch={initialSearch}/>;
}
