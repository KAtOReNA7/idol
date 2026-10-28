'use client';
import {useState} from 'react';
import {LayoutGrid,Users,Clapperboard,UserRound,Search,ChartNoAxesColumn,NotebookPen,Menu,X,LockKeyhole} from 'lucide-react';
import type {Nav} from '@/lib/idol/journey';
import {SiteSignInLink} from './site-sign-in-link';
const items=[['home','发现',LayoutGrid],['groups','团体',Users],['works','作品',Clapperboard],['members','成员',UserRound],['records','观看记录',NotebookPen],['insights','偏好统计',ChartNoAxesColumn]] as const;
export function MusicNavigation({active,onNavigate,onSearch,canEdit}:{active:Nav;onNavigate:(nav:Nav)=>void;onSearch:(query:string)=>void;canEdit:boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 function go(nav:Nav){onNavigate(nav);setOpen(false);}
 return <><header className="music-mobile-header"><button className="music-brand" onClick={()=>go('home')}>stage.</button><button className="music-menu" aria-label={open?'关闭导航':'打开导航'} aria-expanded={open} aria-controls="music-sidebar" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>
 <aside className={'music-sidebar'+(open?' is-open':'')} id="music-sidebar"><button className="music-brand" onClick={()=>go('home')}>stage.</button><form className="music-search" role="search" onSubmit={e=>{e.preventDefault();onSearch(query);setOpen(false);}}><Search size={16}/><input aria-label="搜索作品或团体" value={query} maxLength={1000} onChange={e=>setQuery(e.target.value)} placeholder="搜索作品或团体"/><button type="submit" aria-label="开始搜索">↵</button></form><nav aria-label="主导航">{items.map(([key,label,Icon],i)=><div key={key}>{i===4&&<p className="music-nav-heading">我的手帐</p>}<button aria-current={active===key?'page':undefined} onClick={()=>go(key)}><Icon size={20}/><span>{label}</span></button></div>)}</nav><p className="music-access"><LockKeyhole size={13}/>{canEdit?'仅本人可编辑':<>只读浏览<SiteSignInLink className="text-button">登录编辑</SiteSignInLink></>}</p></aside>
 <nav className="music-bottom-nav" aria-label="快捷导航">{items.slice(0,4).map(([key,label,Icon])=><button key={key} aria-current={active===key?'page':undefined} onClick={()=>go(key)}><Icon size={21}/><span>{label}</span></button>)}</nav></>;
}
