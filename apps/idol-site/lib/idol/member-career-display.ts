import metadata from '@/data/member-careers/periods.json';
import type {Member} from './types';
import {memberCareerFacts as projectCareerFacts,type CareerPeriod} from '@/lib/idol/member-career-core';
export {careerSourceUrl,careerDate,careerPeriodEvents} from '@/lib/idol/member-career-core';
export type {CareerEvent,CareerPeriod} from '@/lib/idol/member-career-core';
// Complete evidence remains available to authenticated exports and audit tests.
export const memberCareerMetadata=metadata;
export function memberCareerFacts(member:Pick<Member,'id'|'groupIds'|'formerGroupIds'>,periods:CareerPeriod[]=metadata.periods){return projectCareerFacts(member,periods);}
