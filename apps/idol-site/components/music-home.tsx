'use client';
import {ChevronRight,Play,Disc3} from 'lucide-react';
import type {CatalogView,Group,Work} from '@/lib/idol/types';
import {ReliableImage} from './reliable-image';
import {WorkCoverImage} from './app-image-presentation';
import artwork from '@/data/music-index-artwork.json';
export const musicArtwork=new Map(artwork.map(row=>[row.groupId,row]));
export function MusicGroupCard({group,onOpen}:{group:Group;onOpen:()=>void}){const art=musicArtwork.get(group.id);return <button className="music-group-card" data-browse-anchor={'group-'+group.id} onClick={onOpen}><div className="music-group-photo"><ReliableImage src={art?.image} alt={art?.caption??group.name} fallback={<span>{group.name}</span>}/></div><h3>{group.name}</h3><p>{group.company||group.generation}</p></button>;}
// Explicit editorial selections, matched against both the group and song. These
// are entry points, not a fabricated ranking or a claim about newest releases.
const picks=[['ive','Baddie'],['illit','Magnetic'],['badvillain','HURRICANE'],['triples','Password'],['ifeye','Hazy (Daisy)'],['madein','BLUE'],['billlie','ZAP'],['katseye','Touch'],['izone','Panorama']];
export function musicPicks(data:CatalogView){return picks.flatMap(([slug,song])=>{const art=artwork.find(a=>a.slug===slug);const w=data.works.find(w=>!w.placeholder&&w.groupIds.includes(art?.groupId??'')&&w.song.toLowerCase()===song.toLowerCase());return w?[w]:[];});}
export function MusicHome({data,onGroup,onWork,onWorks,onGroups,onQueue}:{data:CatalogView;onGroup:(id:string)=>void;onWork:(work:Work,list:Work[])=>void;onWorks:()=>void;onGroups:()=>void;onQueue:(queue:string)=>void}){
 const selected=musicPicks(data);const featured=['ive','illit'].map(slug=>artwork.find(a=>a.slug===slug)!).filter(Boolean);
 const groups=['ive','illit','triples','badvillain','katseye'].flatMap(slug=>{const art=artwork.find(a=>a.slug===slug),g=data.groups.find(g=>g.id===art?.groupId);return g?[g]:[];});
 return <div className="music-home"><h1>发现</h1><section className="music-featured" aria-label="团体专题">{featured.map(art=><button key={art.slug} className="music-feature" onClick={()=>onGroup(art.groupId)}><h2>{art.name}</h2><div><ReliableImage src={art.image} alt={art.caption} priority/><span><Play size={18}/>探索团体</span></div><p>{art.slug==='ive'?'I’VE MINE':'SUPER REAL ME'}</p></button>)}</section>
 <section className="music-section"><div className="music-section-heading"><h2>从一支 MV 开始</h2><button onClick={onWorks}>查看全部<ChevronRight size={16}/></button></div><div className="music-track-grid">{selected.map(w=><button key={w.id} className="music-track" onClick={()=>onWork(w,selected)}><div className="music-track-art"><WorkCoverImage work={w} fallback={<Disc3 size={24}/>}/></div><div><h3>{w.song||w.name}</h3><p>{data.groups.filter(g=>w.groupIds.includes(g.id)).map(g=>g.name).join(' / ')}</p></div><ChevronRight size={17}/></button>)}</div></section>
 <section className="music-section"><div className="music-section-heading"><h2>团体</h2><button onClick={onGroups}>全部 {data.groups.length} 个团体<ChevronRight size={16}/></button></div><div className="music-group-rail">{groups.map(g=><MusicGroupCard key={g.id} group={g} onOpen={()=>onGroup(g.id)}/>)}</div></section>
 <section className="music-section"><div className="music-section-heading"><h2>我的观看</h2></div><div className="music-queues">{[['tonight','待看','从还没看过的作品开始'],['unrated','看过待评分','留下这次观看的感受'],['rewatch','高分重温','再看一次喜欢的作品']].map(([q,title,desc])=><button key={q} onClick={()=>onQueue(q)}><Play size={20}/><span><strong>{title}</strong><small>{desc}</small></span><ChevronRight size={18}/></button>)}</div></section></div>;
}
