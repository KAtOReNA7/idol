'use client';
import {ReliableImage} from '@/components/reliable-image';
import {sevenByGroup} from './catalog';
import direction from './art-direction.json';
import './index-card.css';
export function SevenIndexCard({groupId,members,works,onOpen}:{groupId:string;members:number;works:number;onOpen:()=>void}){
 const config=sevenByGroup(groupId);if(!config)return null;
 const art=(direction as Record<string,{hero?:string}>)[config.slug];
 return <button className={'group-index-card sr-index sr-index-'+config.slug} data-browse-anchor={'group-'+groupId} data-redesign-index={config.slug} onClick={onOpen}>
  <div className="sr-index-brand"><h2>{config.name}</h2><span>↗</span></div>
  <div className="sr-index-image"><ReliableImage src={art?.hero??config.hero} alt={config.heroCaption} identityKey={'redesign-index:'+config.slug}/></div>
  <div className="sr-index-copy"><strong>{config.era}</strong><p>{members} 位收录成员 · {works} 支作品</p><span>进入团体主页 ↗</span></div>
 </button>;
}
