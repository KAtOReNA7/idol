'use client';
import type {ReactNode} from 'react';
import type {CatalogView,Member,Work} from '@/lib/idol/types';
import {creditHeading,publicCreditForWork,publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {publicProductionForWork} from '@/lib/idol/public-production-credits';
import {publicRecognitionEdition,publicWorkRecognition} from '@/lib/idol/public-work-recognition';
import {PublicCreditRecognitionPhoto} from './mv-identity-photo';
import {publicGroupRecognitionForWork} from '@/lib/idol/public-group-recognition';
import {MusicMemberPhoto} from './catalog/member-portrait';
import {PublicGroupRecognition} from './public-group-recognition';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import './public-work-credits.css';

export function PublicProductionCredits({work}:{work:Work}){
 const row=publicProductionForWork(work);
 if(!row)return null;
 return <section className="public-work-credits" aria-label="MV制作资料" data-production-work={work.id}><h2>MV 制作资料</h2><ul>{row.credits.map(c=><li key={c.role}><span>{c.role}</span><strong>{c.name}</strong></li>)}</ul><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">公开制作名单 · 来源 ↗</a></section>;
}

export function publicScoreMembers(work:Work,data:CatalogView){
 const credit=publicCreditForWork(work);
 if(credit)return new Set(credit.memberIds);
 const group=publicGroupRecognitionForWork(work);
 return new Set(group?.portraits.filter(p=>data.members.some(m=>m.id===p.memberId&&(m.groupIds.includes(group.groupId)||m.formerGroupIds?.includes(group.groupId)))).map(p=>p.memberId));
}

export function PublicWorkCredits({work,data,onMember,renderScore,inScoringSection=false}:{work:Work;data:CatalogView;onMember:(id:string)=>void;renderScore?:(member:Member)=>ReactNode;inScoringSection?:boolean}){
 const credit=publicCreditForWork(work);
 const members=credit?.memberIds.flatMap(id=>data.members.filter(m=>m.id===id))??[];
 const portraits=publicWorkRecognition(work);
 if(!credit)return <PublicGroupRecognition work={work} data={data} onMember={onMember} renderScore={renderScore} inScoringSection={inScoringSection}/>;
 if(!members.length)return null;
 const title=creditHeading(credit);
 return <section className="public-work-credits" aria-label={title} data-credit-work={work.id}>
  {!inScoringSection&&<h2>成员资料</h2>}
  <p className="member-credit-scope">{title}</p>
  <ul className={portraits.length?'public-recognition-grid':undefined}>{members.map(m=>{const portrait=portraits.find(p=>p.memberId===m.id),score=renderScore?.(m);return <li key={m.id} data-photo-member={m.id}>
   {portrait?<PublicCreditRecognitionPhoto work={work} memberId={m.id} label={memberDisplayName(m)} reference={portrait}
     edition={publicRecognitionEdition({workId:work.id,videoId:credit.videoId,memberId:m.id})}>
     {score}</PublicCreditRecognitionPhoto>:score&&<><MusicMemberPhoto member={m} live/><div className="mv-photo-score">{score}</div><small>成员资料照</small></>}
   <button type="button" onClick={()=>onMember(m.id)}>{memberDisplayName(m)} ↗</button>
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
