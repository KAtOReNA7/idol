import type {Catalog,Group,Work} from './types';
import {inQueue} from './queues';
const validScore=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10;
export function groupCollection(data:Pick<Catalog,'works'|'members'>,group:Group){
 const works=[...new Map(data.works.filter(w=>!w.placeholder&&w.groupIds.includes(group.id)).map(w=>[w.id,w])).values()];
 const members=[...new Map(data.members.filter(m=>m.groupIds.includes(group.id)).map(m=>[m.id,m])).values()];
 const average=(key:'score'|'stageScore')=>{const values=works.map(w=>w[key]).filter(validScore);return {mean:values.length?values.reduce((sum,n)=>sum+n,0)/values.length:null,count:values.length};};
 return {works,members,portraits:members.filter(m=>m.photo&&m.status!=='已离团').slice(0,3),mv:average('score'),stage:average('stageScore'),watched:works.filter(w=>w.watched==='已观看').length,pending:works.filter(w=>inQueue(w,'tonight',[])),rewatch:works.filter(w=>inQueue(w,'rewatch',[]))};
}
export function groupWorkMatches(w:Work,queue:string,search:string){return inQueue(w,queue,[])&&`${w.song} ${w.name} ${w.version} ${w.videoType} ${w.officialTitle}`.toLowerCase().includes(search.trim().toLowerCase());}
export function groupActivity(status:string|undefined){
 if(!status)return '';
 if(status.startsWith('活动中'))return '活动中';
 if(status==='团体官方活动已结束'||status==='已结束团体官方活动'||status.startsWith('限定组合已结束活动')||status.startsWith('已结束正式团体活动'))return '已结束团体活动';
 if(status==='已更名为GIRLSET继续活动')return '以 GIRLSET 继续活动';
 if(status.startsWith('团体活动停顿'))return '团体活动暂停';
 return '近期活动情况暂无更新';
}
export function safeGroupLink(value:string|undefined){try{const url=new URL(value??'');return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
