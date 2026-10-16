import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/xg-artist.json';
import '../expanded-artist.css';
export default function Page(){return <ExpandedArtist slug="xg" content={content}/>;}
