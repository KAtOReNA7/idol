'use client';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export function PhotoLightbox({src,label,onClose}:{src:string;label:string;onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onClose();}if(event.key==='Tab'){event.preventDefault();close.current?.focus();}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};},[onClose]);
 return <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={label} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><button ref={close} type="button" className="photo-lightbox-close" aria-label="关闭大图" onClick={onClose}><X size={21}/>关闭</button><figure><img src={src} alt={label}/><figcaption>{label}</figcaption></figure></div>;
}
