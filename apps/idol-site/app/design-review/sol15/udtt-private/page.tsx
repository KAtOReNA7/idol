import type {Metadata} from 'next';
import UdttPrivateReview from '@/components/design-review/udtt-private-review';
export const metadata:Metadata={title:'UDTT · 私有图片隔离候选',robots:{index:false,follow:false}};
export default function Page(){return <UdttPrivateReview/>;}
