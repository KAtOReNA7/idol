import {historicalRosterPath} from './member-affiliation';
import {candidateArtistPaths} from './candidate/registry';
import type {CatalogView as Catalog,Work} from './types';
import {groupCollection,groupWorkMatches} from './group-detail';
import {routeUrl} from './journey';

export const SAMPLE_GROUP_ID='rec28ldfRTiC1X';
export const artistSections=['overview','works','members','updates','records'] as const;
export type ArtistSection=typeof artistSections[number];
export function artistRoute(url:string){
 const u=new URL(url,'https://site.invalid'),p=u.searchParams;
 return {...(historicalRosterPath(u.pathname)&&p.getAll('roster').length===1&&p.get('roster')==='history'?{roster:'history' as const}:{}),section:artistSections.includes(p.get('section') as ArtistSection)?p.get('section') as ArtistSection:'overview',member:/^rec[A-Za-z0-9]+$/.test(p.get('member')??'')?p.get('member'):null,queue:['all','tonight','rewatch','unrated'].includes(p.get('queue')??'')?p.get('queue')!:'all',search:(p.get('q')??'').slice(0,200),format:['mv','stage'].includes(p.get('format')??'')?p.get('format')!:'all'};
}
export function artistRouteUrl(route:ReturnType<typeof artistRoute>,basePath='/preview/babymonster'){const p=new URLSearchParams();if(route.section!=='overview')p.set('section',route.section);if(route.member)p.set('member',route.member);if(route.queue!=='all')p.set('queue',route.queue);if(route.search)p.set('q',route.search);if([...candidateArtistPaths,'/artists/saymyname','/artists/katseye','/artists/itzy','/artists/lesserafim','/artists/kiiikiii','/artists/hearts2hearts','/artists/stayc','/artists/nmixx','/artists/ive','/artists/kissoflife'].includes(basePath)&&['mv','stage'].includes(route.format))p.set('format',route.format);if(historicalRosterPath(basePath)&&route.roster==='history')p.set('roster','history');return ([...candidateArtistPaths,'/artists/saymyname','/artists/katseye','/artists/itzy','/artists/lesserafim','/artists/kiiikiii','/artists/hearts2hearts','/artists/stayc','/artists/nmixx','/artists/kissoflife','/artists/babymonster','/artists/illit','/artists/xg','/artists/aespa','/artists/ive'].includes(basePath)?basePath:'/preview/babymonster')+(p.size?'?'+p:'');}
export function artistCollection(data:Catalog,groupId=SAMPLE_GROUP_ID){const group=data.groups.find(g=>g.id===groupId);if(!group)return null;const c=groupCollection(data,group);return {...c,group,works:[...c.works].sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)||a.id.localeCompare(b.id))};}
export function artistWorkRows(works:Work[],queue:string,search:string){return works.filter(w=>groupWorkMatches(w,queue,search));}
export function artistWorkUrl(work:Work,stage=false,artistReturn?:string){return routeUrl({nav:'works',work:work.id,member:null,video:stage?'stage':'mv',...(artistReturn?{artistReturn}:{})});}
export function artistMemberUrl(id:string,artistReturn?:string){return routeUrl({nav:'members',work:null,member:id,video:'mv',...(artistReturn?{artistReturn}:{})});}

export function artistWorkScoreLabel(score:number|null){return score===null?'未评分':score.toFixed(1);}

export type ArtistSalesRelease={id?:string;title:string;date:string;circle:{copies:number|null;asOf:string;cumulativeComplete?:boolean}|null};
export function artistSalesTotals(releases:ArtistSalesRelease[],year='all'){
 const selected=new Map<string,ArtistSalesRelease>();let conflict=false;
 for(const release of releases){if(year!=='all'&&!release.date.startsWith(year))continue;const key=release.id??`${release.date}|${release.title}`;const prior=selected.get(key);if(prior&&JSON.stringify(prior.circle)!==JSON.stringify(release.circle)){conflict=true;continue;}selected.set(key,release);}
 const rows=[...selected.values()];const known=rows.filter(r=>r.circle&&Number.isSafeInteger(r.circle.copies)&&r.circle.copies!==null&&r.circle.copies>=0);
 return {copies:conflict||!known.length?null:known.reduce((sum,r)=>sum+r.circle!.copies!,0),releaseCount:rows.length,knownCount:known.length,partial:conflict||known.length!==rows.length||rows.some(r=>r.circle?.cumulativeComplete!==true)};
}
