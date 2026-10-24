import data from '../../data/everglow-public.json';
import {safeArtistReturn} from './artist-navigation';
import type {Member} from './types';
export function everglowMemberContext(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 const route=safeArtistReturn(artistReturn);
 return !!route&&new URL(route,'https://site.invalid').pathname==='/artists/everglow'&&(member.groupIds.includes(data.group.id)||!!member.formerGroupIds?.includes(data.group.id))&&data.members.some(p=>p.id===member.id);
}
export function everglowMemberPortrait(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 if(!everglowMemberContext(member,artistReturn))return null;
 const p=data.members.find(p=>p.id===member.id);
 return p?.image?{image:p.image,label:p.photoLabel,date:p.photoDate}:null;
}
