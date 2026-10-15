import ExpandedArtist from '@/components/expanded-artist';
import content from '@/data/aespa-artist.json';
import '../expanded-artist.css';
export default function Page(){return <ExpandedArtist slug="aespa" content={content}/>;}
