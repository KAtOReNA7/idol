'use client';
import type {ReactNode} from 'react';
import type {CatalogView,Work} from '@/lib/idol/types';
import {creditHeading,publicCreditForWork,publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {publicProductionForWork} from '@/lib/idol/public-production-credits';
import {publicWorkRecognition} from '@/lib/idol/public-work-recognition';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import {PublicGroupRecognition} from './public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import './public-work-credits.css';

export function PublicProductionCredits({work}:{work:Work}){
 const row=publicProductionForWork(work);
 if(!row)return null;
 return <section className="public-work-credits" aria-label="MV制作资料" data-production-work={work.id}><h2>MV 制作资料</h2><ul>{row.credits.map(c=><li key={c.role}><span>{c.role}</span><strong>{c.name}</strong></li>)}</ul><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">公开制作名单 · 来源 ↗</a></section>;
}

export function PublicWorkCredits({work,data,onMember,rateMember}:{work:Work;data:CatalogView;onMember:(id:string)=>void;rateMember?:(id:string)=>(()=>void)|undefined}){
 const credit=publicCreditForWork(work);
 const members=credit?.memberIds.flatMap(id=>data.members.filter(m=>m.id===id))??[];
 const portraits=publicWorkRecognition(work);
 if(!credit)return <PublicGroupRecognition work={work} data={data} onMember={onMember} rateMember={rateMember}/>;
 if(!members.length)return null;
 const title=creditHeading(credit);
 return <section className="public-work-credits" aria-label={title} data-credit-work={work.id}>
  <h2>{title}</h2>
  <ul className={portraits.length?'public-recognition-grid':undefined}>{members.map(m=>{const portrait=portraits.find(p=>p.memberId===m.id),rate=rateMember?.(m.id);return <li key={m.id}>
   {portrait&&<PublicCreditRecognitionPhoto work={work} memberId={m.id} label={memberDisplayName(m)} reference={portrait}/>}
   <button type="button" onClick={()=>onMember(m.id)}>{memberDisplayName(m)} ↗</button>
   {rate&&<button type="button" className="credit-score-action" aria-label={'给'+memberDisplayName(m)+'评分'} onClick={rate}>个人评分</button>}
  </li>;})}</ul>
  <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a>
 </section>;
}
export function MemberPublicCredits({memberId,data,onWork,renderLink}:{memberId:string;data:CatalogView;onWork?:(id:string)=>void;renderLink?:(work:Work,label:string)=>ReactNode}){
 const rows=publicCreditsForMember(data,memberId);
 if(!rows.length||!onWork&&!renderLink)return null;
 return <section className="public-work-credits" aria-label="公开作品资料" data-credit-member={memberId} data-member-module="public">
  <h2>公开作品资料</h2>
  <ul>{rows.map(({work,credit})=><li key={work.id}>{renderLink?renderLink(work,(work.song||work.name)+' ↗'):<button type="button" onClick={()=>onWork?.(work.id)}>{work.song||work.name} ↗</button>}<span>{creditHeading(credit)}</span></li>)}</ul>
 </section>;
}
