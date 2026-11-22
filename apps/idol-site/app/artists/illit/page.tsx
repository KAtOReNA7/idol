import SevenArtist from '@/components/seven-redesign/artist';
import {isPlainArtistHomepage, type ArtistPageSearchParams} from '@/lib/idol/home-image-preload';
import '@/components/seven-redesign/artist.css';
export default async function Page({searchParams}: {searchParams: Promise<ArtistPageSearchParams>}) {
  return <SevenArtist slug="illit" initialHome={isPlainArtistHomepage(await searchParams)}/>;
}
