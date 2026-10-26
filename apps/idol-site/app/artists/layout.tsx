import {ArtistTimelineProduction} from '@/components/artist-timeline-production';
export default function ArtistsLayout({children}:{children:React.ReactNode}) {
  return <ArtistTimelineProduction>{children}</ArtistTimelineProduction>;
}
