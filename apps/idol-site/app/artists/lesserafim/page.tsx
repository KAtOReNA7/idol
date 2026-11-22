import {ArtistRecognition} from '@/components/artist-recognition';
import LesserafimArtist from '@/components/lesserafim-artist';
import content from '@/data/lesserafim-artist.json';
import './lesserafim-artist.css';
export default function Page(){return <ArtistRecognition slug="lesserafim"><LesserafimArtist content={content}/></ArtistRecognition>;}
