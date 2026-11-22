'use client';
import type {ReactNode} from 'react';
import type {CatalogView,Member,Work} from '@/lib/idol/types';
import {publicGroupRecognitionForWork} from '@/lib/idol/public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import './public-work-credits.css';

export function PublicGroupRecognition({work,data,onMember,renderScore,inScoringSection=false}:{work:Work;data:CatalogView;onMember:(id:string)=>void;renderScore?:(member:Member)=>ReactNode;inScoringSection?:boolean}){
 const reference=publicGroupRecognitionForWork(work);
 if(!reference)return null;
 const portraits=reference.portraits.flatMap(portrait=>{
  const member=data.members.find(member=>member.id===portrait.memberId&&[...member.groupIds,...(member.formerGroupIds??[])].includes(reference.groupId));
  return member?[{member,portrait}]:[];
 });
 if(!portraits.length)return null;
 return <section className="public-work-credits public-group-recognition" aria-label="团体成员资料照" data-group-recognition-work={work.id} data-participation-status="unverified_for_work">
  {!inScoringSection&&<h2>成员资料</h2>}
  <p className="member-credit-scope">{reference.groupName} 成员资料照 · 本作出镜未确认</p>
  <ul className="public-recognition-grid">{portraits.map(({member,portrait})=>{return <li key={member.id} data-photo-member={member.id}>
   <PublicCreditRecognitionPhoto work={work} memberId={member.id} label={memberDisplayName(member)} reference={portrait}>{renderScore?.(member)}</PublicCreditRecognitionPhoto>
   <button type="button" onClick={()=>onMember(member.id)}>{memberDisplayName(member)} ↗</button>
  </li>;})}</ul>
 </section>;
}
