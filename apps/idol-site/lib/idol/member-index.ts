import {publicGroupNames} from './public-group-names';
import type {Group,Member} from './types';
import type {BrowseFilters} from './journey';
import {memberChineseName} from './member-display-name';
import {indexNameFields,matchesNameFields,nameSearchQuery} from './name-search';

export function indexMemberNames(members:Member[],groups:Group[]){
 const groupMap=new Map(groups.map(group=>[group.id,group]));
 return members.map(member=>{
  const linked=member.groupIds.flatMap(id=>groupMap.get(id)??[]);
  // The Chinese display name is already reviewed by memberChineseName. Index
  // it and the stage name separately; do not invent aliases or search notes.
  return {member,groups:linked,fields:indexNameFields([member.name,member.cnName,memberChineseName(member),member.stageName,...linked.flatMap(publicGroupNames)])};
 });
}
export function matchingMembers(index:ReturnType<typeof indexMemberNames>,filters:BrowseFilters):Member[]{
 const query=nameSearchQuery(filters.search);
 return index.filter(({member,groups,fields})=>(filters.group==='all'||member.groupIds.includes(filters.group))
  &&(filters.generation==='all'||groups.some(group=>group.generation===filters.generation))
  &&matchesNameFields(fields,query)).map(row=>row.member);
}
