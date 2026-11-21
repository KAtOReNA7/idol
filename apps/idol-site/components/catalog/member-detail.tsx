'use client';
import {weeeklyMemberContext, latestWeeeklyOfficialUrl} from '@/lib/idol/weeekly-photos';
import {cherrybulletMemberContext, latestCherrybulletOfficialUrl} from '@/lib/idol/cherrybullet-photos';
import {rocketpunchMemberContext, latestRocketpunchOfficialUrl} from '@/lib/idol/rocketpunch-photos';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {publicCreditsForMember} from '@/lib/idol/public-work-credits';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {ArrowUpRight, ArrowLeft} from 'lucide-react';
import type {CatalogView as Catalog, Member} from '@/lib/idol/types';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {MvIdentityPhoto} from '@/components/mv-identity-photo';
import {SocialLinks} from '@/components/social-links';
import {memberWorks, memberWorkSummary, type MemberWork} from '@/lib/idol/member-works';
import {names, GroupLinks, PhotoView} from './presentation';
import {Editor} from './record-editor';
import {musicMemberPortrait, MusicPortrait, MusicMemberPhoto} from './member-portrait';

function MemberWorkCard({item,member,data,onOpen}:{item:MemberWork;member:Member;data:Catalog;onOpen:()=>void}){
 const number=(n:number|null)=>n===null?'待评':n.toFixed(1);
 return <article data-browse-anchor={'work-'+item.work.id} className="member-work-wrap member-work-card">
  <MvIdentityPhoto work={item.work} memberId={member.id} label={memberDisplayName(member)} photo={item.photo} live={data.mode==='live'}/>
  <MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={memberDisplayName(member)+' · '+item.work.song} live={data.mode==='live'}/>
  <button data-member-work-trigger={item.work.id} className="member-work-card__body" onClick={onOpen}><small className="member-work-card__meta">{names(data,item.work.groupIds)} · {item.work.videoType||'MV'}{item.work.version?' · '+item.work.version:''}</small><h3 className="member-work-card__title">{item.work.song||item.work.name}</h3><span className="member-work-card__scores">{([['个人表现',item.performance],['个人造型',item.styling]] as const).map(([label,value])=><span className="member-work-card__score" key={label}><small className="member-work-card__score-label">{label}</small><strong className="member-work-card__score-value" data-unrated={value===null}>{number(value)}</strong></span>)}</span><span className="member-work-card__open">查看作品<ArrowUpRight size={16}/></span></button>
 </article>;
}

export function MemberDetail({member:m,data,onBack,onWork,onGroup,onSaved,backLabel='返回成员档案',artistReturn}:{artistReturn?:string|null;member:Member;data:Catalog;onBack:()=>void;onWork:(id:string)=>void;onGroup?:(id:string)=>void;onSaved:()=>void;backLabel?:string}){
 const works=memberWorks(data,m.id),summary=memberWorkSummary(works),concept=musicMemberPortrait(m,artistReturn);const number=(n:number|null)=>n===null?'待评':n.toFixed(1);
 const careerMember=weeeklyMemberContext(m,artistReturn)?{...m,officialUrl:latestWeeeklyOfficialUrl}:cherrybulletMemberContext(m,artistReturn)?{...m,officialUrl:latestCherrybulletOfficialUrl}:rocketpunchMemberContext(m,artistReturn)?{...m,officialUrl:latestRocketpunchOfficialUrl}:m;
 return <div className="detail" data-member-layout="ordered-v1" data-member-id={m.id}>
  <button className="back text-button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button>
  <div className="member-detail" data-member-module="identity">
   {concept?<MusicPortrait concept={concept} member={m}/>:<PhotoView photo={m.photo} label={m.name} live={data.mode==='live'} retryable fit="contain"/>}
   <div data-member-module="basic">
    <GroupLinks data={data} ids={m.groupIds} onGroup={onGroup}/><h1><span className="member-display-name">{memberDisplayName(m)}</span></h1>
    <MemberPhysicalFacts member={m}/><div className="tags">{[m.status,m.country,m.role].filter(Boolean).map(t=><span key={t}>{t}</span>)}</div>
    <MemberCareerFacts member={careerMember} part="intro"/>
    <SocialLinks accounts={m.social??[]} title="个人账号" individual/>
   </div>
  </div>
  <section className="member-work-summary" aria-label="作品综合分" data-member-module="scores">
   <div className="member-work-summary__heading"><span className="member-work-summary__label">作品综合分</span><strong className="member-work-summary__value" data-unrated={summary.composite===null}>{number(summary.composite)}</strong></div>
   <p className="member-work-summary__count">已评 {summary.ratedWorks} 部作品</p>
   <div className="member-work-summary__dimensions">{([['表现均分',summary.performanceMean,summary.performanceCount],['造型均分',summary.stylingMean,summary.stylingCount]] as const).map(([label,value,count])=><div className="member-work-metric" key={label}><div className="member-work-metric__heading"><span className="member-work-metric__label">{label}</span><strong className="member-work-metric__value" data-unrated={value===null}>{number(value)}</strong></div><small className="member-work-metric__count">{count} 部已评</small></div>)}</div>
   <p className="member-work-summary__explanation">表现与造型，各占一半{summary.composite===null&&summary.ratedWorks>0?'；再评另一项即可生成综合分':''}</p>
  </section>
  <section className="section" data-member-module="works">
   <div className="section-heading"><h2>她的作品 <small>{works.length}</small></h2><span className="subtle">个人评分</span></div>
   <div className="member-works-grid">{works.map(item=><MemberWorkCard key={item.work.id} item={item} member={m} data={data} onOpen={()=>onWork(item.work.id)}/>)}</div>
   {works.length===0&&<p className="subtle">{publicCreditsForMember(data,m.id).length?'个人评分记录待补，公开作品资料见下方。':'还没有收录她的 MV。'}</p>}
  </section>
  <MemberPublicCredits memberId={m.id} data={data} onWork={onWork}/>
  <MemberCareerFacts member={careerMember} part="history"/>
  <section data-member-module="personal">
   {m.note&&<p className="my-note">{m.note}</p>}<Editor table="members" id={m.id} mode={data.mode} publicCatalog={data} onSaved={onSaved}/>
  </section>
  <MemberCareerFacts member={careerMember} part="sources"/>
 </div>;
}
