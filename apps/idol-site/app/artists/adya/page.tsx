import {ArtistRecognition} from '@/components/artist-recognition';
import AdyaArtist from '@/components/adya-artist';
import content from '@/data/adya-artist.json';
export default function Page(){return <ArtistRecognition slug="adya"><AdyaArtist content={content}/></ArtistRecognition>;}
