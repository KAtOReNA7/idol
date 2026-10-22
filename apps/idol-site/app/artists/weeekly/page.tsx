import WeeeklyDesign from '@/components/candidate/weeekly-design';
import content from '@/data/weeekly-artist.json';
import './weeekly-artist.css';

export default function WeeeklyArtistPage() {
  return <WeeeklyDesign content={content} />;
}
