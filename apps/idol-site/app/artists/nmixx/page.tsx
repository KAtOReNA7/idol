import NmixxArtist from '@/components/nmixx-artist';
import content from '@/data/nmixx-artist.json';
import editions from '@/data/mv-recognition-editions.json';
import './nmixx-artist.css';
export default function Page(){
 return <NmixxArtist content={content} portraitEditions={[editions['nmixx-admare-mix-202202'],editions['roller-coaster-2023']]}/>;
}
