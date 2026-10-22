'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="vu-fold"><div className="vu-wordmark">{title}</div><div className="vu-intro">{intro}</div><div className="vu-image">{image}</div><aside className="vu-margin">{facts}{actions}</aside><span className="vu-arrow" aria-hidden="true">↗</span></div>),
overview:({members,works,notes,library})=>(<div className="vu-progress"><section className="vu-members"><p className="module-kicker">01 / 人物与足迹</p>{members}</section><section className="vu-library">{library}</section><section className="vu-works"><p className="module-kicker">02 / 向前播放</p>{works}</section><aside className="vu-notes">{notes}</aside></div>),
member:({portrait,identity,summary,actions})=>(<div className="vu-portrait"><div className="vu-portrait-image">{portrait}</div><div className="vu-portrait-title">{identity}</div><div className="vu-portrait-record">{summary}{actions}</div></div>),
};
export default function VvupDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
