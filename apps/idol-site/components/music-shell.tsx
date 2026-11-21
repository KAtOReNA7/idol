'use client';
import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {LayoutGrid,Users,Clapperboard,UserRound,Search,ChartNoAxesColumn,NotebookPen,Menu,X,LockKeyhole} from 'lucide-react';
import type {Nav} from '@/lib/idol/journey';
import {SiteSignInLink} from './site-sign-in-link';

const items=[['home','发现',LayoutGrid],['groups','团体',Users],['works','作品',Clapperboard],['members','成员',UserRound],['records','观看记录',NotebookPen],['insights','偏好统计',ChartNoAxesColumn]] as const;
type Props={active:Nav;onNavigate:(nav:Nav)=>void;onSearch:(query:string)=>void;canEdit:boolean};

export function MusicNavigation({active,onNavigate,onSearch,canEdit}:Props){
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const trigger=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 function close(){if(dialog.current?.open){setOpen(false);dialog.current.close();}}
 function go(nav:Nav){close();onNavigate(nav);}
 function show(){dialog.current?.showModal();setOpen(true);}
 useEffect(()=>{
  const desktop=window.matchMedia('(min-width:761px)');
  function resize(){if(desktop.matches)dialog.current?.close();}
  desktop.addEventListener('change',resize);
  return ()=>desktop.removeEventListener('change',resize);
 },[]);
 function keepFocus(event:KeyboardEvent<HTMLDialogElement>){
  if(event.key!=='Tab')return;
  const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]')).filter(el=>el.getClientRects().length>0);
  const end=event.shiftKey?controls[0]:controls.at(-1);
  if(end&&document.activeElement===end){
   event.preventDefault();
   (event.shiftKey?controls.at(-1):controls[0])?.focus();
  }
 }
 function contents(mobile:boolean){return <>
  {mobile?<div className="music-drawer-heading"><span className="music-brand">stage.</span><button type="button" className="music-menu-close" aria-label="关闭导航" onClick={close} autoFocus><X size={18}/>关闭导航</button></div>:<button className="music-brand" onClick={()=>go('home')}>stage.</button>}
  <form className="music-search" role="search" onSubmit={event=>{event.preventDefault();close();onSearch(query);}}>
   <Search size={16}/><input aria-label="搜索作品或团体" value={query} maxLength={1000} onChange={e=>setQuery(e.target.value)} placeholder="搜索作品或团体"/><button type="submit" aria-label="开始搜索">↵</button>
  </form>
  <nav aria-label="主导航">{items.map(([key,label,Icon],i)=><div key={key}>{i===4&&<p className="music-nav-heading">我的手帐</p>}<button aria-current={active===key?'page':undefined} onClick={()=>go(key)}><Icon size={20}/><span>{label}</span></button></div>)}</nav>
  <p className="music-access"><LockKeyhole size={13}/>{canEdit?'仅本人可编辑':<>只读浏览<SiteSignInLink className="text-button">登录编辑</SiteSignInLink></>}</p>
 </>;}
 return <>
  <header className="music-mobile-header"><button className="music-brand" onClick={()=>go('home')}>stage.</button><button ref={trigger} className="music-menu" aria-label="打开导航" aria-expanded={open} aria-controls="music-navigation-dialog" onClick={show}><Menu/></button></header>
  <aside className="music-sidebar" id="music-sidebar">{contents(false)}</aside>
  <dialog ref={dialog} id="music-navigation-dialog" aria-label="网站导航" className="music-navigation-dialog" onKeyDown={keepFocus} onCancel={event=>{event.preventDefault();close();}} onClose={()=>{if(dialog.current?.open)return;setOpen(false);if(trigger.current?.getClientRects().length)trigger.current.focus({preventScroll:true});}}>
   {open&&<div className="music-sidebar is-open">{contents(true)}</div>}
  </dialog>
  <nav className="music-bottom-nav" aria-label="快捷导航">{items.slice(0,4).map(([key,label,Icon])=><button key={key} aria-current={active===key?'page':undefined} onClick={()=>go(key)}><Icon size={21}/><span>{label}</span></button>)}</nav>
 </>;
}
