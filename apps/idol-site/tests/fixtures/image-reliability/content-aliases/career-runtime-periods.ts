// Synthetic runtime projection only; actual runtime mapper and career core execute.
import type {CareerEvent} from '../../../../lib/idol/member-career-core';
export default {
 periods: [] as {periodId:string;memberId:string;groupId:string;eventSet:number}[],
 eventSets: [] as {sourceIds:string[];events:CareerEvent[]}[],
 sources: [] as {id:string;title:string;url:string}[],
};
