import Kep1erDesignReview from '@/components/design-review/kep1er-design-review';
import content from '@/data/kep1er-artist.json';

export default function Kep1erArtistPage() {
  return <Kep1erDesignReview content={content} basePath="/artists/kep1er" />;
}
