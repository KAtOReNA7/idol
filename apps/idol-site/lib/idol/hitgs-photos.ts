import portraits from '../../data/hitgs-member-portraits.json';
import type {Member} from './types';
export function hitgsMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes('rec28ldfRTiE4q'))return null;
 const portrait=portraits.find(row=>row.id===member.id);
 return portrait?{image:portrait.image,label:'HITGS · Kprofiles 具名转载照片',date:'拍摄日期未注明'}:null;
}
