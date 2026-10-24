import assets from '../../data/witchx-review-assets.json';
import content from '../../data/witchx-artist.json';
import type {Member} from './types';
export function witchxMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes(content.groupId))return null;
 const portrait=(content.portraits as Record<string,{image:string}>)[member.id];
 return portrait?{image:portrait.image,label:'IN MEDIA A&D 官网完整档案卡',date:'拍摄时期未注明'}:null;
}
export function witchxOriginalPhoto(src:string){return (assets.originals as Record<string,string>)[src]??src;}
