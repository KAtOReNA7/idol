'use client';
import type {ReactNode} from 'react';
import type {Photo,Work} from '@/lib/idol/types';
import {memberWorkPhoto} from '@/lib/idol/member-work-photo';
import {ReliableImage} from './reliable-image';
import './mv-photo-reference.css';

type Props={work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live:boolean;className:string;onOpen:(image:{src:string;label:string})=>void};

/** Retains the host's existing button/frame; only its read-only image changes. */
export function MemberWorkIdentityPhoto({work,memberId,label,photo,live,className,onOpen,showMissing=false,fallback,maxHeight}:{
 showMissing?:boolean;fallback?:ReactNode;maxHeight?:number;
}&Props){
 const selected=memberWorkPhoto(work,memberId,photo,live);
 if(!selected&&!showMissing)return <>{fallback}</>;
 const publicImage=selected?.publicImage;
 const crop=publicImage?.sourceCrop;
 const caption=selected?.label??'认人图待补';
 const key=[work.id,work.url,memberId,selected?.src].join(':');
 // Private native-photo overrides must not resize a public crop's source pixels.
 const frameClass=publicImage?className.split(/\s+/).filter(name=>name!=='mv-look-native').join(' '):className;
 const image=<ReliableImage src={selected?.src} identityKey={key} alt={`${label} · ${caption}`} style={publicImage?{display:'block',width:'100%',height:'100%',maxWidth:'none',maxHeight:crop?'none':maxHeight,objectFit:crop?'fill':'contain',objectPosition:publicImage.objectPosition??'center'}:undefined}/>;
 return <>
  <button type="button" className={frameClass} disabled={!selected} data-member-work-identity={selected?'available':'missing'} data-identity-source={publicImage?.photoKind} aria-haspopup={selected?'dialog':undefined} aria-label={selected?`查看${label}的${caption}原图`:`${label}的认人图待补`} onClick={()=>selected&&onOpen({src:selected.src,label:`${label} · ${caption}`})}>
   {publicImage&&crop?
    <svg viewBox={`0 0 ${crop.width} ${crop.height}`} preserveAspectRatio="xMidYMid meet" style={{display:'block',width:'100%',height:'100%',maxHeight}} aria-hidden="true" focusable="false" data-identity-crop={`${crop.x},${crop.y},${crop.width},${crop.height}`}>
     {/* The inner viewport also clips the letterboxed sides in wider host frames. */}
     <svg width={crop.width} height={crop.height} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} style={{overflow:'hidden'}}>
      <foreignObject x="0" y="0" width={publicImage.width} height={publicImage.height}>{image}</foreignObject>
     </svg>
    </svg>:image}
  </button>
  {selected&&(publicImage||photo?.sourceKind==='mv_look_photo')&&<small className="mv-look-photo-caption" data-identity-caption>{caption}{publicImage&&<> · <a href={publicImage.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a></>}</small>}
 </>;
}

/** Existing text-only controls keep their layout and open the complete source. */
export function MemberWorkPhotoButton({work,memberId,label,photo,live,className,onOpen}:Props){
 const selected=memberWorkPhoto(work,memberId,photo,live);
 if(!selected)return null;
 return <button type="button" className={className} data-member-work-photo-button data-identity-source={selected.publicImage?.photoKind} aria-haspopup="dialog" aria-label={`查看${label}的${selected.label}原图`} onClick={()=>onOpen({src:selected.src,label:`${label} · ${selected.label}`})}>{selected.publicImage?`查看${selected.label}原图`:'查看已有照片'}</button>;
}
