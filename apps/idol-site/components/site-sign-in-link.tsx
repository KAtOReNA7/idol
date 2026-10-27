'use client';
import {useEffect,useState,type ReactNode} from 'react';

function signInPath(returnTo:string){
 const safe=returnTo.startsWith('/')&&!returnTo.startsWith('//')?returnTo:'/';
 return `/signin-with-chatgpt?return_to=${encodeURIComponent(safe)}`;
}
function currentSignInPath(){return signInPath(window.location.pathname+window.location.search+window.location.hash);}

/** A native top-level navigation is required by Sites sign-in. */
export function SiteSignInLink({children,returnTo='/',className}:{children:ReactNode;returnTo?:string;className?:string}){
 const [href,setHref]=useState(()=>signInPath(returnTo));
 // Refresh after SPA navigation as well as the initial hydration.
 useEffect(()=>{setHref(currentSignInPath());});
 return <a href={href} target="_top" className={className} onClick={event=>{event.currentTarget.href=currentSignInPath();}}>{children}</a>;
}
