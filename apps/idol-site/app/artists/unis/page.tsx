import UnisDesignReview from '@/components/design-review/unis-design-review';
import content from '@/data/unis-artist.json';
import '@/components/design-review/unis-design-review.css';

export default function UnisArtistPage() {
  return <UnisDesignReview content={content} basePath="/artists/unis" />;
}
