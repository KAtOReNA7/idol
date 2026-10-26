import type {Metadata} from 'next';
import VchaContainerValidation from '@/components/design-review/vcha-container-validation';
export const metadata:Metadata={title:'VCHA · 容器验证候选',robots:{index:false,follow:false}};
export default function Page(){return <VchaContainerValidation/>;}
