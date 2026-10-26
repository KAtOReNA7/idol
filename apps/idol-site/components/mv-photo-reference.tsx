'use client';
import {useState} from 'react';
import type {Photo} from '@/lib/idol/types';
import {mvReferencePhoto,privatePhotoSource} from '@/lib/idol/mv-photo-presentation';
import {PhotoLightbox} from './photo-lightbox';
import './mv-photo-reference.css';

export function MvPhotoReference({photo,referencePhoto,label,live=true}:{photo:Photo|null;referencePhoto?:Photo|null;label:string;live?:boolean}){
 const reference=mvReferencePhoto(photo,referencePhoto);
 const src=live&&reference?privatePhotoSource(reference):'';
 // Bind the open view to its exact source, so a refreshed record cannot leave
 // a previous work's reference open under the new work's name.
 const key=JSON.stringify([src,label]);
 const [opened,setOpened]=useState<string|null>(null);
 if(!src)return null;
 return <div className="mv-photo-reference"><button type="button" className="text-button" aria-haspopup="dialog" onClick={()=>setOpened(key)}>原MV截图</button>{opened===key&&<PhotoLightbox src={src} label={label+' · 原MV截图'} onClose={()=>setOpened(null)}/>}</div>;
}
