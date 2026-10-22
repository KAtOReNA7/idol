'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className="rescene-title-sequence"><div className="rescene-prologue">{intro}</div><div className="rescene-screen">{image}<span className="rescene-frame-mark" aria-hidden="true">FRAME / 01</span></div><div className="rescene-film-title">{title}{actions}</div><aside className="rescene-source-caption">{facts}</aside></section>),
 overview:({members,works,notes,library})=>(<div className="rescene-screening-room"><section className="rescene-now-showing"><p className="rescene-chapter">I. 放映目录 · 从作品开始</p>{works}</section><aside className="rescene-ticket-counter">{library}</aside><section className="rescene-cast-book"><p className="rescene-chapter">II. 人物画册</p>{members}</section><aside className="rescene-endnotes">{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="rescene-person-spread"><header>{identity}</header><div className="rescene-portrait-frame">{portrait}</div><div className="rescene-person-caption">{summary}{actions}</div></section>),
};
export default function ResceneDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
