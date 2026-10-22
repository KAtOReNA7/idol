import {publicPortraitCredit} from './portrait-copy';
import type {Member} from '../types';
import type {CandidatePortrait} from './types';

export type DisplayPortrait={image:string;credit:string;sourceUrl:string|null;official:boolean};
// A source-verified portrait wins. Existing archive media is a labelled fallback,
// never evidence of an official shoot or an MV-specific look.
export function candidatePortrait(member:Member,portraits:Record<string,CandidatePortrait>):DisplayPortrait|null{
 const official=portraits[member.id];
 if(official?.image&&official.stageName===member.stageName)return {...official,credit:publicPortraitCredit(official.credit),official:true};
 const photo=member.photo;
 if(photo?.table==='members'&&photo.recordId===member.id&&Number.isInteger(photo.index)&&photo.index>=0){
  return {image:`/api/media?table=members&record=${encodeURIComponent(member.id)}&index=${photo.index}`,credit:'成员档案照片',sourceUrl:null,official:false};
 }
 return null;
}
