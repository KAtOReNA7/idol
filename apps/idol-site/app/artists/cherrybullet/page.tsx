import CherryBulletDesign from '@/components/candidate/cherrybullet-design';
import content from '@/data/cherrybullet-artist.json';
import './cherrybullet-artist.css';

export default function CherryBulletArtistPage() {
  return <CherryBulletDesign content={content} />;
}
