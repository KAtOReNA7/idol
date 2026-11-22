import KiiikiiiArtist from '@/components/kiiikiii-artist';
import content from '@/data/kiiikiii-artist.json';
import editions from '@/data/mv-recognition-editions.json';
import './kiiikiii-artist.css';
export default function Page(){return <KiiikiiiArtist content={content} debutEdition={editions['kiiikiii-uncut-gem-2025']}/>;}
