import {ArtistRecognition} from '@/components/artist-recognition';
import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/aespa-artist.json';
import '../expanded-artist.css';
export default function Page(){return <ArtistRecognition slug="aespa"><ExpandedArtist slug="aespa" content={content}/></ArtistRecognition>;}
