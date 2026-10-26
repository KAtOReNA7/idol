import portraits from '../../data/vcha-member-portraits.json';
import type {Member} from './types';
export function vchaMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes('rec28ldfRTiE0h'))return null;
 const portrait=portraits.find(row=>row.id===member.id);
 return portrait?{image:portrait.image,label:'VCHA 具名历史概念照',date:'2024年出道时期'}:null;
}
