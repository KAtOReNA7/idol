import content from '../../data/vvup-artist.json';
import supplements from '../../data/vvup-review-supplements.json';
import {safeArtistReturn} from './artist-navigation';
import type {Member} from './types';

export function vvupMemberPortrait(member:Pick<Member,'id'|'stageName'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 const route=safeArtistReturn(artistReturn);
 if(!route||new URL(route,'https://site.invalid').pathname!=='/artists/vvup')return null;
 if(!member.groupIds.includes(content.groupId)&&!member.formerGroupIds?.includes(content.groupId))return null;
 const current=(content.portraits as Record<string,{image:string;stageName:string}>)[member.id];
 if(current?.image&&current.stageName.toLowerCase()===member.stageName.toLowerCase())return {image:current.image,label:'官方列示成员资料照',date:''};
 const historical=supplements.assets.find(p=>p.kind==='member'&&p.memberId===member.id&&p.stageName?.toLowerCase()===member.stageName.toLowerCase());
 return historical?{image:historical.url,label:'Ain’t Nobody 官方历史概念照',date:'2024'}:null;
}
