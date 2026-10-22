import {memberBelongsInArchive,supportsHistoricalRoster,relatedHistoricalMember} from './member-affiliation';
import {candidateArtistCatalog} from './candidate/registry';
import type {Catalog} from './types';
import {AppError} from './feishu';
import {BABYMONSTER_GROUP_ID,ILLIT_GROUP_ID,XG_GROUP_ID,AESPA_GROUP_ID,IVE_GROUP_ID,KIOF_GROUP_ID,STAYC_GROUP_ID,NMIXX_GROUP_ID,HEARTS2HEARTS_GROUP_ID,KIIIKIII_GROUP_ID,ITZY_GROUP_ID,LESSERAFIM_GROUP_ID,SAYMYNAME_GROUP_ID,KATSEYE_GROUP_ID} from './artist-navigation';

// Public artist slugs only. This is an authenticated response projection, not a
// separate source or a cache. The existing owner/source/generation fences run first.
const RELEASED_ARTISTS:Record<string,string>={...candidateArtistCatalog,saymyname:SAYMYNAME_GROUP_ID,katseye:KATSEYE_GROUP_ID,itzy:ITZY_GROUP_ID,lesserafim:LESSERAFIM_GROUP_ID,kiiikiii:KIIIKIII_GROUP_ID,hearts2hearts:HEARTS2HEARTS_GROUP_ID,nmixx:NMIXX_GROUP_ID,babymonster:BABYMONSTER_GROUP_ID,illit:ILLIT_GROUP_ID,xg:XG_GROUP_ID,aespa:AESPA_GROUP_ID,ive:IVE_GROUP_ID,kissoflife:KIOF_GROUP_ID,stayc:STAYC_GROUP_ID};
export function requestedArtist(params:URLSearchParams):string|null{
 if(!params.has('artist'))return null;
 const values=params.getAll('artist'),id=values.length===1&&Object.hasOwn(RELEASED_ARTISTS,values[0])?RELEASED_ARTISTS[values[0]]:undefined;
 if(!id)throw new AppError('INVALID_ARTIST','这个团体页面暂时无法打开。',400);
 return id;
}
export function projectArtistCatalog(data:Catalog,groupId:string):Catalog{
 if(!data.groups.some(g=>g.id===groupId))throw new AppError('NOT_FOUND','暂未找到这个团体。',404);
 const rosterIds=new Set(data.members.filter(m=>supportsHistoricalRoster(groupId)?relatedHistoricalMember(m,groupId):memberBelongsInArchive(m,groupId)).map(m=>m.id));
 const groupWorkIds=new Set(data.works.filter(w=>w.groupIds.includes(groupId)).map(w=>w.id));
 // Keep every relation for roster members, including solo/collaboration/previous
 // group works. Never cut a member's personal averages to this group's works.
 const ratings=data.ratings.filter(r=>r.memberIds.some(id=>rosterIds.has(id))||r.workIds.some(id=>groupWorkIds.has(id)));
 const workIds=new Set([...groupWorkIds,...ratings.flatMap(r=>r.workIds)]);
 const works=data.works.filter(w=>workIds.has(w.id)).map(work=>{
  if(!work.versionDisplay)return work;
  const links=work.versionDisplay.links.filter(link=>workIds.has(link.workId));
  if(links.length===work.versionDisplay.links.length)return work;
  const next={...work};delete next.versionDisplay;
  return work.versionDisplay.tags.length||links.length?{...next,versionDisplay:{tags:work.versionDisplay.tags,links}}:next;
 });
 const memberIds=new Set([...rosterIds,...ratings.flatMap(r=>r.memberIds)]);
 const members=data.members.filter(m=>memberIds.has(m.id));
 const groupIds=new Set([groupId,...members.flatMap(m=>m.groupIds),...works.flatMap(w=>w.groupIds)]);
 const groups=data.groups.filter(g=>groupIds.has(g.id));
 const rated=works.filter(w=>w.score!==null);
 return {...data,scope:{type:'artist',groupId},groups,members,works,ratings,counts:{groups:groups.length,members:members.length,works:works.length,ratings:ratings.filter(r=>r.memberIds.length>0&&r.workIds.length>0).length,ratedWorks:rated.length,scoreSum:rated.reduce((n,w)=>n+w.score!,0)}};
}
