import IdleDesign from '@/components/candidate/idle-design';
import content from '@/data/idle-artist.json';
import './idle-artist.css';

export default function IdleArtistPage() {
  return <IdleDesign content={content} />;
}
