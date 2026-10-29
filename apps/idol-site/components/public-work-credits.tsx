'use client';
import type {ReactNode} from 'react';
import type {CatalogView,Work} from '@/lib/idol/types';
import {publicCreditForWork,publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {publicProductionForWork} from '@/lib/idol/public-production-credits';
import {publicWorkRecognition} from '@/lib/idol/public-work-recognition';
import {mvMemberAbsence} from '@/lib/idol/mv-member-appearance';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import {PublicGroupRecognition} from './public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import './public-work-credits.css';

export function PublicProductionCredits({work}:{work:Work}){
 const row=publicProductionForWork(work);
 if(!row)return null;
 return <section className="public-work-credits" aria-label="MV制作资料" data-production-work={work.id}><h2>MV 制作资料</h2><ul>{row.credits.map(c=><li key={c.role}><span>{c.role}</span><strong>{c.name}</strong></li>)}</ul><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">公开制作名单 · 来源 ↗</a></section>;
}

export function PublicWorkCredits({work,data,onMember}:{work:Work;data:CatalogView;onMember:(id:string)=>void}){
 const credit=publicCreditForWork(work);
 const members=credit?.memberIds.flatMap(id=>data.members.filter(m=>m.id===id))??[];
 const portraits=publicWorkRecognition(work);
 const absence=mvMemberAbsence(work);
 if(!credit)return <PublicGroupRecognition work={work} data={data} onMember={onMember}/>;
 if(!members.length)return null;
 return <section className="public-work-credits" aria-label={credit.label} data-credit-work={work.id}>
  <h2>{credit.label}</h2><p>{credit.note}</p>
  {absence&&<p>本视频没有成员真人出镜；以下仅为公开署名人物的认人参考，不提供成员评分。</p>}
  {portraits.length>0&&<p>照片用于识别公开署名人物，不代表已核实其在本视频出镜或同期造型。</p>}
  <ul className={portraits.length?'public-recognition-grid':undefined}>{members.map(m=>{const portrait=portraits.find(p=>p.memberId===m.id);return <li key={m.id}>
   {portrait&&<PublicCreditRecognitionPhoto work={work} memberId={m.id} label={memberDisplayName(m)} reference={portrait}/>}
   <button type="button" onClick={()=>onMember(m.id)}>{memberDisplayName(m)} ↗</button>
  </li>;})}</ul>
  <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a>
 </section>;
}
export function MemberPublicCredits({memberId,data,onWork,renderLink}:{memberId:string;data:CatalogView;onWork?:(id:string)=>void;renderLink?:(work:Work,label:string)=>ReactNode}){
 const rows=publicCreditsForMember(data,memberId);
 if(!rows.length||!onWork&&!renderLink)return null;
 return <section className="public-work-credits" aria-label="公开作品资料" data-credit-member={memberId} data-member-module="public">
  <h2>公开作品资料</h2><p>已核实的参演或署名资料；这里的条目不生成个人评分。</p>
  <ul>{rows.map(({work,credit})=><li key={work.id}>{renderLink?renderLink(work,(work.song||work.name)+' ↗'):<button type="button" onClick={()=>onWork?.(work.id)}>{work.song||work.name} ↗</button>}<span>{credit.label}</span></li>)}</ul>
 </section>;
}
