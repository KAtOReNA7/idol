import BilllieDesign from '@/components/candidate/billlie-design';
import content from '@/data/billlie-artist.json';
import './billlie-artist.css';

export default function BilllieArtistPage() {
  return <BilllieDesign content={content} />;
}
