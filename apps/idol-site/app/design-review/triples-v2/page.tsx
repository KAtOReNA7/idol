import type {Metadata} from 'next';
import TriplesVisualReview from '@/components/design-review/triples-visual-review';
import '@/components/design-review/triples-visual-review.css';
import '@/components/design-review/triples-visual-host.css';
export const metadata: Metadata = {title: 'tripleS · 独立视觉候选', robots: {index: false, follow: false}};
export default function Page() { return <TriplesVisualReview/>; }
