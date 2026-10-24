import portraits from '../../data/atheart-member-portraits.json';
import type {Member} from './types';
export function atheartMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes('rec28ldfRTiEaV'))return null;
 const portrait=portraits.find(row=>row.id===member.id);
 return portrait?{image:portrait.image,label:'AtHeart · 日本官网具名肖像',date:'拍摄日期未注明'}:null;
}
