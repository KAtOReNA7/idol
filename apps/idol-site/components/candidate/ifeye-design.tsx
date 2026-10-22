'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className="ifeye-viewfinder"><div className="ifeye-opening">{title}</div><div className="ifeye-lens">{image}<span className="ifeye-focus" aria-hidden="true">＋</span></div><div className="ifeye-reflection">{intro}{actions}</div><aside className="ifeye-dateline">{facts}</aside></section>),
 overview:({members,works,notes,library})=>(<div className="ifeye-diary"><section className="ifeye-day-entry"><p className="ifeye-caption">作品日记 · 今日想看</p>{library}{works}</section><section className="ifeye-people-entry"><p className="ifeye-caption">02 / 目光停留</p>{members}</section><aside className="ifeye-footnotes">{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="ifeye-person-lens"><div className="ifeye-person-circle">{portrait}</div><div className="ifeye-person-intro">{identity}{actions}</div><div className="ifeye-person-measure">{summary}</div></section>),
};
export default function IfeyeDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
