import {ArtistRecognition} from '@/components/artist-recognition';
import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/xg-artist.json';
import {XG_NEW_DNA_PATH} from '@/lib/idol/artist-navigation';
import {newDnaReleaseId} from '@/lib/idol/xg-new-dna';
import {artistRequestSearch} from '@/lib/idol/artist-request-search';
import type {ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import '../expanded-artist.css';
import '../expanded-work-directory.css';

export default async function Page({searchParams}:{searchParams:Promise<ArtistPageSearchParams>}) {
  const query=await searchParams ?? {};
  const share=query.section==='works'&&!query.member;
  const initial=share?(await import('@/data/xg-work-directory.json')).default:undefined;
  return <ArtistRecognition slug="xg"><ExpandedArtist slug="xg" content={content} workDirectory={{initial}}
    initialSearch={share?artistRequestSearch(query):''} releaseDetailPaths={{[newDnaReleaseId]:XG_NEW_DNA_PATH}}/></ArtistRecognition>;
}
