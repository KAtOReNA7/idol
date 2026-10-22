import type {Metadata} from 'next';
import UdttReview from '@/components/design-review/udtt-review';
export const metadata:Metadata={title:'UDTT · 独立设计审阅',robots:{index:false,follow:false}};
export default function Page(){return <UdttReview/>;}
