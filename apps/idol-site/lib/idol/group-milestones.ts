import observations from '@/data/group-milestones.json';
import type {Catalog,GroupMilestone} from './types';
export const groupMilestoneMetadata=observations;
export function withGroupMilestones(catalog:Catalog):Catalog{
 return {...catalog,groups:catalog.groups.map(group=>({...group,milestones:observations.filter(o=>o.groupId===group.id).map(o=>({id:o.id,kind:o.kind as GroupMilestone['kind'],title:o.title,valueLabel:o.valueLabel,scope:o.scope,date:o.date,sourceTitle:o.sourceTitle,sourceUrl:o.sourceUrl}))}))};
}
