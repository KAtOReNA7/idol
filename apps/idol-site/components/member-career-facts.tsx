import {publicMemberProfile} from '@/lib/idol/member-public-profile';
import type {Member} from '@/lib/idol/types';
import {careerSourceUrl,memberCareerFacts,memberCareerSources} from '@/lib/idol/member-career-runtime';
import './member-career-facts.css';
export function MemberCareerFacts({member}:{member:Pick<Member,'id'|'groupIds'|'formerGroupIds'|'profile'|'officialUrl'>}){
 const profile=publicMemberProfile(member);
 const facts=memberCareerFacts(member),official=careerSourceUrl(member.officialUrl),ids=new Set(facts.flatMap(f=>f.sourceIds));
 const sources=memberCareerSources.filter(s=>ids.has(s.sourceId)&&careerSourceUrl(s.url)&&careerSourceUrl(s.url)!==official);
 if(!profile&&!official&&!facts.length)return null;
 return <section className="member-career-facts" aria-label="成员介绍与经历">
 {profile&&<p className="member-career-intro">{profile}</p>}
 {official&&<a className="member-career-official" href={official} target="_blank" rel="noopener noreferrer">相关官方页面 ↗</a>}
 {!!facts.length&&<><h2>演艺经历</h2><ul>{facts.map(f=><li key={f.id}>{f.date&&<time dateTime={f.date}>{f.date}</time>}<span>{f.label}</span></li>)}</ul>{!!sources.length&&<details><summary>资料来源</summary><ul>{sources.map(s=><li key={s.sourceId}><a href={careerSourceUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.publisher} · {s.title}</a></li>)}</ul></details>}</>}
 </section>;
}
