import {ArtistRecognition} from '@/components/artist-recognition';
import SaymynameArtist from '@/components/saymyname-artist';
import content from '@/data/saymyname-artist.json';
import './saymyname-artist.css';
export default function Page(){return <ArtistRecognition slug="saymyname"><SaymynameArtist content={content}/></ArtistRecognition>;}
