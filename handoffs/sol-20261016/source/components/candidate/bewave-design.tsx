'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="bw-horizon"><header className="bw-title">{title}</header><div className="bw-photo">{image}</div><div className="bw-description">{intro}{actions}</div><div className="bw-timeline">{facts}</div></div>),
overview:({members,works,notes,library})=>(<div className="bw-archive"><section className="bw-memory"><p className="module-kicker">01 / 历史记录与出处</p>{notes}</section><section className="bw-people"><p className="module-kicker">02 / 人物相册</p>{members}</section><section className="bw-listening"><p className="module-kicker">03 / 再听一遍</p>{works}</section><aside className="bw-bookmarks">{library}</aside></div>),
member:({portrait,identity,summary,actions})=>(<div className="bw-person"><div className="bw-person-photo">{portrait}</div><div className="bw-person-heading">{identity}</div><div className="bw-person-memories">{summary}{actions}</div></div>),
};
export default function BewaveDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
