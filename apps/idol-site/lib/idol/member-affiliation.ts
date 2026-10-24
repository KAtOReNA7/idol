import type {Member} from './types';
// Explicit archive-page rollout. Current group IDs and source records stay intact.
const ARCHIVE_GROUPS=new Set(['recvxyEBDZ52oG','recvxyEBDZm40w','recvxyEBDZllCe']);
export function includesArchiveMembers(groupId:string){return ARCHIVE_GROUPS.has(groupId);}
export function memberBelongsInArchive(member:Pick<Member,'groupIds'|'formerGroupIds'>,groupId:string){return member.groupIds.includes(groupId)||(includesArchiveMembers(groupId)&&(member.formerGroupIds??[]).includes(groupId));}
export function memberAffiliationLabel(member:Pick<Member,'groupIds'|'formerGroupIds'|'status'>,groupId:string){return !member.groupIds.includes(groupId)&&(member.formerGroupIds??[]).includes(groupId)?'历史成员 · 曾属本团':member.status?'档案标记：'+member.status:'成员档案';}

// Read-only historical roster rollout; never changes relation records or index counts.
const HISTORY_ROSTERS:Record<string,string>={
 'recvxyEBDZB3pz':'/artists/rocketpunch',
 'recvxyEBDZcosR':'/artists/fromis9',
 'recvxyEBDZqkpg':'/artists/idle',
 'recvxyEBDZ9qVl':'/artists/newjeans',
 'recvxyEBDZJAXm':'/artists/loona',
 'recvxyEBDZ9Jl3':'/artists/everglow',
 'recvxyEBDZ8A0W':'/artists/kep1er',
};
export function supportsHistoricalRoster(groupId:string){return Object.hasOwn(HISTORY_ROSTERS,groupId);}
export function historicalRosterPath(path:string){return Object.values(HISTORY_ROSTERS).includes(path);}
export function relatedHistoricalMember(member:Pick<Member,'groupIds'|'formerGroupIds'>,groupId:string){return member.groupIds.includes(groupId)||(member.formerGroupIds??[]).includes(groupId);}
export function historicalRosterMembers(members:Member[],groupId:string,history:boolean){return [...new Map(members.filter(m=>m.groupIds.includes(groupId)||(history&&supportsHistoricalRoster(groupId)&&(m.formerGroupIds??[]).includes(groupId))).map(m=>[m.id,m])).values()];}
