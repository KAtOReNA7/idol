'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="oy-scrapbook"><header className="oy-title">{title}</header><div className="oy-pasted-photo">{image}</div><div className="oy-handnote">{intro}{actions}</div><aside className="oy-corner-note">{facts}</aside></div>),
overview:({members,works,notes,library})=>(<div className="oy-pages"><aside className="oy-bookmark">{library}</aside><section className="oy-people"><p className="module-kicker">01 / 人物剪贴页</p>{members}</section><section className="oy-songs"><p className="module-kicker">02 / 作品收藏页</p>{works}</section><section className="oy-footnotes">{notes}</section></div>),
member:({portrait,identity,summary,actions})=>(<div className="oy-person-page"><div className="oy-name-tag">{identity}</div><div className="oy-portrait-note">{portrait}</div><div className="oy-person-record">{summary}{actions}</div></div>),
};
export default function OddyouthDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
