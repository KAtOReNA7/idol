import data from '../../data/rocketpunch-public.json';
import {safeArtistReturn} from './artist-navigation';
import type {Member} from './types';
export function rocketpunchMemberContext(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 const route=safeArtistReturn(artistReturn);
 return !!route&&new URL(route,'https://site.invalid').pathname==='/artists/rocketpunch'&&(member.groupIds.includes(data.group.id)||!!member.formerGroupIds?.includes(data.group.id))&&data.members.some(p=>p.id===member.id);
}
export function rocketpunchMemberPortrait(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 if(!rocketpunchMemberContext(member,artistReturn))return null;
 const p=data.members.find(p=>p.id===member.id);
 return p?.image?{image:p.image,label:p.photoLabel,date:p.photoDate}:null;
}
export const latestRocketpunchOfficialUrl=data.sources.profile;
