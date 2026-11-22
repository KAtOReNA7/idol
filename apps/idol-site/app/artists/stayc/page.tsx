import {ArtistRecognition} from '@/components/artist-recognition';
import StaycArtist from '@/components/stayc-artist';
import content from '@/data/stayc-artist.json';
import './stayc-artist.css';
export default function Page(){return <ArtistRecognition slug="stayc"><StaycArtist content={content}/></ArtistRecognition>;}
