import Kep1erDesign from '@/components/candidate/kep1er-design';
import content from '@/data/kep1er-artist.json';
import './kep1er-artist.css';

export default function Kep1erArtistPage() {
  return <Kep1erDesign content={content} />;
}
