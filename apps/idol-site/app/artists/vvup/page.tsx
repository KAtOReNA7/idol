import Design from '@/components/vvup-artist';
import content from '@/data/vvup-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import './vvup-native.css';

export default async function ArtistPage({searchParams}:{searchParams:Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams);
  const query = new URLSearchParams(initialSearch);
  const firstTimeline = query.get('section') === 'updates' && !query.get('member')
    ? (await import('@/data/artist-timelines/vvup.json')).default : undefined;
  return <Design content={content} initialSearch={initialSearch} initialTimeline={firstTimeline}/>;
}
