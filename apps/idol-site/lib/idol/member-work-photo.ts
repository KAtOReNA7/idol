import type {Photo, Work} from './types';
import {publicMvPortrait} from './mv-public-media';
import {mvPhotoLabel, privatePhotoSource} from './mv-photo-presentation';

/** Display only: a public reference never becomes a private rating attachment. */
export function memberWorkPhoto(work:Pick<Work,'id'|'url'>,memberId:string,photo:Photo|null|undefined,live:boolean){
 const publicImage=publicMvPortrait(work,memberId);
 if(publicImage)return {src:publicImage.src,label:publicImage.label,publicImage};
 if(photo&&live)return {src:privatePhotoSource(photo),label:mvPhotoLabel(photo,'本MV认人图'),publicImage:null};
 return null;
}
