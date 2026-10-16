'use client';
import {useState,type CSSProperties} from 'react';
import {ArrowUpRight,ImageIcon} from 'lucide-react';
import type {Group,Member} from '@/lib/idol/types';
import type {CandidatePortrait} from '@/lib/idol/candidate/types';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import visuals from '@/data/candidate-index-visuals.json';
import './candidate-index-card.css';

type Visual={slug:string;name:string;eyebrow:string;headline:string;hero:{image:string|null;caption:string;sourceUrl:string|null;scopeLabel?:string};portraits:Record<string,CandidatePortrait>;palette:Record<string,string>;variant:string};
export function candidateIndexVisual(groupId:string):Visual|undefined{return (visuals as Record<string,Visual>)[groupId];}
function CardPhoto({src,alt}:{src:string;alt:string}){
 const [failed,setFailed]=useState(false);
 return failed?<span className="candidate-index-missing"><ImageIcon size={24}/><small>图片暂时无法加载</small></span>:<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>;
}
export function CandidateIndexCard({group,members,workCount,mean,onOpen}:{group:Group;members:Member[];workCount:number;mean:number|null;onOpen:()=>void}){
 const visual=candidateIndexVisual(group.id);
 if(!visual)return null;
 const photos=members.map(member=>({member,photo:candidatePortrait(member,visual.portraits)})).filter(item=>item.photo).slice(0,3);
 const style=Object.fromEntries(Object.entries(visual.palette).map(([key,value])=>['--ci-'+key,value])) as CSSProperties;
 return <button type="button" data-browse-anchor={'group-'+group.id} data-candidate-index={visual.slug} className={`group-index-card candidate-index-card ci-${visual.variant}`} style={style} onClick={onOpen}>
  <div className="candidate-index-visual">
   {visual.hero.image?<CardPhoto key={visual.hero.image} src={visual.hero.image} alt={visual.hero.caption}/>:photos.length?<div className="candidate-index-gallery">{photos.map(({member,photo})=><CardPhoto key={member.id+photo!.image} src={photo!.image} alt={`${memberDisplayName(member)} · ${photo!.official?'资料照':'档案照片'}`}/>)}</div>:<div className="candidate-index-wordmark"><strong>{group.name}</strong><span>团体照片待补</span></div>}
   <span className="candidate-index-caption">{visual.hero.image?(visual.hero.scopeLabel??'团体资料图 · 来源见详情'):photos.length?'成员资料照选览 · 非团体合照':'发行与成员档案'}</span>
  </div>
  <div className="candidate-index-body">
   <small className="candidate-index-eyebrow">{visual.eyebrow}</small>
   <h2>{group.name}</h2>
   {group.currentName&&group.currentName!==group.name&&<p className="candidate-index-current">现名 {group.currentName}</p>}
   <p className="candidate-index-headline">{visual.headline}</p>
   <div className="candidate-index-meta"><span>{members.length} 位收录成员</span><span>{workCount} 支作品</span>{mean!==null&&<span>我的 MV 均分 {mean.toFixed(1)}</span>}</div>
   <span className="candidate-index-enter">进入团体主页<ArrowUpRight size={18}/></span>
  </div>
 </button>;
}
