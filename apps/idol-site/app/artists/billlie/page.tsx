import BilllieDesign from '@/components/candidate/billlie-design';
import content from '@/data/billlie-artist.json';
import design from '@/data/runtime/billlie-figma-catalog.json';
import {isPlainArtistHomepage, type ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import './billlie-artist.css';

export default async function BilllieArtistPage({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const home = isPlainArtistHomepage(await searchParams);
  return <>{home && <link rel="preload" as="image" href={design.releases[0].src} fetchPriority="high"/>}<BilllieDesign content={content} /></>;
}
