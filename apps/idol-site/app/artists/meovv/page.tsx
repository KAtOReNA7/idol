import MeovvDesign from '@/components/candidate/meovv-design';
import content from '@/data/meovv-artist.json';
import './meovv-artist.css';

export default function Page() {
  return <MeovvDesign content={content}/>;
}
