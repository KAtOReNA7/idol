import {katseyeEditorialMembers} from './katseye-editorial';
import type {Member} from './types';
export function katseyeMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes('rec28ldfRTiDUd'))return null;
 const portrait=katseyeEditorialMembers.find(row=>row.id===member.id);
 return portrait?{image:portrait.image,label:'官网具名成员资料照',date:'2024年官网素材'}:null;
}
