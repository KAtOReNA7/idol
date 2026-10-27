'use client';
import {useState,type CSSProperties} from 'react';
import type {Photo,Work} from '@/lib/idol/types';
import {publicMvPortrait} from '@/lib/idol/mv-public-media';
import {ReliableImage} from './reliable-image';
import {PhotoLightbox} from './photo-lightbox';
import './mv-identity-photo.css';

function croppedStyle(width:number,height:number,crop:{x:number;y:number;width:number;height:number}):CSSProperties{
 const scale=Math.max(1/crop.width,(4/3)/crop.height);
 return {position:'absolute',maxWidth:'none',width:`${width*scale*100}%`,height:`${height*scale/(4/3)*100}%`,left:`${((1-crop.width*scale)/2-crop.x*scale)*100}%`,top:`${(((4/3)-crop.height*scale)/2-crop.y*scale)/(4/3)*100}%`,objectFit:'fill'};
}
/** Reviewed portraits use exact catalog bindings; a reference need not be an MV still. */
export function MvIdentityPhoto({work,memberId,label,photo,live=false}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live?:boolean}){
 const publicImage=publicMvPortrait(work,memberId);
 const src=publicImage?.src??(photo&&live?`/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`:'');
 const key=[work.id,work.url,memberId,src].join(':');
 const [opened,setOpened]=useState<string|null>(null);
 const focus=photo?.sourceKind==='mv_look_photo'?photo.displayFocus:null;
 const crop=publicImage?publicImage.sourceCrop:focus?.sourceCrop;
 const width=publicImage?publicImage.width:focus?.sourceWidth,height=publicImage?publicImage.height:focus?.sourceHeight;
 const style=crop&&width&&height?croppedStyle(width,height,crop):{objectFit:'cover' as const,objectPosition:publicImage?.objectPosition??'50% 35%'};
 const caption=publicImage?.label??(photo?.sourceKind==='mv_look_photo'?'本MV同造型照片':'本MV认人图');
 return <figure className="mv-identity-photo" data-mv-identity={src?'available':'missing'} data-identity-source={publicImage?.photoKind}>
  <button className="mv-identity-frame" type="button" disabled={!src} onClick={()=>setOpened(key)} aria-label={src?`查看${label}的${caption}原图`:`${label}的认人图待补`} aria-haspopup={src?'dialog':undefined}>
   <ReliableImage src={src||null} identityKey={key} alt={`${label} · ${caption}`} style={style} missing={<span className="mv-identity-missing">认人图待补</span>} fallback={<span className="mv-identity-missing">图片暂未加载</span>}/>
   {src&&<span className="mv-identity-expand">查看原图 ↗</span>}
  </button>
  <figcaption>{src?caption:'保留成员评分，待补清晰认人图'}{publicImage&&<a href={publicImage.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a>}</figcaption>
  {opened===key&&src&&<PhotoLightbox src={src} label={`${label} · ${caption}`} onClose={()=>setOpened(null)}/>}
 </figure>;
}
