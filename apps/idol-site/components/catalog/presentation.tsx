'use client';
import {useMemo, useState, useCallback, useRef} from 'react';
import {ChevronRight, ImageIcon} from 'lucide-react';
import type {CatalogView as Catalog, Photo} from '@/lib/idol/types';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {mvPhotoLabel, mvReferencePhoto} from '@/lib/idol/mv-photo-presentation';
import {CatalogPhotoImage} from '@/components/app-image-presentation';
import {type ReliableImageState} from '@/components/reliable-image';

export const score=(n:number|null)=>n===null?'未评分':n.toFixed(1);
export async function readResponse(response:Response){if(!(response.headers.get('content-type')??'').includes('application/json'))throw new Error('连接暂时中断，请稍后再试。未保存的输入仍保留。');try{return await response.json();}catch{throw new Error('内容暂时没能加载，请稍后重试。未保存的输入仍保留。');}}
export const names=(data:Catalog,ids:string[])=>ids.map(id=>data.groups.find(g=>g.id===id)?.name).filter(Boolean).join(' / ');
export function GroupLinks({data,ids,onGroup}:{data:Catalog;ids:string[];onGroup?:((id:string)=>void)}){return <div className="group-links eyebrow">{data.groups.filter(g=>ids.includes(g.id)).map(g=>onGroup?<button key={g.id} className="text-button" onClick={()=>onGroup(g.id)}>{g.name}<ChevronRight size={13}/></button>:<span key={g.id}>{g.name}</span>)}</div>;}
export function PhotoView({photo,referencePhoto,label,kind='档案资料照',className='',live=true,retryable=Boolean(photo&&live),priority=false,fit}:{photo:Photo|null;referencePhoto?:Photo|null;label:string;kind?:string;className?:string;live?:boolean;retryable?:boolean;priority?:boolean;fit?:'contain'}){
 kind=mvPhotoLabel(photo,kind);
 const src=photo&&live?`/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`:'';
 const [imageState,setImageState]=useState<{request:object;value:ReliableImageState}|null>(null);
 const imageKey=JSON.stringify([src,label,kind]);
 const request=useMemo(()=>({}),[imageKey]),currentRequest=useRef(request);currentRequest.current=request;
 const receiveImageState=useCallback((value:ReliableImageState)=>{if(currentRequest.current===request)setImageState({request,value});},[request]);
 const currentImageState=imageState?.request===request?imageState.value:null;
 const image=<CatalogPhotoImage photo={photo} live={live} label={label+' · '+kind} priority={priority} fit={fit} retryable={retryable}
  onStateChange={receiveImageState} missing={<div className="photo-empty"><ImageIcon size={28}/><span>{photo?'图片暂时无法加载':kind.includes('MV')?'暂无 MV 截图':'暂无照片'}</span></div>}
  fallback={<div className="photo-empty"><ImageIcon size={28}/><span>图片暂时无法加载</span></div>}/>;
 const frame=<div className={'photo '+className+(photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')}>{src&&photo?.table==='ratings'?<a href={currentImageState?.src||src} target="_blank" rel="noopener noreferrer" aria-label={'放大'+kind} onClick={event=>{if(currentImageState?.status==='error'){event.preventDefault();event.stopPropagation();}}}>{image}</a>:image}<span className="image-label">{kind}</span></div>;
 return live&&mvReferencePhoto(photo,referencePhoto)?<div className="mv-photo-stack">{frame}<MvPhotoReference photo={photo} referencePhoto={referencePhoto} label={label} live={live}/></div>:frame;
}
