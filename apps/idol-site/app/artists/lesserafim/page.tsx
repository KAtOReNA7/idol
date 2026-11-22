import {ArtistRecognition} from '@/components/artist-recognition';
import LesserafimArtist from '@/components/lesserafim-artist';
import content from '@/data/lesserafim-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import {sharedArtistMember} from '@/lib/idol/shared-artist-member';
import './lesserafim-artist.css';

export default async function Page({searchParams}:{searchParams: Promise<ArtistPageSearchParams>}) {
  const query = await searchParams ?? {};
  const initialSearch = query.member ? artistRequestSearch(query) : '';
  const initialMember = sharedArtistMember(content.groupId, initialSearch);
  return <ArtistRecognition slug="lesserafim">
    <LesserafimArtist content={content} initialSearch={initialSearch} initialMember={initialMember}/>
  </ArtistRecognition>;
}
