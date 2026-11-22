import {ArtistRecognition} from '@/components/artist-recognition';
import NewJeansDesign from '@/components/candidate/newjeans-design';
import content from '@/data/newjeans-artist.json';
import './newjeans-artist.css';

export default function NewJeansArtistPage() {
  return <ArtistRecognition slug="newjeans"><NewJeansDesign content={content} /></ArtistRecognition>;
}
