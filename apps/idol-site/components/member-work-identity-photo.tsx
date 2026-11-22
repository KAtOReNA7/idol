'use client';
import type {ReactNode} from 'react';
import type {Photo,Work} from '@/lib/idol/types';
import {memberWorkPhoto} from '@/lib/idol/member-work-photo';
import {ReliableImage} from './reliable-image';
import {useMemberRecognition} from './member-recognition-provider';
import './mv-photo-reference.css';

type Props={work:Pick<Work,'id'|'url'>;memberId:string;label:string;photo?:Photo|null;live:boolean;className:string;onOpen:(image:{src:string;label:string})=>void};

function OriginalWorkPhoto({selected,label,onOpen}:{selected:ReturnType<typeof memberWorkPhoto>}&Pick<Props,'label'|'onOpen'>){
 const previous=selected?.publicImage;
 const previousSrc=previous?.originalSrc??previous?.src;
 if(!selected?.edition||!previous||!previousSrc||previousSrc===selected.original)return null;
 const prior=selected.edition.previousEdition;
 const title=prior?.original===previousSrc?prior.label:'原作品图';
 return <span className="member-work-photo-history">
  <button type="button" aria-haspopup="dialog" aria-label={`查看${label}的${title}${title===previous.label?'':' · '+previous.label}`} onClick={()=>onOpen({src:previousSrc,label:`${label} · ${previous.label}`})}>查看{title}</button>
  <a href={previous.sourceUrl} target="_blank" rel="noopener noreferrer">原出处 ↗</a>
 </span>;
}

/** Retains the host's existing button/frame; only its read-only image changes. */
export function MemberWorkIdentityPhoto({work,memberId,label,photo,live,className,onOpen,showMissing=false,fallback,maxHeight}:{
 showMissing?:boolean;fallback?:ReactNode;maxHeight?:number;
}&Props){
 const selected=memberWorkPhoto(work,memberId,photo,live,useMemberRecognition());
 if(!selected&&!showMissing)return <>{fallback}</>;
 const publicImage=selected?.publicImage;
 const crop=selected?.edition?undefined:publicImage?.sourceCrop;
 const caption=selected?.label??'认人图待补';
 const key=[work.id,work.url,memberId,selected?.src].join(':');
 // Private native-photo overrides must not resize a public crop's source pixels.
 const frameClass=publicImage?className.split(/\s+/).filter(name=>name!=='mv-look-native').join(' '):className;
 const image=<ReliableImage src={selected?.src} identityKey={key} alt={`${label} · ${caption}`} style={publicImage?{display:'block',width:'100%',height:'100%',maxWidth:'none',maxHeight:crop?'none':maxHeight,objectFit:crop?'fill':'contain',objectPosition:selected?.edition?'center':publicImage.objectPosition??'center'}:undefined}/>;
 return <>
  <button type="button" className={frameClass} disabled={!selected} data-member-work-identity={selected?'available':'missing'} data-identity-source={selected?.edition?'named-series':publicImage?.photoKind} aria-haspopup={selected?'dialog':undefined} aria-label={selected?`查看${label}的${caption}原图`:`${label}的认人图待补`} onClick={()=>selected&&onOpen({src:selected.original,label:`${label} · ${caption}`})}>
   {publicImage&&crop?
    <svg viewBox={`0 0 ${crop.width} ${crop.height}`} preserveAspectRatio="xMidYMid meet" style={{display:'block',width:'100%',height:'100%',maxHeight}} aria-hidden="true" focusable="false" data-identity-crop={`${crop.x},${crop.y},${crop.width},${crop.height}`}>
     {/* The inner viewport also clips the letterboxed sides in wider host frames. */}
     <svg width={crop.width} height={crop.height} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} style={{overflow:'hidden'}}>
      <foreignObject x="0" y="0" width={publicImage.width} height={publicImage.height}>{image}</foreignObject>
     </svg>
    </svg>:image}
  </button>
  {selected&&(publicImage||photo?.sourceKind==='mv_look_photo')&&<small className="mv-look-photo-caption" data-identity-caption data-release-portrait={selected.edition?true:undefined}>{caption}{selected.sourceUrl&&<>{!selected.edition&&' · '}<a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a></>}</small>}
  <OriginalWorkPhoto selected={selected} label={label} onOpen={onOpen}/>
 </>;
}

/** Existing text-only controls keep their layout and open the complete source. */
export function MemberWorkPhotoButton({work,memberId,label,photo,live,className,onOpen}:Props){
 const selected=memberWorkPhoto(work,memberId,photo,live,useMemberRecognition());
 if(!selected)return null;
 const button=<button type="button" className={className} data-member-work-photo-button data-identity-source={selected.edition?'named-series':selected.publicImage?.photoKind} aria-haspopup="dialog" aria-label={`查看${label}的${selected.label}原图`} onClick={()=>onOpen({src:selected.original,label:`${label} · ${selected.label}`})}>{selected.publicImage?`查看${selected.label}原图`:'查看已有照片'}</button>;
 if(!selected.edition)return button;
 return <span className="member-work-photo-actions">{button}<a href={selected.edition.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a><OriginalWorkPhoto selected={selected} label={label} onOpen={onOpen}/></span>;
}
