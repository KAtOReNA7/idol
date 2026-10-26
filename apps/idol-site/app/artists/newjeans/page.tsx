import NewJeansDesign from '@/components/candidate/newjeans-design';
import content from '@/data/newjeans-artist.json';
import './newjeans-artist.css';

export default function NewJeansArtistPage() {
  return <NewJeansDesign content={content} />;
}
