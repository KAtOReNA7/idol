import data from '../../data/izone-public.json';
import {safeArtistReturn} from './artist-navigation';
import type {Member} from './types';

/** Historical artwork belongs to the IZ*ONE journey, never a global member override. */
export function izoneMemberPortrait(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,artistReturn?:string|null){
 const route=safeArtistReturn(artistReturn);
 if(!route||new URL(route,'https://site.invalid').pathname!=='/artists/izone')return null;
 if(!member.groupIds.includes(data.group.id)&&!member.formerGroupIds?.includes(data.group.id))return null;
 const person=data.members.find(p=>p.id===member.id);
 return person?{image:person.image,label:'IZ*ONE · Panorama 时期官网照片（历史存档）',date:person.photoDate}:null;
}
