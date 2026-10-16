import WooahDesign from '@/components/candidate/wooah-design';
import content from '@/data/wooah-artist.json';
import './wooah-artist.css';

export default function WooahArtistPage() {
  return <WooahDesign content={content} />;
}
