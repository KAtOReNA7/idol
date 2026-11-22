import {ArtistRecognition} from '@/components/artist-recognition';
import KiofArtist from '@/components/kiof-artist';
import content from '@/data/kissoflife-artist.json';
import './kiof-artist.css';
export default function Page(){return <ArtistRecognition slug="kissoflife"><KiofArtist content={content}/></ArtistRecognition>;}
