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
const bases=[KIOF_PATH,IVE_PATH,BABYMONSTER_PATH,ILLIT_PATH,XG_PATH,AESPA_PATH,'/preview/babymonster'];
export function safeArtistReturn(value:string|null|undefined):string|null{
 if(!value||value.length>4096)return null;
 try{const u=new URL(value,'https://site.invalid');if(u.origin!=='https://site.invalid'||!bases.includes(u.pathname)||u.hash)return null;
 for(const key of u.searchParams.keys())if(!['section','member','queue','q','format'].includes(key)||u.searchParams.getAll(key).length!==1)return null;
 if(u.searchParams.has('format')&&(![IVE_PATH,KIOF_PATH].includes(u.pathname)||!['mv','stage'].includes(u.searchParams.get('format')!)))return null;
 const section=u.searchParams.get('section'),member=u.searchParams.get('member'),queue=u.searchParams.get('queue');
 if(section&&!['overview','works','members','updates','records'].includes(section)||member&&!/^rec[A-Za-z0-9]+$/.test(member)||queue&&!['all','tonight','rewatch','unrated'].includes(queue)||(u.searchParams.get('q')?.length??0)>200)return null;
 const clean=new URLSearchParams();for(const key of ['section','member','queue','q','format'])if(u.searchParams.has(key))clean.set(key,u.searchParams.get(key)!);return u.pathname+(clean.size?'?'+clean:'');
 }catch{return null;}
}
export function groupArtistUrl(id:string){return id===KIOF_GROUP_ID?KIOF_PATH:id===BABYMONSTER_GROUP_ID?BABYMONSTER_PATH:id===ILLIT_GROUP_ID?ILLIT_PATH:id===XG_GROUP_ID?XG_PATH:id===AESPA_GROUP_ID?AESPA_PATH:id===IVE_GROUP_ID?IVE_PATH:null;}
export function memberArtistUrl(member:{id:string;groupIds:string[]}){const path=member.groupIds.map(groupArtistUrl).find(Boolean);return path?path+'?section=members&member='+encodeURIComponent(member.id):null;}

export function artistReturnLabel(value:string|null|undefined){const safe=safeArtistReturn(value);return safe?.startsWith(KIOF_PATH)?'KISS OF LIFE':safe?.startsWith(IVE_PATH)?'IVE':safe?.startsWith(ILLIT_PATH)?'ILLIT':safe?.startsWith(XG_PATH)?'XG':safe?.startsWith(AESPA_PATH)?'aespa':safe?'BABYMONSTER':null;}
