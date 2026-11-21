import coverRecords from '../../data/runtime/mv-public-covers.json';
import {stageVideoPreview} from './stage-video-preview.mjs';
import {videoId} from './values';
export type MvPublicCover={workId?:string;videoId:string;src:string;width:number;height:number;label:string;sourceCrop?:{x:number;y:number;width:number;height:number}};
const covers=new Map((coverRecords as MvPublicCover[]).map(row=>[row.videoId,row]));
const coverSources=new Map((coverRecords as MvPublicCover[]).map(row=>[row.src,row]));
/** Only reviewed, symmetric encoded letterbox borders are removed in display. */
export function publicCoverZoom(source:string|null|undefined){
 if(!source)return 1;
 let pathname:string;try{pathname=new URL(source,'https://local.invalid').pathname;}catch{return 1;}
 const start=pathname.indexOf('/artist/mv-identity-20261025/covers/');
 const row=coverSources.get(start<0?pathname:pathname.slice(start)),crop=row?.sourceCrop;
 if(!row||!crop)return 1;
 const insetX=Math.max(crop.x,row.width-crop.x-crop.width),insetY=Math.max(crop.y,row.height-crop.y-crop.height);
 return Math.max(row.width/(row.width-2*insetX),row.height/(row.height-2*insetY));
}
/** Editorial video slots use the same exact-video cover without a rating binding. */
export function publicVideoCover(id:string|null){return id?covers.get(id)??null:null;}
export function cachedVideoPreview(id:string|null){
 if(!id)return null;
 return publicVideoCover(id)?.src??stageVideoPreview(id);
}
export function wholePreviewVideoId(url:string){
 const id=videoId(url);
 if(!id)return null;
 const location=new URL(url);
 return ['t','start','end','time_continue'].some(key=>location.searchParams.has(key))||/^#t=/.test(location.hash)?null:id;
}
export function publicVideoPreview(url:string,fallback:string){
 const id=wholePreviewVideoId(url);
 if(!id)return fallback;
 return publicVideoCover(id)?.src??(fallback||cachedVideoPreview(id)||'');
}
export function publicMvCover(workId:string,id:string|null){
 const item=id?covers.get(id):null;
 return item&&(!item.workId||item.workId===workId)?item:null;
}
