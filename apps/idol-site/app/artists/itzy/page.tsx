import {ArtistRecognition} from '@/components/artist-recognition';
import ItzyArtist from '@/components/itzy-artist';
import content from '@/data/itzy-artist.json';
import './itzy-artist.css';
export default function Page(){return <ArtistRecognition slug="itzy"><ItzyArtist content={content}/></ArtistRecognition>;}
