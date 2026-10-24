import photos from '../../data/tracer-review-assets.json';
import content from '../../data/tracer-artist.json';
import type {Member} from './types';

/** Public official artwork for the exact archived member, never a saved media record. */
export function tracerMemberPortrait(member:Pick<Member,'id'|'groupIds'>){
 if(!member.groupIds.includes(content.groupId))return null;
 const portrait=(content.portraits as Record<string,{image:string}>)[member.id];
 return portrait?{image:portrait.image,label:'GLEAMMEDIA 官网资料照',date:'拍摄时期未注明'}:null;
}
/** Display derivatives resolve to the exact retained source, never a synthetic portrait. */
export function tracerOriginalPhoto(src:string){return (photos.originals as Record<string,string>)[src]??src;}
