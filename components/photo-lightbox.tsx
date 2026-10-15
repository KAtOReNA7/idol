'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
export function PhotoLightbox({src,label,onClose}:{src:string;label:string;onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null),captionId=useId();
 const [failed,setFailed]=useState(false);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onClose();}if(event.key==='Tab'){event.preventDefault();close.current?.focus();}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
 return createPortal(<div className="photo-lightbox" role="dialog" aria-modal="true" aria-labelledby={captionId} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><button ref={close} type="button" className="photo-lightbox-close" aria-label="关闭大图" onClick={onClose}><X size={21}/>关闭</button><figure>{failed?<p className="photo-lightbox-error" role="status">图片暂时打不开，请关闭后重试。</p>:<img key={src} src={src} alt={label} onError={()=>setFailed(true)}/>}<figcaption id={captionId}>{label}</figcaption></figure></div>,document.body);
}
