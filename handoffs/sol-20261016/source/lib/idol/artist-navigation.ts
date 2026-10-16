import {historicalRosterPath} from './member-affiliation';
import {candidateArtistPaths,candidateArtistPath,candidateArtistLabel} from './candidate/registry';
// Only released artist experiences can receive cross-page return navigation.
// This is navigation context only: no scores, notes, tokens or record payloads.
export const BABYMONSTER_GROUP_ID='rec28ldfRTiC1X';
export const BABYMONSTER_PATH='/artists/babymonster';
export const ILLIT_GROUP_ID='rec28ldfRTiBON';
export const ILLIT_PATH='/artists/illit';
export const XG_GROUP_ID='recvxDKdOtKdWD';
export const XG_PATH='/artists/xg';
export const AESPA_GROUP_ID='recvxyEBDZxfeD';
export const AESPA_PATH='/artists/aespa';
export const IVE_GROUP_ID='recvxyEBDZT8Xj';
export const IVE_PATH='/artists/ive';
export const KIOF_GROUP_ID='rec28ldfRTiCdf';
export const KIOF_PATH='/artists/kissoflife';
export const STAYC_GROUP_ID='recvxyEBDZ2V3c';
export const STAYC_PATH='/artists/stayc';
export const NMIXX_GROUP_ID='recvxyEBDZOpTf';
export const NMIXX_PATH='/artists/nmixx';
export const HEARTS2HEARTS_GROUP_ID='rec28ldfRTiBAq';
export const HEARTS2HEARTS_PATH='/artists/hearts2hearts';
export const KIIIKIII_GROUP_ID='rec28ldfRTiBUk';
export const KIIIKIII_PATH='/artists/kiiikiii';
export const ITZY_GROUP_ID='recvxyEBDZqxjD';
export const ITZY_PATH='/artists/itzy';
export const LESSERAFIM_GROUP_ID='recvxyEBDZvpPh';
export const LESSERAFIM_PATH='/artists/lesserafim';
export const SAYMYNAME_GROUP_ID='rec28ldfRTiChs';
export const SAYMYNAME_PATH='/artists/saymyname';
export const KATSEYE_GROUP_ID='rec28ldfRTiDUd';
export const KATSEYE_PATH='/artists/katseye';
const bases=[...candidateArtistPaths,SAYMYNAME_PATH,KATSEYE_PATH,ITZY_PATH,LESSERAFIM_PATH,KIIIKIII_PATH,HEARTS2HEARTS_PATH,NMIXX_PATH,STAYC_PATH,KIOF_PATH,IVE_PATH,BABYMONSTER_PATH,ILLIT_PATH,XG_PATH,AESPA_PATH,'/preview/babymonster'];
export function safeArtistReturn(value:string|null|undefined):string|null{
 if(!value||value.length>4096)return null;
 try{const u=new URL(value,'https://site.invalid');if(u.origin!=='https://site.invalid'||!bases.includes(u.pathname)||u.hash)return null;
 for(const key of u.searchParams.keys())if(!['section','member','queue','q','format','roster'].includes(key)||u.searchParams.getAll(key).length!==1)return null;
 if(u.searchParams.has('roster')&&(!historicalRosterPath(u.pathname)||u.searchParams.get('roster')!=='history'))return null;
 if(u.searchParams.has('format')&&(![...candidateArtistPaths,SAYMYNAME_PATH,KATSEYE_PATH,ITZY_PATH,LESSERAFIM_PATH,IVE_PATH,KIOF_PATH,STAYC_PATH,NMIXX_PATH,HEARTS2HEARTS_PATH,KIIIKIII_PATH].includes(u.pathname)||!['mv','stage'].includes(u.searchParams.get('format')!)))return null;
 const section=u.searchParams.get('section'),member=u.searchParams.get('member'),queue=u.searchParams.get('queue');
 if(section&&!['overview','works','members','updates','records'].includes(section)||member&&!/^rec[A-Za-z0-9]+$/.test(member)||queue&&!['all','tonight','rewatch','unrated'].includes(queue)||(u.searchParams.get('q')?.length??0)>200)return null;
 const clean=new URLSearchParams();for(const key of ['section','member','queue','q','format','roster'])if(u.searchParams.has(key))clean.set(key,u.searchParams.get(key)!);return u.pathname+(clean.size?'?'+clean:'');
 }catch{return null;}
}
export function groupArtistUrl(id:string){return id===SAYMYNAME_GROUP_ID?SAYMYNAME_PATH:id===KATSEYE_GROUP_ID?KATSEYE_PATH:id===ITZY_GROUP_ID?ITZY_PATH:id===LESSERAFIM_GROUP_ID?LESSERAFIM_PATH:id===KIIIKIII_GROUP_ID?KIIIKIII_PATH:id===HEARTS2HEARTS_GROUP_ID?HEARTS2HEARTS_PATH:id===NMIXX_GROUP_ID?NMIXX_PATH:id===STAYC_GROUP_ID?STAYC_PATH:id===KIOF_GROUP_ID?KIOF_PATH:id===BABYMONSTER_GROUP_ID?BABYMONSTER_PATH:id===ILLIT_GROUP_ID?ILLIT_PATH:id===XG_GROUP_ID?XG_PATH:id===AESPA_GROUP_ID?AESPA_PATH:id===IVE_GROUP_ID?IVE_PATH:candidateArtistPath(id);}
export function memberArtistUrl(member:{id:string;groupIds:string[]}){const path=member.groupIds.map(groupArtistUrl).find(Boolean);return path?path+'?section=members&member='+encodeURIComponent(member.id):null;}

export function artistReturnLabel(value:string|null|undefined){const safe=safeArtistReturn(value);return safe?.startsWith(SAYMYNAME_PATH)?'SAY MY NAME':safe?.startsWith(KATSEYE_PATH)?'KATSEYE':safe?.startsWith(ITZY_PATH)?'ITZY':safe?.startsWith(LESSERAFIM_PATH)?'LE SSERAFIM':safe?.startsWith(KIIIKIII_PATH)?'KiiiKiii':safe?.startsWith(HEARTS2HEARTS_PATH)?'Hearts2Hearts':safe?.startsWith(NMIXX_PATH)?'NMIXX':safe?.startsWith(STAYC_PATH)?'STAYC':safe?.startsWith(KIOF_PATH)?'KISS OF LIFE':safe?.startsWith(IVE_PATH)?'IVE':safe?.startsWith(ILLIT_PATH)?'ILLIT':safe?.startsWith(XG_PATH)?'XG':safe?.startsWith(AESPA_PATH)?'aespa':safe?(candidateArtistLabel(safe)??'BABYMONSTER'):null;}
