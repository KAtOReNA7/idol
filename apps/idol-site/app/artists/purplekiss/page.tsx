import PurpleKissDesign from '@/components/candidate/purplekiss-design';
import content from '@/data/purplekiss-artist.json';
import './purplekiss-artist.css';

export default function PurpleKissArtistPage() {
  return <PurpleKissDesign content={content} />;
}
