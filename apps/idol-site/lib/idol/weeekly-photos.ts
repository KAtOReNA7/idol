import data from '../../data/weeekly-public.json';
import {safeArtistReturn} from './artist-navigation';
import type {Member} from './types';
export function weeeklyMemberContext(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 const route=safeArtistReturn(artistReturn);
 return !!route&&new URL(route,'https://site.invalid').pathname==='/artists/weeekly'&&(member.groupIds.includes(data.group.id)||!!member.formerGroupIds?.includes(data.group.id))&&data.members.some(p=>p.id===member.id);
}
export function weeeklyMemberPortrait(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 if(!weeeklyMemberContext(member,artistReturn))return null;
 const p=data.members.find(p=>p.id===member.id);
 return p?.image?{image:p.image,label:p.photoLabel,date:p.photoDate}:null;
}
export const latestWeeeklyOfficialUrl=data.sources.profile;
