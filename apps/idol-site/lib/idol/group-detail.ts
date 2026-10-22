import {memberBelongsInArchive} from './member-affiliation';
import type {Catalog,Group,Work} from './types';
import {inQueue} from './queues';
import {stageHasValidBinding,stageSourceKey} from './stage-source';
const validScore=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10;
export function groupCollection(data:Pick<Catalog,'works'|'members'>,group:Group){
 const byWork=new Map<string,Work[]>();
 for(const work of data.works.filter(w=>!w.placeholder&&w.groupIds.includes(group.id))){const rows=byWork.get(work.id)??[];rows.push(work);byWork.set(work.id,rows);}
 // Duplicate works count once. Null is missing; conflicting valid scores stay
 // unresolved per dimension, without discarding an agreed score in the other.
 const oneScore=(rows:Work[],key:'score'|'stageScore')=>{const values=[...new Set(rows.map(w=>w[key]).filter(validScore))];return values.length===1?values[0]:null;};
 // Never attach a score from another video/clip to the retained duplicate row.
 const sameStageSource=(rows:Work[])=>{const key=stageSourceKey(rows[0].stage);return !!key&&rows.every(w=>stageHasValidBinding(w.stage)&&stageSourceKey(w.stage)===key);};
 const works=[...byWork.values()].map(rows=>rows.length===1?rows[0]:({...rows[rows.length-1],score:oneScore(rows,'score'),stageScore:sameStageSource(rows)?oneScore(rows,'stageScore'):null}));
 const members=[...new Map(data.members.filter(m=>memberBelongsInArchive(m,group.id)).map(m=>[m.id,m])).values()];
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
