import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {VchaContainerFrame} from '@/components/design-review/vcha-container-validation';
export const metadata:Metadata={title:'VCHA · 隔离容器验证',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{width:string}>}){
  const {width}=await params;
  if(width!=='320'&&width!=='390'&&width!=='1440')notFound();
  return <VchaContainerFrame width={Number(width) as 320|390|1440}/>;
}
