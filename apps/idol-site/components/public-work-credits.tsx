'use client';
import type {CatalogView,Work} from '@/lib/idol/types';
import {publicCreditForWork,publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import './public-work-credits.css';

export function PublicWorkCredits({work,data,onMember}:{work:Work;data:CatalogView;onMember:(id:string)=>void}){
 const credit=publicCreditForWork(work);
 const members=credit?.memberIds.flatMap(id=>data.members.filter(m=>m.id===id))??[];
 if(!credit||!members.length)return null;
 return <section className="public-work-credits" aria-label={credit.label} data-credit-work={work.id}>
  <h2>{credit.label}</h2><p>{credit.note}</p>
  <ul>{members.map(m=><li key={m.id}><button type="button" onClick={()=>onMember(m.id)}>{memberDisplayName(m)} ↗</button></li>)}</ul>
  <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a>
 </section>;
}
export function MemberPublicCredits({memberId,data,onWork}:{memberId:string;data:CatalogView;onWork:(id:string)=>void}){
 const rows=publicCreditsForMember(data,memberId);
 if(!rows.length)return null;
 return <section className="public-work-credits" aria-label="公开作品资料" data-credit-member={memberId}>
  <h2>公开作品资料</h2><p>已核实的参演或署名资料；这里的条目不生成个人评分。</p>
  <ul>{rows.map(({work,credit})=><li key={work.id}><button type="button" onClick={()=>onWork(work.id)}>{work.song||work.name} ↗</button><span>{credit.label}</span></li>)}</ul>
 </section>;
}
