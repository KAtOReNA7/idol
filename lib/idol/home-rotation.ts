import type {CatalogView as Catalog,Work,Member} from './types';
import {inQueue} from './queues';
export type HomePool='tonight'|'rewatch'|'photos';
export type HomePick={seed:number;ids:string[];previous:string[]};
export type HomeRotation={version:1;tonight:HomePick;rewatch:HomePick;photos:HomePick};
const keys:HomePool[]=['tonight','rewatch','photos'];
const emptyPick=(seed:number,previous:string[]=[]):HomePick=>({seed:seed>>>0,ids:[],previous:[...new Set(previous)].slice(0,18)});
export function newHomeRotation(previous?:HomeRotation,seed=crypto.getRandomValues(new Uint32Array(1))[0]):HomeRotation{return {version:1,tonight:emptyPick(seed,previous?[...previous.tonight.ids,...previous.tonight.previous]:undefined),rewatch:emptyPick(seed^0x85ebca6b,previous?[...previous.rewatch.ids,...previous.rewatch.previous]:undefined),photos:emptyPick(seed^0xc2b2ae35,previous?[...previous.photos.ids,...previous.photos.previous]:undefined)};}
export function validHomeRotation(value:unknown):value is HomeRotation{const v=value as HomeRotation;return !!v&&v.version===1&&keys.every(k=>{const p=v[k];return p&&Number.isSafeInteger(p.seed)&&p.seed>=0&&p.seed<=0xffffffff&&['ids','previous'].every(x=>{const a=p[x as 'ids'|'previous'];return Array.isArray(a)&&a.length<=(x==='ids'?6:18)&&new Set(a).size===a.length&&a.every(id=>typeof id==='string'&&/^rec[A-Za-z0-9]+$/.test(id));});});}
function rank(id:string,seed:number){let h=seed;for(let i=0;i<id.length;i++){h=Math.imul(h^id.charCodeAt(i),16777619);h^=h>>>13;}return h>>>0;}
// Current eligible picks stay in place. Only empty/ineligible slots are filled.
// Prefer unseen items, then a group absent from this batch, with stable random ties.
export function selectHomeBatch<T extends {id:string;groupIds:string[]}>(pool:T[],count:number,pick:HomePick):T[]{
 const unique=[...new Map(pool.map(x=>[x.id,x])).values()];const byId=new Map(unique.map(x=>[x.id,x]));
 const result=pick.ids.map(id=>byId.get(id)).filter((x):x is T=>!!x).slice(0,count);const used=new Set(result.map(x=>x.id));const groups=new Set(result.flatMap(x=>x.groupIds));const recency=(id:string)=>{const i=pick.previous.indexOf(id);return i<0?0:pick.previous.length-i;};
 while(result.length<Math.min(count,unique.length)){const candidates=unique.filter(x=>!used.has(x.id));candidates.sort((a,b)=>recency(a.id)-recency(b.id)||Number(a.groupIds.some(g=>groups.has(g)))-Number(b.groupIds.some(g=>groups.has(g)))||rank(a.id,pick.seed)-rank(b.id,pick.seed)||a.id.localeCompare(b.id));const x=candidates[0];result.push(x);used.add(x.id);x.groupIds.forEach(g=>groups.add(g));}
 if(!pick.ids.length&&result.length>1&&result.every((x,i)=>x.id===pick.previous[i]))result.push(result.shift()!);
 return result;
}
export function homePools(data:Catalog|null):{tonight:Work[];rewatch:Work[];photos:Member[]}{const works=(data?.works??[]).filter(w=>!w.placeholder&&!!w.url);return {tonight:works.filter(w=>inQueue(w,'tonight',data?.groups??[])),rewatch:works.filter(w=>inQueue(w,'rewatch',data?.groups??[])),photos:(data?.members??[]).filter(m=>!!m.photo)};}
export function resolveHomeRotation(data:Catalog|null,rotation:HomeRotation|undefined){const pools=homePools(data);const base=rotation??newHomeRotation(undefined,0);const tonight=selectHomeBatch(pools.tonight,3,base.tonight),rewatch=selectHomeBatch(pools.rewatch,3,base.rewatch),photos=selectHomeBatch(pools.photos,2,base.photos);const selected={tonight,rewatch,photos};const next={...base};for(const k of keys)next[k]={...base[k],ids:selected[k].map(x=>x.id)};return {pools,selected,rotation:next};}
export function shuffleHomePool(current:HomeRotation,key:HomePool,seed=crypto.getRandomValues(new Uint32Array(1))[0]):HomeRotation{return {...current,[key]:emptyPick(seed,[...current[key].ids,...current[key].previous])};}
