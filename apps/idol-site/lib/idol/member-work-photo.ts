import type {Photo, Work} from './types';
import {publicMvPortrait} from './mv-public-media';
import {mvPhotoLabel, privatePhotoSource} from './mv-photo-presentation';
import type {RecognitionSelector} from './recognition-edition-lookup';

/** Display only: a public reference never becomes a private rating attachment. */
export function memberWorkPhoto(work:Pick<Work,'id'|'url'>,memberId:string,photo:Photo|null|undefined,live:boolean,selectEdition?:RecognitionSelector){
 const publicImage=publicMvPortrait(work,memberId);
 if(publicImage){
  const edition=selectEdition?.(publicImage);
  return {src:edition?.preview??publicImage.src,original:edition?.original??publicImage.originalSrc??publicImage.src,
   label:edition?.label??publicImage.label,sourceUrl:edition?.sourceUrl??publicImage.sourceUrl,publicImage,edition};
 }
 if(photo&&live){
  const src=privatePhotoSource(photo);
  return {src,original:src,label:mvPhotoLabel(photo,'本MV认人图'),sourceUrl:null,publicImage:null,edition:null};
 }
 return null;
}
