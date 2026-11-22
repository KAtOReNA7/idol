import {ArtistRecognition} from '@/components/artist-recognition';
import SevenArtist from '@/components/seven-redesign/artist';
import direction from '@/components/seven-redesign/art-direction.json';
import {isPlainArtistHomepage, type ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import '@/components/seven-redesign/artist.css';

export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  const home = isPlainArtistHomepage(await searchParams);
  return <>
    {home && <link rel="preload" as="image" href={direction.triples.hero} fetchPriority="high" referrerPolicy="no-referrer"/>}
    <ArtistRecognition slug="triples"><SevenArtist slug="triples"/></ArtistRecognition>
  </>;
}
