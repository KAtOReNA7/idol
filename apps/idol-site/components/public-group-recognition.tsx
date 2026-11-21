'use client';
import type {CatalogView,Work} from '@/lib/idol/types';
import {publicGroupRecognitionForWork} from '@/lib/idol/public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import './public-work-credits.css';

export function PublicGroupRecognition({work,data,onMember,rateMember}:{work:Work;data:CatalogView;onMember:(id:string)=>void;rateMember?:(id:string)=>(()=>void)|undefined}){
 const reference=publicGroupRecognitionForWork(work);
 if(!reference)return null;
 const portraits=reference.portraits.flatMap(portrait=>{
  const member=data.members.find(member=>member.id===portrait.memberId&&[...member.groupIds,...(member.formerGroupIds??[])].includes(reference.groupId));
  return member?[{member,portrait}]:[];
 });
 if(!portraits.length)return null;
 return <section className="public-work-credits public-group-recognition" aria-label="团体成员资料照" data-group-recognition-work={work.id} data-participation-status="unverified_for_work">
  <h2>{reference.groupName} 成员资料照</h2>
  <ul className="public-recognition-grid">{portraits.map(({member,portrait})=>{const rate=rateMember?.(member.id);return <li key={member.id}>
   <PublicCreditRecognitionPhoto work={work} memberId={member.id} label={memberDisplayName(member)} reference={portrait}/>
   <button type="button" onClick={()=>onMember(member.id)}>{memberDisplayName(member)} ↗</button>
   {rate&&<button type="button" className="credit-score-action" aria-label={'给'+memberDisplayName(member)+'评分'} onClick={rate}>个人评分</button>}
  </li>;})}</ul>
 </section>;
}
