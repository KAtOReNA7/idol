import data from '../../data/runtime/idle-design-public.json';
import originals from '../../data/idle-original-images.json';
import type {Member} from './types';

export function idleMemberPortrait(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>){
 const id='recvxyEBDZqkpg';
 if(!member.groupIds.includes(id)&&!member.formerGroupIds?.includes(id))return null;
 const person=data.members.find(row=>row.id===member.id);
 if(!person)return null;
 const asset=(data.assets as Record<string,{src:string}>)[person.imageKey];
 if(!asset)return null;
 return {image:(originals as Record<string,string>)[person.imageKey]||asset.src,label:person.profileListed?'i-dle · 日本官网资料照':'徐穗珍 · 2019 LATATA 日本出道资料照',date:person.profileListed?'拍摄日期未注明':'2019 年历史照片'};
}
