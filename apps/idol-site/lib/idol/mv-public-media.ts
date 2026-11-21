import manifest from '../../data/mv-public-media.json';
import {videoId} from './values';
import type {Work} from './types';

export * from './mv-public-covers';
export type MvPublicPortrait={workId:string;videoId:string;memberId:string;src:string;width:number;height:number;label:string;sourceUrl:string;photoKind?:'concept_photo'|'jacket_photo'|'portrait_photo';photoSetId?:string;objectPosition?:string;sourceCrop?:{x:number;y:number;width:number;height:number}};
const portraits=new Map((manifest.portraits as MvPublicPortrait[]).map(row=>[[row.workId,row.videoId,row.memberId].join(':'),row]));
export function publicMvPortrait(work:Pick<Work,'id'|'url'>,memberId:string){
 const id=videoId(work.url);
 return id?portraits.get([work.id,id,memberId].join(':'))??null:null;
}
