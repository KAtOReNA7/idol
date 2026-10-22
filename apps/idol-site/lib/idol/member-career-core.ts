import type {Member} from './types';
export type CareerEvent={date:string|null;precision:string|null;label:string};
export type CareerPeriod={periodId:string;memberId:string;groupId:string;displayName:string;relationType:string;startDate:string|null;startPrecision:string|null;endDate:string|null;endPrecision:string|null;startDateBasis:string|null;endDateBasis:string|null;sourceIds:string[];events:CareerEvent[]};
export function careerSourceUrl(value:string):string|null {try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function careerDate(value:string|null,precision:string|null):string|null {
 if(!value)return null;
 if(precision==='year'&&/^\d{4}$/.test(value))return value;
 if(precision==='month'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return value;
 if(precision==='day'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value)return value;
 return null;
}
const startLabels:Record<string,string>={public_debut:'公开出道',public_release:'作品发表',public_lineup_announcement:'公布出道阵容',official_membership_effective_date:'正式加入',dated_self_introduction:'新成员公开自我介绍',public_announcement:'新成员公开介绍'};
const endLabels:Record<string,string>={explicit_effective_date:'退出团体',explicit_effective_departure:'退出团体',explicit_month_boundary_before_eight_member_phase:'结束成员活动',explicit_member_activity_end:'结束成员活动'};
export function careerPeriodEvents(p:CareerPeriod):CareerEvent[]{
 if(p.relationType==='roster_listing')return [];
 const rows:CareerEvent[]=[];const start=careerDate(p.startDate,p.startPrecision),end=careerDate(p.endDate,p.endPrecision);
 if(start&&startLabels[p.startDateBasis??''])rows.push({date:start,precision:p.startPrecision,label:`${p.displayName}${p.relationType==='subunit_membership'?' 分队':''} · ${startLabels[p.startDateBasis!]}`});
 if(end){const label=p.endDateBasis==='explicit_group_activity_end'?(p.relationType==='project_membership'?'限定项目结束':'成员团体活动结束'):endLabels[p.endDateBasis??''];if(label)rows.push({date:end,precision:p.endPrecision,label:`${p.displayName} · ${label}`});}
 for(const e of p.events??[])if(e.label?.trim()&&(!e.date||careerDate(e.date,e.precision)))rows.push({...e});
 return rows;
}
export function memberCareerFacts(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,periods:CareerPeriod[]){
 const groups=new Set([...(member.groupIds??[]),...(member.formerGroupIds??[])]),seen=new Set<string>();
 return periods.filter(p=>p.memberId===member.id&&groups.has(p.groupId)).flatMap(p=>careerPeriodEvents(p).map((e,i)=>({...e,id:p.periodId+':'+i,periodId:p.periodId,sourceIds:p.sourceIds}))).filter(e=>{const key=[e.date,e.label].join('|');if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>(a.date??'9999').localeCompare(b.date??'9999')||a.id.localeCompare(b.id));
}
