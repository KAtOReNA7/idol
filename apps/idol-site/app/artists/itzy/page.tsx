import {ArtistRecognition} from '@/components/artist-recognition';
import ItzyArtist from '@/components/itzy-artist';
import content from '@/data/itzy-artist.json';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import {sharedArtistMember} from '@/lib/idol/shared-artist-member';
import './itzy-artist.css';

export default async function Page({searchParams}:{searchParams: Promise<ArtistPageSearchParams>}) {
  const query = await searchParams ?? {};
  const initialSearch = query.member ? artistRequestSearch(query) : '';
  const initialMember = sharedArtistMember(content.groupId, initialSearch);
  return <ArtistRecognition slug="itzy">
    <ItzyArtist content={content} initialSearch={initialSearch} initialMember={initialMember}/>
  </ArtistRecognition>;
}
