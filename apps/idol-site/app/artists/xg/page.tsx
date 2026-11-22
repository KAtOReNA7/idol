import {ArtistRecognition} from '@/components/artist-recognition';
import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/xg-artist.json';
import {XG_NEW_DNA_PATH} from '@/lib/idol/artist-navigation';
import {newDnaReleaseId} from '@/lib/idol/xg-new-dna';
import '../expanded-artist.css';
export default function Page(){return <ArtistRecognition slug="xg"><ExpandedArtist slug="xg" content={content} releaseDetailPaths={{[newDnaReleaseId]:XG_NEW_DNA_PATH}}/></ArtistRecognition>;}
