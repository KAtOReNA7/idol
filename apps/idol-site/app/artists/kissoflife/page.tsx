import {ArtistRecognition} from '@/components/artist-recognition';
import KiofArtist from '@/components/kiof-artist';
import content from '@/data/kissoflife-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import {publicShareTimeline} from '@/lib/idol/timeline/public-share';
import './kiof-artist.css';
import './directory.css';

export default async function Page({searchParams}:{searchParams:Promise<ArtistPageSearchParams>}) {
  const initialSearch=artistRequestSearch(await searchParams ?? {});
  const query=new URLSearchParams(initialSearch);
  const initialTimeline=query.get('section')==='updates'&&!query.get('member')
    ? publicShareTimeline((await import('@/data/artist-timelines/kissoflife.json')).default) : undefined;
  return <ArtistRecognition slug="kissoflife"><KiofArtist content={content} initialSearch={initialSearch} initialTimeline={initialTimeline}/></ArtistRecognition>;
}
