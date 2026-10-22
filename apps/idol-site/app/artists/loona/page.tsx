import Design from '@/components/candidate/loona-design';
import content from '@/data/loona-artist.json';
import {loonaHomeAsset} from '@/lib/idol/loona-home';
import {isPlainArtistHomepage, type ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import './loona-artist.css';
import './loona-inner.css';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
 const home = isPlainArtistHomepage(await searchParams);
 return <>{home && <link rel="preload" as="image" href={loonaHomeAsset('hero.jpg')} fetchPriority="high" referrerPolicy="no-referrer"/>}<Design content={content}/></>;
}
