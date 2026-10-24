'use client';
import {candidatePublicCopy} from '@/lib/idol/candidate/public-copy';
import type {CSSProperties} from 'react';
import {ReliableImage} from './reliable-image';
import {ArrowUpRight,ImageIcon} from 'lucide-react';
import type {Group,Member} from '@/lib/idol/types';
import type {CandidatePortrait} from '@/lib/idol/candidate/types';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import visuals from '@/data/candidate-index-visuals.json';
import './candidate-index-card.css';
import './candidate-index-fonts.css';

type Visual={slug:string;name:string;eyebrow:string;headline:string;hero:{image:string|null;caption:string;sourceUrl:string|null;scopeLabel?:string};portraits:Record<string,CandidatePortrait>;palette:Record<string,string>;variant:string;font?:{display:string;body:string}};
export function candidateIndexVisual(groupId:string):Visual|undefined{return (visuals as Record<string,Visual>)[groupId];}
function CardPhoto({src,alt,identityKey}:{src:string;alt:string;identityKey:string}){
 return <ReliableImage src={src} alt={alt} identityKey={identityKey} loading="lazy" decoding="async" fallback={<span className="candidate-index-missing"><ImageIcon size={24}/><small>图片暂时无法加载</small></span>}/>;
}
export function CandidateIndexCard({group,members,workCount,mean,onOpen}:{group:Group;members:Member[];workCount:number;mean:number|null;onOpen:()=>void}){
 const visual=candidateIndexVisual(group.id);
 if(!visual)return null;
 const photos=members.map(member=>({member,photo:candidatePortrait(member,visual.portraits)})).filter(item=>item.photo).slice(0,3);
 const style={...Object.fromEntries(Object.entries(visual.palette).map(([key,value])=>['--ci-'+key,value])),...(visual.font?{'--ci-display':`"${visual.font.display}",sans-serif`,'--ci-body':`"${visual.font.body}",sans-serif`}:{})} as CSSProperties;
 return <button type="button" data-browse-anchor={'group-'+group.id} data-candidate-index={visual.slug} className={`group-index-card candidate-index-card ci-${visual.variant} ci-page-${visual.slug}`} style={style} onClick={onOpen}>
  <div className="candidate-index-visual">
   {visual.hero.image?<CardPhoto identityKey={`group:${group.id}:index:hero`} key={visual.hero.image} src={visual.hero.image} alt={visual.hero.caption}/>:photos.length?<div className="candidate-index-gallery">{photos.map(({member,photo})=><CardPhoto identityKey={`group:${group.id}:member:${member.id}:index:portrait`} key={member.id+photo!.image} src={photo!.image} alt={`${memberDisplayName(member)} · ${photo!.official?'资料照':'档案照片'}`}/>)}</div>:<div className="candidate-index-wordmark"><strong>{group.name}</strong><span>团体照片待补</span></div>}
   <span className="candidate-index-caption">{visual.hero.image?visual.hero.caption:photos.length?'成员资料照选览 · 非团体合照':'发行与成员档案'}</span>
  </div>
  <div className="candidate-index-body">
   <small className="candidate-index-eyebrow">{visual.eyebrow}</small>
   <h2>{group.name}</h2>
   {group.currentName&&group.currentName!==group.name&&<p className="candidate-index-current">现名 {group.currentName}</p>}
   <p className="candidate-index-headline">{candidatePublicCopy[visual.slug]?.intro}</p>
   <div className="candidate-index-meta"><span>{members.length} 位收录成员</span><span>{workCount} 支作品</span>{mean!==null&&<span>我的 MV 均分 {mean.toFixed(1)}</span>}</div>
   <span className="candidate-index-enter">进入团体主页<ArrowUpRight size={18}/></span>
  </div>
 </button>;
}
