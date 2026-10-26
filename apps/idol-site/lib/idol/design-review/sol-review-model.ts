import rescene from '@/data/design-review/rescene-sol-v1.json';
import purplekiss from '@/data/design-review/purplekiss-sol-v1.json';
import identities from '@/data/public-artist-identity-map.json';
import registry from '@/data/artist-timeline-registry.json';
import {safeArtistReturn} from '../artist-navigation';
import {publicArtistHref, publicArtistDetailOrigin, resolvePublicArtistEntity, type PublicArtistFields, type PublicArtistCatalog} from '../public-artist-bridge';
import {prepareTimelinePresentation} from '../timeline/presentation';
import {sortTimelineEvents} from '../timeline/model';
import type {CatalogView} from '../types';
import type {TimelineEvent} from '../timeline/types';
import type {SolData, SolSlug, SolRoute, SolWork} from './sol-review-types';
export const SOL_REVIEW_PATHS = {rescene:'/design-review/rescene-v1',purplekiss:'/design-review/purplekiss-v1'} as const;
export const solPublicSource = (slug:SolSlug):SolData => (slug === 'rescene' ? rescene : purplekiss) as SolData;

/** Sorting is preview-only. Production editor return URLs keep the existing allowlist. */
export function canonicalSolReviewUrl(slug:SolSlug,value:string):string|null {
  try {
    const path=SOL_REVIEW_PATHS[slug];
    if(!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value) || value.split('?')[0]!==path) return null;
    const url=new URL(value,'https://site.invalid');
    if(url.pathname!==path || url.hash) return null;
    if(url.searchParams.has('sort')) {
      if(url.searchParams.getAll('sort').length!==1 || url.searchParams.get('section')!=='works' || !['newest','oldest'].includes(url.searchParams.get('sort')!)) return null;
      url.searchParams.delete('sort');
    }
    return safeArtistReturn(`/artists/${slug}${url.searchParams.size?'?'+url.searchParams:''}`);
  } catch {return null;}
}
export function solReviewUrlFromCanonical(slug:SolSlug,value:string|null):string|null {
  const safe=safeArtistReturn(value);
  if(!safe)return null;
  const url=new URL(safe,'https://site.invalid');
  return url.pathname===`/artists/${slug}`?SOL_REVIEW_PATHS[slug]+url.search:null;
}
export function solReviewHref(slug:SolSlug,fields:PublicArtistFields={}):string|null {
  const {sort,...canonicalFields}=fields;
  // The established production schema represents releases by absence of format.
  if(canonicalFields.format==='release') delete canonicalFields.format;
  const target=solReviewUrlFromCanonical(slug,publicArtistHref(slug,canonicalFields));
  if(!target)return null;
  if(sort==null)return target;
  const url=new URL(target,'https://site.invalid');url.searchParams.set('sort',sort);
  const sorted=url.pathname+url.search;
  return canonicalSolReviewUrl(slug,sorted)?sorted:null;
}
export function readSolReviewRoute(slug:SolSlug,value:string):SolRoute {
  const canonical=canonicalSolReviewUrl(slug,value);
  const params=new URL(canonical??`/artists/${slug}`,'https://site.invalid').searchParams;
  const sort=canonical && new URL(value,'https://site.invalid').searchParams.get('sort')==='oldest'?'oldest':'newest';
  return {valid:!!canonical,canonical,fields:{...Object.fromEntries(params),...(sort==='oldest'?{sort}: {})},section:params.get('section')==='records'?'works':params.get('section')??'overview',member:params.get('member'),release:params.get('release'),media:params.get('media'),format:params.get('format')==='mv'?'mv':params.get('format')==='stage'?'stage':'release',query:params.get('q')??'',sort,event:params.get('event'),year:params.get('year'),timelineType:params.get('timelineType')??'all'};
}
/** Display-only source records are projected explicitly; catalog private fields never spread. */
export function solReviewData(slug:SolSlug,catalog:PublicArtistCatalog|null):SolData {
  const source=solPublicSource(slug);
  const group=resolvePublicArtistEntity(slug,{kind:'group',key:slug},catalog);
  if(!group)return {...source,members:[],works:[]};
  const members=source.members.filter(member=>{
    const resolved=resolvePublicArtistEntity(slug,{kind:'member',key:member.id},catalog);
    return resolved?.kind==='member' && resolved.member.id===member.id;
  }).map(member=>({...member,sources:member.sources.map(source=>({...source}))}));
  const works=source.works.filter(item=>item.kind!=='release'||resolvePublicArtistEntity(slug,{kind:'release',key:item.key},catalog)?.kind==='release').map(item=>{
    const resolved=item.kind==='release'?null:resolvePublicArtistEntity(slug,{kind:item.kind,key:item.key},catalog);
    return {...item,releaseId:null,actionable:!!resolved&&(resolved.kind==='mv'||resolved.kind==='stage')&&resolved.work.id===item.workId&&resolved.videoId===item.videoId&&resolved.work.url===item.url};
  });
  return {...source,members,works};
}
export const solWorkFields=(work:SolWork):PublicArtistFields=>work.kind==='release'?{section:'works',release:work.key}:{section:'works',format:work.kind,media:work.key};
export function solReviewTimeline(slug:SolSlug,input:unknown,catalog:CatalogView|null) {
  const result=prepareTimelinePresentation(input,catalog,registry);
  if(!catalog || !resolvePublicArtistEntity(slug,{kind:'group',key:slug},catalog) || result.timeline?.groupId!==solPublicSource(slug).groupId || ['invalid','loading'].includes(result.state))return {...result,events:[]};
  return {...result,events:sortTimelineEvents(result.timeline.events.filter(event=>event.reviewStatus==='ready'&&!event.holdReasons.length),'earliest')};
}
export function solTimelineFields(slug:SolSlug,event:TimelineEvent):PublicArtistFields|null {
  const map=identities.groups[slug];
  if(event.groupId!==map.groupId || event.reviewStatus!=='ready' || event.holdReasons.length)return null;
  const release=map.releases.filter(row=>row.timelineReleaseKey===event.releaseKey&&row.timelineEventId===event.id);
  if(release.length===1)return {section:'works',release:release[0].key};
  const media=map.media.filter(row=>event.workIds.includes(row.workId));
  return media.length===1?{section:'works',format:media[0].kind,media:media[0].key}:null;
}
export type SolOpener={href:string;focus:string|null;parentEntry:boolean};
export function readSolOpener(slug:SolSlug,value:unknown):SolOpener|null {
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const row=value as Record<string,unknown>;
  if(typeof row.href!=='string'||!canonicalSolReviewUrl(slug,row.href)||typeof row.parentEntry!=='boolean'||row.focus!==null&&(typeof row.focus!=='string'||!canonicalSolReviewUrl(slug,row.focus)))return null;
  return {href:row.href,focus:row.focus as string|null,parentEntry:row.parentEntry};
}
export function solReviewNavigationPlan(slug:SolSlug,currentUrl:string,targetUrl:string,stored:unknown,focus:string|null=null) {
  const current=readSolReviewRoute(slug,currentUrl),next=readSolReviewRoute(slug,targetUrl);
  if(!current.valid||!next.valid)return null;
  const kind=(route:SolRoute)=>route.member?'member':route.release||route.media?'work':null;
  const sameDetail=!!kind(current)&&kind(current)===kind(next);
  let opener:SolOpener|null=null;
  if(kind(next)) {
    if(sameDetail)opener=readSolOpener(slug,stored);
    else opener={href:currentUrl,focus:focus&&canonicalSolReviewUrl(slug,focus)?focus:null,parentEntry:true};
    if(!opener) {
      const origin=solReviewUrlFromCanonical(slug,publicArtistDetailOrigin(slug,next.canonical!));
      if(origin)opener={href:origin,focus:null,parentEntry:false};
    }
  }
  return {method:sameDetail?'replaceState' as const:'pushState' as const,opener};
}
/** Preserve scroll/focus only for a compatible opener. A different work must be visible on return. */
export function solReviewReturnPlan(slug:SolSlug,currentUrl:string,stored:unknown):SolOpener|null {
  const route=readSolReviewRoute(slug,currentUrl);if(!route.valid)return null;
  const opener=readSolOpener(slug,stored);
  if(route.member)return opener??{href:solReviewHref(slug,{section:'members'})!,focus:null,parentEntry:false};
  const selected=solPublicSource(slug).works.find(work=>work.key===(route.release??route.media));
  if(!selected)return opener;
  if(opener){
    const origin=readSolReviewRoute(slug,opener.href);
    if(origin.section!=='works'&&!origin.release&&!origin.media)return opener;
    const matches=origin.format===selected.kind&&(!origin.query||[selected.title,selected.subtype,selected.date,...selected.tracks].join(' ').toLowerCase().includes(origin.query.trim().toLowerCase()));
    if(!origin.release&&!origin.media&&matches)return opener;
  }
  const href=solReviewHref(slug,{section:'works',format:selected.kind,sort:route.sort});
  return href?{href,focus:solReviewHref(slug,solWorkFields(selected)),parentEntry:false}:null;
}
