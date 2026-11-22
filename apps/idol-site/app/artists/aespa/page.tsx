import {ArtistRecognition} from '@/components/artist-recognition';
import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/aespa-artist.json';
import {armageddonReleaseId} from '@/lib/idol/aespa-armageddon';
import {AESPA_ARMAGEDDON_PATH} from '@/lib/idol/artist-navigation';
import '../expanded-artist.css';
export default function Page(){return <ArtistRecognition slug="aespa"><ExpandedArtist slug="aespa" content={content} releaseDetailPaths={{[armageddonReleaseId]:AESPA_ARMAGEDDON_PATH}}/></ArtistRecognition>;}
