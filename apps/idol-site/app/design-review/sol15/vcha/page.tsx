import type {Metadata} from 'next';
import VchaReview from '@/components/design-review/vcha-review';
export const metadata:Metadata={title:'VCHA · 独立设计审阅',robots:{index:false,follow:false}};
export default function Page(){return <VchaReview/>;}
