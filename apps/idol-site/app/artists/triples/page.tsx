import Design from '@/components/candidate/triples-design';
import content from '@/data/triples-artist.json';
import {isPlainArtistHomepage, type ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import './triples-artist.css';
export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const home = isPlainArtistHomepage(await searchParams);
  return <>{home && <link rel="preload" as="image" href={content.hero.image} fetchPriority="high" referrerPolicy="no-referrer"/>}<Design content={content}/></>;
}
