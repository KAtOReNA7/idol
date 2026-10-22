import display from '@/data/runtime/member-careers/periods.json';
import type {Member} from './types';
import {memberCareerFacts as projectCareerFacts,type CareerPeriod} from '@/lib/idol/member-career-core';
export {careerSourceUrl} from '@/lib/idol/member-career-core';
export const memberCareerSources=display.sources;
// The generated event sets retain exact public labels, date precision and sources.
// Indexing also avoids scanning every group's periods for each displayed member.
const periodsByMember=new Map<string,CareerPeriod[]>();
for(const identity of display.periods){
 const details=display.eventSets[identity.eventSet];
 const period:CareerPeriod={periodId:identity.periodId,memberId:identity.memberId,groupId:identity.groupId,
  displayName:'',relationType:'display',startDate:null,startPrecision:null,endDate:null,endPrecision:null,
  startDateBasis:null,endDateBasis:null,sourceIds:details.sourceIds,events:details.events};
 const memberPeriods=periodsByMember.get(identity.memberId)??[];
 memberPeriods.push(period);periodsByMember.set(identity.memberId,memberPeriods);
}
export function memberCareerFacts(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>){
 return projectCareerFacts(member,periodsByMember.get(member.id)??[]);
}
