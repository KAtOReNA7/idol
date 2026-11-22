import manifest from '../../data/mv-public-media.json';
import {videoId} from './values';
import {publicCustomArtistText} from './custom-artist-copy';
import type {Work} from './types';

export * from './mv-public-covers';
export type MvPublicPortrait={workId:string;videoId:string;memberId:string;src:string;originalSrc?:string;width:number;height:number;label:string;sourceUrl:string;photoKind?:'concept_photo'|'jacket_photo'|'portrait_photo';photoSetId?:string;objectPosition?:string;sourceCrop?:{x:number;y:number;width:number;height:number}};
const graduationOriginals = '/artist/mv-identity-batch-t-20261027/identities/qwer-';
const graduationCards = new Map([
 [graduationOriginals + 'e59760baf9ac15.jpg', 'chodan'],
 [graduationOriginals + 'ac3d7ced3fd1c3.jpg', 'magenta'],
 [graduationOriginals + '8a2f108b3959a8.jpg', 'hina'],
 [graduationOriginals + '1f0cd33d343abd.jpg', 'siyeon'],
]);
/** Full-frame previews retain the original pixel coordinates for the approved 3:4 crop. */
export function publicPortraitCard(src:string) {
 const member = graduationCards.get(src);
 return member ? {src:'/artist/recognition-editions/qwer/ceremony-graduation-'+member+'.card.webp', label:'CEREMONY · Graduation 概念照 · 认人参考'} : null;
}
const portraits=new Map((manifest.portraits as MvPublicPortrait[]).map(row=>[[row.workId,row.videoId,row.memberId].join(':'),{...row,label:publicCustomArtistText(row.label)}]));
export function publicMvPortrait(work:Pick<Work,'id'|'url'>,memberId:string){
 const id=videoId(work.url);
 return id?portraits.get([work.id,id,memberId].join(':'))??null:null;
}
