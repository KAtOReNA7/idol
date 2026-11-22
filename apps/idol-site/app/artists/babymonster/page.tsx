import {ArtistRecognition} from '@/components/artist-recognition';
import ArtistSample from '@/components/artist-sample';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import {publicShareTimeline} from '@/lib/idol/timeline/public-share';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import '../../preview/babymonster/artist.css';
import './directory.css';

async function publicTimeline() {
  return publicShareTimeline((await import('@/data/artist-timelines/babymonster.json')).default);
}

export default async function Page({searchParams}:{searchParams:Promise<ArtistPageSearchParams>}) {
  const initialSearch = artistRequestSearch(await searchParams ?? {});
  const query = new URLSearchParams(initialSearch);
  const initialTimeline = query.get('section') === 'updates' && !query.get('member') ? await publicTimeline() : undefined;
  return <ArtistRecognition slug="babymonster"><ArtistSample basePath="/artists/babymonster" initialSearch={initialSearch} initialTimeline={initialTimeline}/></ArtistRecognition>;
}
