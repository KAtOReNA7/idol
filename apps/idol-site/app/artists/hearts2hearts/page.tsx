import {ArtistRecognition} from '@/components/artist-recognition';
import Hearts2HeartsArtist from '@/components/hearts2hearts-artist';
import content from '@/data/hearts2hearts-artist.json';
import './hearts2hearts-artist.css';
export default function Page(){return <ArtistRecognition slug="hearts2hearts"><Hearts2HeartsArtist content={content}/></ArtistRecognition>;}
