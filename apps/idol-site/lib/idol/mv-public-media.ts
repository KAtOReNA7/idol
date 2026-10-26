import manifest from '../../data/mv-public-media.json';
import {videoId} from './values';
import type {Work} from './types';

export type MvPublicCover={workId?:string;videoId:string;src:string;width:number;height:number;label:string;sourceCrop?:{x:number;y:number;width:number;height:number}};
export type MvPublicPortrait={workId:string;videoId:string;memberId:string;src:string;width:number;height:number;label:string;sourceUrl:string;objectPosition?:string;sourceCrop?:{x:number;y:number;width:number;height:number}};
const data=manifest as {covers:MvPublicCover[];portraits:MvPublicPortrait[]};
const covers=new Map(data.covers.map(row=>[row.videoId,row]));
const coverSources=new Map(data.covers.map(row=>[row.src,row]));
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
const portraits=new Map(data.portraits.map(row=>[[row.workId,row.videoId,row.memberId].join(':'),row]));
/** Editorial video slots use the same exact-video cover without a rating binding. */
export function publicVideoCover(id:string|null){return id?covers.get(id)??null:null;}
export function publicVideoPreview(url:string,fallback:string){return publicVideoCover(videoId(url))?.src??fallback;}
export function publicMvCover(workId:string,id:string|null){
 const item=id?covers.get(id):null;
 return item&&(!item.workId||item.workId===workId)?item:null;
}
export function publicMvPortrait(work:Pick<Work,'id'|'url'>,memberId:string){
 const id=videoId(work.url);
 return id?portraits.get([work.id,id,memberId].join(':'))??null:null;
}
