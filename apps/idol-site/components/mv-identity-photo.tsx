'use client';
import {useState,type CSSProperties,type ReactNode} from 'react';
import type {Photo,Work} from '@/lib/idol/types';
import {publicMvPortrait,publicPortraitCard,type MvPublicPortrait} from '@/lib/idol/mv-public-media';
import {reviewedNativeRecognition} from '@/lib/idol/reviewed-native-recognition';
import type {RecognitionEditionPhoto} from '@/lib/idol/mv-recognition-edition';
import {ReliableImage} from './reliable-image';
import {OriginalPhotoLink} from './original-photo-link';
import {PhotoLightbox} from './photo-lightbox';
import {useMemberRecognition} from './member-recognition-provider';
import './mv-identity-photo.css';

function croppedStyle(width:number,height:number,crop:{x:number;y:number;width:number;height:number}):CSSProperties{
 const scale=Math.max(1/crop.width,(4/3)/crop.height);
 return {position:'absolute',maxWidth:'none',width:`${width*scale*100}%`,height:`${height*scale/(4/3)*100}%`,left:`${((1-crop.width*scale)/2-crop.x*scale)*100}%`,top:`${(((4/3)-crop.height*scale)/2-crop.y*scale)/(4/3)*100}%`,objectFit:'fill'};
}
/** Reviewed portraits use exact catalog bindings; a reference need not be an MV still. */
export function MvIdentityPhoto({work,memberId,label,photo,live=false,selectEdition,fallback,profilePortrait=false,children}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live?:boolean;selectEdition?:(original:MvPublicPortrait)=>RecognitionEditionPhoto|null;fallback?:ReactNode;profilePortrait?:boolean;children?:ReactNode}){
 const groupEdition=useMemberRecognition();
 const selected=publicMvPortrait(work,memberId);
 const reference=selected?null:reviewedNativeRecognition(work,memberId,photo);
 if(!selected&&!reference&&!(photo&&live)&&fallback)return <div className="mv-member-portrait-reference">{fallback}{children&&<div className="mv-photo-score">{children}</div>}<small>成员资料照</small></div>;
 return <IdentityPhotoFrame work={work} memberId={memberId} label={label} photo={photo} live={live} publicImage={selected??reference} edition={selected&&(selectEdition?.(selected)??groupEdition?.(selected))} retainNative={Boolean(reference)} profilePortrait={profilePortrait}>{children}</IdentityPhotoFrame>;
}

/** A read-only public credit can show a named reference without inventing a rating. */
export function PublicCreditRecognitionPhoto({work,memberId,label,reference,edition,children}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;reference:Pick<MvPublicPortrait,'src'|'originalSrc'|'width'|'height'|'label'|'sourceUrl'|'objectPosition'|'sourceCrop'>;edition?:RecognitionEditionPhoto|null;children?:ReactNode}){
 const caption=reference.label.replace(/ · 认人参考$/,'').replace(/^既有/,'')
  .replace('已审完整原图','成员资料照').replace('具名照片','成员资料照').replace('团体通用认人参考','团体资料照');
 return <IdentityPhotoFrame work={work} memberId={memberId} label={label} publicImage={{...reference,label:caption,workId:work.id,videoId:'',memberId}}
  edition={edition} previousLabel="原认人照">{children}</IdentityPhotoFrame>;
}

function IdentityPhotoFrame({work,memberId,label,photo,live=false,publicImage,edition,previousLabel='原作品图',retainNative=false,profilePortrait=false,children}:{work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live?:boolean;publicImage:MvPublicPortrait|null;edition?:RecognitionEditionPhoto|null;previousLabel?:string;retainNative?:boolean;profilePortrait?:boolean;children?:ReactNode}){
 const src=edition?.original??publicImage?.originalSrc??publicImage?.src??(photo&&live?`/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`:'');
 const card=publicImage&&publicPortraitCard(publicImage.src);
 const thumbnail=edition?.preview??card?.src??publicImage?.src??src;
 const key=[work.id,work.url,memberId,src].join(':');
 const [opened,setOpened]=useState<string|null>(null);
 const nativeSrc=retainNative&&photo&&live?`/api/media?table=${photo.table}&record=${encodeURIComponent(photo.recordId)}&index=${photo.index}`:null;
 const focus=photo?.sourceKind==='mv_look_photo'?photo.displayFocus:null;
 const crop=edition?undefined:publicImage?publicImage.sourceCrop:focus?.sourceCrop;
 const width=publicImage?publicImage.width:focus?.sourceWidth,height=publicImage?publicImage.height:focus?.sourceHeight;
 const style=crop&&width&&height?croppedStyle(width,height,crop):{objectFit:'cover' as const,objectPosition:publicImage?.objectPosition??'50% 35%'};
 const caption=edition?.label??card?.label??publicImage?.label??(photo?.sourceKind==='mv_look_photo'?'本MV同造型照片':'本MV认人图');
 const previous=edition&&publicImage?.src!==edition.original?publicImage:null;
 const history=[];
 if(edition?.previousEdition){
  const prior=edition.previousEdition;
  history.push({src:prior.original,sourceUrl:prior.sourceUrl,title:prior.label,caption:prior.label});
 }
 if(previous)history.push({src:previous.src,sourceUrl:previous.sourceUrl,title:previousLabel,caption:previous.label});
 const frameImage=<>
   <ReliableImage src={thumbnail||null} identityKey={key} alt={`${label} · ${caption}`} style={style} missing={<span className="mv-identity-missing">认人图待补</span>} fallback={<span className="mv-identity-missing">图片暂未加载</span>}/>
   {src&&<span className="mv-identity-expand">查看原图 ↗</span>}
 </>;
 return <figure className="mv-identity-photo" data-mv-identity={src?'available':'missing'} data-identity-source={edition?'named-series':publicImage?.photoKind}>
  {profilePortrait&&publicImage&&src
    ? <OriginalPhotoLink className="mv-identity-frame" href={src} onOpen={()=>setOpened(key)} aria-label={`查看${label}的${caption}原图`}>{frameImage}</OriginalPhotoLink>
    : <button className="mv-identity-frame" type="button" disabled={!src} onClick={()=>setOpened(key)} aria-label={src?`查看${label}的${caption}原图`:`${label}的认人图待补`} aria-haspopup={src?'dialog':undefined}>{frameImage}</button>}
  {children&&<div className="mv-photo-score">{children}</div>}
  {src&&<figcaption>{caption}{publicImage&&<a href={edition?.sourceUrl??publicImage.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a>}</figcaption>}
  {history.map(item=><div key={item.src} className="mv-identity-history">
   <button className="mv-identity-previous" type="button" aria-haspopup="dialog" aria-label={`查看${label}的${item.title}${item.title===item.caption?'':' · '+item.caption}`} onClick={()=>setOpened(key+':'+item.src)}>查看{item.title}</button>
   <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={item.caption+'的原出处'}>原出处 ↗</a>
   {opened===key+':'+item.src&&<PhotoLightbox src={item.src} label={`${label} · ${item.caption}`} onClose={()=>setOpened(null)}/>}
  </div>)}
  {nativeSrc&&<button className="mv-identity-native" type="button" onClick={()=>setOpened(key+':native')}>查看原有照片 ↗</button>}
  {opened===key&&src&&<PhotoLightbox src={src} label={`${label} · ${caption}`} onClose={()=>setOpened(null)}/>}
  {opened===key+':native'&&nativeSrc&&<PhotoLightbox src={nativeSrc} label={`${label} · 原有照片`} onClose={()=>setOpened(null)}/>}
 </figure>;
}
