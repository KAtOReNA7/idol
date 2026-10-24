import content from '../../data/itzy-artist.json';
import type {Member} from './types';
export function itzyMemberPortrait(member:Pick<Member,'id'|'stageName'|'groupIds'>){
 if(!member.groupIds.includes(content.groupId))return null;
 const p=Object.values(content.memberVisuals).find(p=>p.recordId===member.id);
 const stage=Object.entries(content.memberVisuals).find(([,p])=>p.recordId===member.id)?.[0];
 return p&&stage===member.stageName?{image:p.image,label:p.label,date:'官方档案资料照'}:null;
}
