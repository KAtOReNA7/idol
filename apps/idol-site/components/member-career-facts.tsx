import {publicMemberProfile} from '@/lib/idol/member-public-profile';
import type {CatalogView,Member} from '@/lib/idol/types';
import {careerSourceUrl,memberCareerFacts,memberCareerSources} from '@/lib/idol/member-career-runtime';
import './member-career-facts.css';
export type MemberCareerPart='all'|'intro'|'history'|'sources';
export function MemberCareerFacts({member,part='all'}:{member:Pick<Member,'id'|'groupIds'|'formerGroupIds'|'profile'|'officialUrl'>;part?:MemberCareerPart}){
 const profile=publicMemberProfile(member);
 const facts=memberCareerFacts(member),official=careerSourceUrl(member.officialUrl),ids=new Set(facts.flatMap(f=>f.sourceIds));
 const sources=memberCareerSources.filter(s=>ids.has(s.sourceId)&&careerSourceUrl(s.url)&&careerSourceUrl(s.url)!==official);
 const intro=part==='all'||part==='intro',history=part==='all'||part==='history',showSources=part==='all'||part==='sources';
 if(!(intro&&(profile||official)||history&&facts.length||showSources&&facts.length&&sources.length))return null;
 return <section className="member-career-facts" aria-label={part==='all'?'成员介绍与经历':part==='intro'?'成员介绍':part==='history'?'演艺经历':'资料来源'} data-member-module={part==='history'?'career':part==='sources'?'sources':undefined}>
 {intro&&profile&&<p className="member-career-intro">{profile}</p>}
 {intro&&official&&<a className="member-career-official" href={official} target="_blank" rel="noopener noreferrer">相关官方页面 ↗</a>}
 {history&&!!facts.length&&<><h2>演艺经历</h2><ul>{facts.map(f=><li key={f.id}>{f.date&&<time dateTime={f.date}>{f.date}</time>}<span>{f.label}</span></li>)}</ul></>}
 {showSources&&!!facts.length&&!!sources.length&&<details><summary>资料来源</summary><ul>{sources.map(s=><li key={s.sourceId}><a href={careerSourceUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.publisher} · {s.title}</a></li>)}</ul></details>}
 </section>;
}

// Editorial portraits and public participant lists do not create DB membership.
// Resolve the existing, uniquely bound current/former record before using career facts.
export function ScopedMemberCareerFacts({data,memberId,groupId,part}:{data:CatalogView|null|undefined;memberId:string;groupId:string;part:MemberCareerPart}){
 if(!data)return null;
 const matches=data.members.filter(member=>member.id===memberId&&(member.groupIds.includes(groupId)||(member.formerGroupIds??[]).includes(groupId)));
 if(matches.length!==1)return null;
 return <MemberCareerFacts member={matches[0]} part={part}/>;
}
