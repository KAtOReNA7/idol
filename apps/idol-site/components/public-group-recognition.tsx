'use client';
import type {CatalogView,Work} from '@/lib/idol/types';
import {publicGroupRecognitionForWork} from '@/lib/idol/public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import './public-work-credits.css';

export function PublicGroupRecognition({work,data,onMember}:{work:Work;data:CatalogView;onMember:(id:string)=>void}){
 const reference=publicGroupRecognitionForWork(work);
 if(!reference)return null;
 const portraits=reference.portraits.flatMap(portrait=>{
  const member=data.members.find(member=>member.id===portrait.memberId&&[...member.groupIds,...(member.formerGroupIds??[])].includes(reference.groupId));
  return member?[{member,portrait}]:[];
 });
 if(!portraits.length)return null;
 return <section className="public-work-credits public-group-recognition" aria-label="团体通用认人参考" data-group-recognition-work={work.id} data-participation-status="unverified_for_work">
  <h2>团体通用认人参考</h2>
  <p><strong>未核实本作参与。</strong>以下是{reference.groupName}的通用认人照片，不是本作品的出镜、演唱或创作名单，也不代表本作同期妆造。这里不提供成员评分。</p>
  <p>{reference.collectionNote}</p>
  <ul className="public-recognition-grid">{portraits.map(({member,portrait})=><li key={member.id}>
   <PublicCreditRecognitionPhoto work={work} memberId={member.id} label={memberDisplayName(member)} reference={portrait}/>
   <button type="button" onClick={()=>onMember(member.id)}>{memberDisplayName(member)} ↗</button>
  </li>)}</ul>
 </section>;
}
