import verified from '@/data/member-physical/verified.json';
import type {Member} from '@/lib/idol/types';
import {memberPhysicalFacts,type MemberPhysicalRecord} from '@/lib/idol/member-physical';
import './member-physical-facts.css';
export function MemberPhysicalFacts({member,record}:{member:Pick<Member,'id'|'stageName'|'birthDate'>;record?:MemberPhysicalRecord}){
 const facts=memberPhysicalFacts(member,record??(verified as Record<string,MemberPhysicalRecord>)[member.id]);
 if(!facts.length)return null;
 return <section className="member-physical-facts" aria-label="公开身体资料"><h2>公开资料</h2><dl>{facts.map(f=><div key={f.key}><dt>{f.label}</dt><dd>{f.value} {f.unit}</dd><small className="member-physical-date">{f.publishedAt?`${f.publishedAt} 公开资料`:'来源公开资料'}</small><details><summary>来源说明</summary><a href={f.sourceUrl} title={f.sourceTitle} target="_blank" rel="noopener noreferrer">查看原始来源</a></details></div>)}</dl><p className="member-physical-note">数值采用来源发布时的资料。</p></section>;
}
