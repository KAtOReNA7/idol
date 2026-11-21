'use client';
import {useState,type CSSProperties,type ReactNode} from 'react';
import type {Photo,Work} from '@/lib/idol/types';
import {publicMvPortrait,type MvPublicPortrait} from '@/lib/idol/mv-public-media';
import {reviewedNativeRecognition} from '@/lib/idol/reviewed-native-recognition';
import type {RecognitionEditionPhoto} from '@/lib/idol/mv-recognition-edition';
import {ReliableImage} from './reliable-image';
import {PhotoLightbox} from './photo-lightbox';
import './mv-identity-photo.css';

function croppedStyle(width:number,height:number,crop:{x:number;y:number;width:number;height:number}):CSSProperties{
 const scale=Math.max(1/crop.width,(4/3)/crop.height);
 return {position:'absolute',maxWidth:'none',width:`${width*scale*100}%`,height:`${height*scale/(4/3)*100}%`,left:`${((1-crop.width*scale)/2-crop.x*scale)*100}%`,top:`${(((4/3)-crop.height*scale)/2-crop.y*scale)/(4/3)*100}%`,objectFit:'fill'};
}
/** Reviewed portraits use exact catalog bindings; a reference need not be an MV still. */
export function MvIdentityPhoto({work,memberId,label,photo,live=false,selectEdition,fallback}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live?:boolean;selectEdition?:(original:MvPublicPortrait)=>RecognitionEditionPhoto|null;fallback?:ReactNode}){
 const selected=publicMvPortrait(work,memberId);
 const reference=selected?null:reviewedNativeRecognition(work,memberId,photo);
 if(!selected&&!reference&&!(photo&&live)&&fallback)return <>{fallback}</>;
 return <IdentityPhotoFrame work={work} memberId={memberId} label={label} photo={photo} live={live} publicImage={selected??reference} edition={selected&&selectEdition?.(selected)} retainNative={Boolean(reference)}/>;
}

/** A read-only public credit can show a named reference without inventing a rating. */
export function PublicCreditRecognitionPhoto({work,memberId,label,reference}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;reference:Pick<MvPublicPortrait,'src'|'width'|'height'|'label'|'sourceUrl'|'objectPosition'|'sourceCrop'>}){
 const caption=reference.label.replace(/ · 认人参考$/,'').replace(/^既有/,'')
  .replace('已审完整原图','成员资料照').replace('具名照片','成员资料照').replace('团体通用认人参考','团体资料照');
 return <IdentityPhotoFrame work={work} memberId={memberId} label={label} publicImage={{...reference,label:caption,workId:work.id,videoId:'',memberId}}/>;
}

function IdentityPhotoFrame({work,memberId,label,photo,live=false,publicImage,edition,retainNative=false}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live?:boolean;publicImage:MvPublicPortrait|null;edition?:RecognitionEditionPhoto|null;retainNative?:boolean}){
 const src=edition?.original??publicImage?.src??(photo&&live?`/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`:'');
 const thumbnail=edition?.preview??src;
 const key=[work.id,work.url,memberId,src].join(':');
 const [opened,setOpened]=useState<string|null>(null);
 const nativeSrc=retainNative&&photo&&live?`/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`:null;
 const focus=photo?.sourceKind==='mv_look_photo'?photo.displayFocus:null;
 const crop=edition?undefined:publicImage?publicImage.sourceCrop:focus?.sourceCrop;
 const width=publicImage?publicImage.width:focus?.sourceWidth,height=publicImage?publicImage.height:focus?.sourceHeight;
 const style=crop&&width&&height?croppedStyle(width,height,crop):{objectFit:'cover' as const,objectPosition:publicImage?.objectPosition??'50% 35%'};
 const caption=edition?.label??publicImage?.label??(photo?.sourceKind==='mv_look_photo'?'本MV同造型照片':'本MV认人图');
 const previous=edition&&publicImage?.src!==edition.original?publicImage:null;
 return <figure className="mv-identity-photo" data-mv-identity={src?'available':'missing'} data-identity-source={edition?'named-series':publicImage?.photoKind}>
  <button className="mv-identity-frame" type="button" disabled={!src} onClick={()=>setOpened(key)} aria-label={src?`查看${label}的${caption}原图`:`${label}的认人图待补`} aria-haspopup={src?'dialog':undefined}>
   <ReliableImage src={thumbnail||null} identityKey={key} alt={`${label} · ${caption}`} style={style} missing={<span className="mv-identity-missing">认人图待补</span>} fallback={<span className="mv-identity-missing">图片暂未加载</span>}/>
   {src&&<span className="mv-identity-expand">查看原图 ↗</span>}
  </button>
  {src&&<figcaption>{caption}{publicImage&&<a href={edition?.sourceUrl??publicImage.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a>}</figcaption>}
  {previous&&<div className="mv-identity-history"><button className="mv-identity-previous" type="button" aria-haspopup="dialog" aria-label={`查看${label}的原作品图 · ${previous.label}`} onClick={()=>setOpened(key+':previous')}>查看原作品图</button><a href={previous.sourceUrl} target="_blank" rel="noopener noreferrer">原出处 ↗</a></div>}
  {nativeSrc&&<button className="mv-identity-native" type="button" onClick={()=>setOpened(key+':native')}>查看原有照片 ↗</button>}
  {opened===key&&src&&<PhotoLightbox src={src} label={`${label} · ${caption}`} onClose={()=>setOpened(null)}/>}
  {opened===key+':previous'&&previous&&<PhotoLightbox src={previous.src} label={`${label} · ${previous.label}`} onClose={()=>setOpened(null)}/>}
  {opened===key+':native'&&nativeSrc&&<PhotoLightbox src={nativeSrc} label={`${label} · 原有照片`} onClose={()=>setOpened(null)}/>}
 </figure>;
}
