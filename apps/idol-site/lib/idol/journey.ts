import {readInsightsViewState, type InsightsViewState} from './personal-insights/view-state';
import {safeArtistReturn} from './artist-navigation';
import {newHomeRotation,validHomeRotation,type HomeRotation} from './home-rotation';
export type Nav='home'|'works'|'members'|'groups'|'insights'|'records';
export type Route={nav:Nav;work:string|null;member:string|null;video:'mv'|'stage';groupId?:string|null;artistReturn?:string|null};
export type WorkSort='default'|'release-desc'|'release-asc'|'score-desc';
export type BrowseFilters={search:string;group:string;generation:string;queue:string;stageFilter:string;limit:number;page?:number;pageSize?:24|48;company?:string;watch?:string;sort?:WorkSort};
export type WatchSequence={ids:string[];label:string;filters:BrowseFilters;memberId?:string};
export type BrowseEntry={version:1;insights?:InsightsViewState;home?:HomeRotation;groupLists?:Record<string,BrowseFilters>;position:number;route:Route;lists:Record<Nav,BrowseFilters>;listScroll:Record<Nav,number>;scrollY:number;sequence?:WatchSequence;groupIndexFocus?:string;libraryFocus?:string;anchor?:{id:string;offset:number};from?:{position:number;label:string}};
export const defaultFilters=():BrowseFilters=>({sort:'default',watch:'all',search:'',group:'all',generation:'all',queue:'all',stageFilter:'all',limit:24});
const navs:Nav[]=['home','works','members','groups','insights','records'];
export function readRoute(url:string):Route{const p=new URL(url,'https://site.invalid').searchParams;return {nav:navs.includes(p.get('view') as Nav)?p.get('view') as Nav:'home',work:p.get('work'),member:p.get('member'),groupId:/^rec[A-Za-z0-9]+$/.test(p.get('group')??'')?p.get('group'):null,video:p.get('video')==='stage'?'stage':'mv',...(safeArtistReturn(p.get('returnTo'))?{artistReturn:safeArtistReturn(p.get('returnTo'))}:{})};}
export function routeUrl(route:Route){const p=new URLSearchParams();if(route.nav!=='home')p.set('view',route.nav);if(route.work)p.set('work',route.work);if(route.member)p.set('member',route.member);if(route.groupId&&!route.work&&!route.member)p.set('group',route.groupId);if(route.work&&route.video==='stage')p.set('video','stage');if((route.work||route.member)&&safeArtistReturn(route.artistReturn))p.set('returnTo',safeArtistReturn(route.artistReturn)!);return '/'+(p.size?'?'+p.toString():'');}
export function newEntry(url:string,position=0):BrowseEntry{return {version:1,position,route:readRoute(url),lists:Object.fromEntries(navs.map(n=>[n,defaultFilters()])) as BrowseEntry['lists'],listScroll:Object.fromEntries(navs.map(n=>[n,0])) as Record<Nav,number>,scrollY:0};}
export function readEntry(value:unknown,url:string):BrowseEntry|null{
 const e=(value as any)?.idolBrowse;
 if(!e||e.version!==1||!Number.isSafeInteger(e.position)||e.position<0||!e.route||routeUrl(e.route)!==routeUrl(readRoute(url))||!Number.isFinite(e.scrollY)||e.scrollY<0)return null;
 if(!navs.includes(e.route.nav)||!['mv','stage'].includes(e.route.video))return null;
 for(const n of navs){if(n==='records'&&!e.lists?.records&&e.listScroll?.records===undefined)continue;if(!Number.isFinite(e.listScroll?.[n])||e.listScroll[n]<0)return null;const f=e.lists?.[n];if(!f||!['search','group','generation','queue','stageFilter'].every(k=>typeof f[k]==='string'&&f[k].length<=1000)||!Number.isInteger(f.limit)||f.limit<24||f.limit>10000)return null;}
 if(e.sequence&&(!Array.isArray(e.sequence.ids)||e.sequence.ids.length>10000||!e.sequence.ids.every((id:unknown)=>typeof id==='string'&&/^rec[A-Za-z0-9]+$/.test(id))||new Set(e.sequence.ids).size!==e.sequence.ids.length||typeof e.sequence.label!=='string'||e.sequence.label.length>200||!e.sequence.filters||!['search','group','generation','queue','stageFilter'].every(k=>typeof e.sequence.filters[k]==='string'&&e.sequence.filters[k].length<=1000)||e.sequence.memberId!==undefined&&(typeof e.sequence.memberId!=='string'||!/^rec[A-Za-z0-9]+$/.test(e.sequence.memberId))))return null;
 if(e.groupLists&&(!e.groupLists||typeof e.groupLists!=='object'||Array.isArray(e.groupLists)||Object.keys(e.groupLists).length>100||Object.entries(e.groupLists).some(([id,f]:[string,any])=>!/^rec[A-Za-z0-9]+$/.test(id)||!f||!['search','group','generation','queue','stageFilter'].every(k=>typeof f[k]==='string'&&f[k].length<=1000)||!Number.isInteger(f.limit)||f.limit<24||f.limit>10000)))return null;
 if(e.groupIndexFocus!==undefined&&(typeof e.groupIndexFocus!=='string'||!/^group-rec[A-Za-z0-9]+$/.test(e.groupIndexFocus)))return null;
 if(e.lists.groups.company!==undefined&&(typeof e.lists.groups.company!=='string'||e.lists.groups.company.length>1000))return null;
 if(e.libraryFocus!==undefined&&(typeof e.libraryFocus!=='string'||e.libraryFocus.length>200))return null;
 for(const f of [...Object.values(e.lists),...(e.sequence?[e.sequence.filters]:[]),...Object.values(e.groupLists??{})]){if(f.page!==undefined&&(!Number.isSafeInteger(f.page)||f.page<1||f.page>10000))return null;if(f.pageSize!==undefined&&f.pageSize!==24&&f.pageSize!==48)return null;if(f.watch!==undefined&&!['all','watched','unwatched','unmarked'].includes(f.watch))return null;if(f.sort!==undefined&&!['default','release-desc','release-asc','score-desc'].includes(f.sort))return null;}
 if(e.anchor&&(typeof e.anchor.id!=='string'||e.anchor.id.length>200||!Number.isFinite(e.anchor.offset)))return null;
 if(e.from&&(!Number.isSafeInteger(e.from.position)||e.from.position>=e.position||typeof e.from.label!=='string'))return null;
 if(e.home!==undefined&&!validHomeRotation(e.home))return null;
 // Upgrade legacy navigation entries without carrying any personal-search text.
 return {...e,insights:readInsightsViewState(e.insights),lists:{...e.lists,records:e.lists.records??defaultFilters()},listScroll:{...e.listScroll,records:e.listScroll.records??0}} as BrowseEntry;
}
export function nextEntry(current:BrowseEntry,next:Partial<Route>,label:string,patch?:Partial<BrowseFilters>,sequence?:WatchSequence):BrowseEntry{
 const route={...current.route,...next};if(next.work||next.member||next.nav&&next.groupId===undefined)route.groupId=null;if(next.groupId){route.work=null;route.member=null;route.video='mv';}if(next.work!==undefined&&next.work!==current.route.work&&next.video===undefined)route.video='mv';
 if(!route.work&&!route.member)delete route.artistReturn;
 const lists={...current.lists},listScroll={...current.listScroll};if(patch)listScroll[route.nav]=0;if(patch)lists[route.nav]={...lists[route.nav],...patch};
 return {version:1,insights:readInsightsViewState(current.insights),position:current.position+1,route,lists,listScroll,...(current.groupIndexFocus?{groupIndexFocus:current.groupIndexFocus}:{}),...(current.groupLists?{groupLists:current.groupLists}:{}),home:route.nav==='home'&&!route.work&&!route.member&&!route.groupId?newHomeRotation(current.home):current.home,...(sequence?{sequence}:{}),scrollY:route.work||route.member||route.groupId?0:(listScroll[route.nav]??0),...(route.work||route.member||route.groupId?{from:{position:current.position,label}}:{})};
}
