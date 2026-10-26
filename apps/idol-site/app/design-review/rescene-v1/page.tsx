import type {Metadata} from 'next';
import SolVisualReview from '@/components/design-review/sol-visual-review';
import '@/components/design-review/rescene-visual-review.css';
import '@/components/design-review/sol-visual-host.css';
export const metadata:Metadata={title:'RESCENE · 独立视觉候选',robots:{index:false,follow:false}};
export default function Page(){return <SolVisualReview slug="rescene"/>;}
