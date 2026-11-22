import Design from '@/components/youngposse-artist';
import content from '@/data/youngposse-artist.json';
import './youngposse-artist.css';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';

export default async function ArtistPage({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  return <Design content={content} initialSearch={initialSearch}/>;
}
