import {publicArtistKeysForPath,validPublicArtistRoute} from './public-artist-route-keys';
import katseyeRouteKeys from '../../data/katseye-navigation-keys.json';
import billlieRouteKeys from '../../data/billlie-navigation-keys.json';
const vvupReleaseKeys=['vvon','house-party','giddy-boy','4-life','aint-nobody','locked-on','doo-doom-chit'];
const saymynameReleaseKeys=["your-scent","sweet-sour","our-vibe","out-the-door","ily","love-romantic","shalala-japanese","my-name-is","say-my-name"];
const kiiikiiiRouteKeys={"release":["whykiiikiii","delulu-pack","to-me-from-me","dancing-alone","uncut-gem","i-do-me"]};
import hearts2heartsRouteKeys from '../../data/hearts2hearts-navigation-keys.json';
import idleRouteKeys from '../../data/idle-navigation-keys.json';
import izoneRouteKeys from '../../data/izone-navigation-keys.json';
import weeeklyRouteKeys from '../../data/weeekly-navigation-keys.json';
import cherrybulletRouteKeys from '../../data/cherrybullet-navigation-keys.json';
import rocketpunchRouteKeys from '../../data/rocketpunch-navigation-keys.json';
import everglowRouteKeys from '../../data/everglow-navigation-keys.json';
import fromis9RouteKeys from '../../data/fromis9-navigation-keys.json';
import iveRouteKeys from '../../data/ive-navigation-keys.json';
import badvillainRouteKeys from '../../data/badvillain-navigation-keys.json';
import triplesRouteKeys from '../../data/triples-navigation-keys.json';
import registry51 from '../../data/artist-timeline-registry.json';
import {readTimelineFilters} from './timeline/route';
import {historicalRosterPath} from './member-affiliation';
import {candidateArtistPaths,candidateArtistPath,candidateArtistLabel} from './candidate/registry';
const newjeansRouteKeys={"releases":[{"id":"newjeans-release-supernatural"},{"id":"newjeans-release-how-sweet"},{"id":"newjeans-release-njwmx"},{"id":"newjeans-release-get-up"},{"id":"newjeans-release-zero"},{"id":"newjeans-release-omg"},{"id":"newjeans-release-new-jeans"}],"media":[{"id":"newjeans-stage-super-shy-inkigayo-20230806"}]};
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
 for(const key of u.searchParams.keys())if(!['section','member','queue','q','format','roster','reader','release','media','timelineType','timelineImportance','timelineOrder','unit','participant','sort','rosterView','year','event'].includes(key)||u.searchParams.getAll(key).length!==1)return null;
 if(u.pathname==='/artists/billlie'&&u.searchParams.get('format')==='release'&&value.includes('#'))return null;
 if(!validPublicArtistRoute(value,u))return null;
 const publicKeys=publicArtistKeysForPath(u.pathname);
 if(['timelineType','timelineImportance','timelineOrder'].some(key=>u.searchParams.has(key))&&!readTimelineFilters(u.pathname+u.search,registry51.map(group=>group.path)).ok)return null;
 const designCatalog=u.pathname==='/artists/weeekly'?weeeklyRouteKeys:u.pathname==='/artists/cherrybullet'?cherrybulletRouteKeys:u.pathname==='/artists/rocketpunch'?rocketpunchRouteKeys:u.pathname==='/artists/everglow'?everglowRouteKeys:u.pathname==='/artists/fromis9'?fromis9RouteKeys:u.pathname==='/artists/izone'?izoneRouteKeys:u.pathname==='/artists/billlie'?billlieRouteKeys:u.pathname==='/artists/idle'?idleRouteKeys:u.pathname==='/artists/ive'?iveRouteKeys:u.pathname==='/artists/badvillain'?badvillainRouteKeys:u.pathname==='/artists/newjeans'?newjeansRouteKeys:null;
 if(u.searchParams.has('release')&&!(u.pathname==='/artists/vvup'?vvupReleaseKeys.includes(u.searchParams.get('release')!):u.pathname===KATSEYE_PATH?(u.searchParams.get('section')==='records'&&!u.searchParams.has('member')&&!u.searchParams.has('format')&&katseyeRouteKeys.release.includes(u.searchParams.get('release')!)):u.pathname===SAYMYNAME_PATH?saymynameReleaseKeys.includes(u.searchParams.get('release')!):u.pathname===KIIIKIII_PATH?kiiikiiiRouteKeys.release.includes(u.searchParams.get('release')!):u.pathname===HEARTS2HEARTS_PATH?hearts2heartsRouteKeys.release.includes(u.searchParams.get('release')!):u.pathname==='/artists/triples'?triplesRouteKeys.releases.some(entry=>entry.key===u.searchParams.get('release')):publicKeys?publicKeys.releases.includes(u.searchParams.get('release')!):designCatalog?.releases.some(entry=>entry.id===u.searchParams.get('release'))))return null;
 if(u.searchParams.has('media')&&!(publicKeys?publicKeys.media.some(entry=>entry.key===u.searchParams.get('media')&&entry.kind===u.searchParams.get('format')):designCatalog?.media.some(entry=>entry.id===u.searchParams.get('media'))))return null;
 if(u.searchParams.has('media')&&u.searchParams.has('release'))return null;
 if(u.searchParams.has('reader')&&(u.pathname!=='/artists/triples'||!/^rec[A-Za-z0-9]+$/.test(u.searchParams.get('reader')!)))return null;
 if(u.searchParams.has('roster')&&((!historicalRosterPath(u.pathname)&&u.pathname!=='/artists/vvup')||u.searchParams.get('roster')!=='history'))return null;
 if(u.searchParams.has('format')&&(![...candidateArtistPaths,SAYMYNAME_PATH,KATSEYE_PATH,ITZY_PATH,LESSERAFIM_PATH,IVE_PATH,KIOF_PATH,STAYC_PATH,NMIXX_PATH,HEARTS2HEARTS_PATH,KIIIKIII_PATH].includes(u.pathname)||!(u.pathname==='/artists/billlie'?['mv','stage','release']:['mv','stage']).includes(u.searchParams.get('format')!)))return null;
 const section=u.searchParams.get('section'),member=u.searchParams.get('member'),queue=u.searchParams.get('queue');
 if(section&&!['overview','works','members','updates','records'].includes(section)||member&&!/^rec[A-Za-z0-9]+$/.test(member)||queue&&!['all','tonight','rewatch','unrated'].includes(queue)||(u.searchParams.get('q')?.length??0)>200)return null;
 // LOONA's historical reader restores exact same-entry query/scroll context.
 // Validation above remains identical; no additional keys or values are accepted.
 if(u.pathname==='/artists/loona')return u.pathname+(u.search||'');
 const clean=new URLSearchParams();for(const key of ['section','member','queue','q','format','roster','reader','release','media','timelineType','timelineImportance','timelineOrder','unit','participant','sort','rosterView','year','event'])if(u.searchParams.has(key))clean.set(key,u.searchParams.get(key)!);return u.pathname+(clean.size?'?'+clean:'');
 }catch{return null;}
}
export function groupArtistUrl(id:string){return id===SAYMYNAME_GROUP_ID?SAYMYNAME_PATH:id===KATSEYE_GROUP_ID?KATSEYE_PATH:id===ITZY_GROUP_ID?ITZY_PATH:id===LESSERAFIM_GROUP_ID?LESSERAFIM_PATH:id===KIIIKIII_GROUP_ID?KIIIKIII_PATH:id===HEARTS2HEARTS_GROUP_ID?HEARTS2HEARTS_PATH:id===NMIXX_GROUP_ID?NMIXX_PATH:id===STAYC_GROUP_ID?STAYC_PATH:id===KIOF_GROUP_ID?KIOF_PATH:id===BABYMONSTER_GROUP_ID?BABYMONSTER_PATH:id===ILLIT_GROUP_ID?ILLIT_PATH:id===XG_GROUP_ID?XG_PATH:id===AESPA_GROUP_ID?AESPA_PATH:id===IVE_GROUP_ID?IVE_PATH:candidateArtistPath(id);}
export function memberArtistUrl(member:{id:string;groupIds:string[]}){const path=member.groupIds.map(groupArtistUrl).find(Boolean);return path?path+'?section=members&member='+encodeURIComponent(member.id):null;}

export function artistReturnLabel(value:string|null|undefined){const safe=safeArtistReturn(value);return safe?.startsWith(SAYMYNAME_PATH)?'SAY MY NAME':safe?.startsWith(KATSEYE_PATH)?'KATSEYE':safe?.startsWith(ITZY_PATH)?'ITZY':safe?.startsWith(LESSERAFIM_PATH)?'LE SSERAFIM':safe?.startsWith(KIIIKIII_PATH)?'KiiiKiii':safe?.startsWith(HEARTS2HEARTS_PATH)?'Hearts2Hearts':safe?.startsWith(NMIXX_PATH)?'NMIXX':safe?.startsWith(STAYC_PATH)?'STAYC':safe?.startsWith(KIOF_PATH)?'KISS OF LIFE':safe?.startsWith(IVE_PATH)?'IVE':safe?.startsWith(ILLIT_PATH)?'ILLIT':safe?.startsWith(XG_PATH)?'XG':safe?.startsWith(AESPA_PATH)?'aespa':safe?(candidateArtistLabel(safe)??'BABYMONSTER'):null;}
