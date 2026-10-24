import assets from '../../data/spia-review-assets.json';
import content from '../../data/spia-artist.json';
import type {Member} from './types';
export function spiaMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes(content.groupId))return null;
 const portrait=(content.portraits as Record<string,{image:string}>)[member.id];
 return portrait?{image:portrait.image,label:'Deeeep 时期具名转载照片',date:'Kprofiles 转载，拍摄日期未注明'}:null;
}
export function spiaOriginalPhoto(src:string){return (assets.originals as Record<string,string>)[src]??src;}
