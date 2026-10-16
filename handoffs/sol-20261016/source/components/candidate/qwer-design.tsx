'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="qw-score"><div className="qw-masthead">{title}{intro}</div><div className="qw-photograph">{image}</div><aside className="qw-liner"><p className="module-kicker">LINER NOTES / 乐队扉页</p>{facts}{actions}</aside></div>),
overview:({members,works,notes,library})=>(<div className="qw-pages"><section className="qw-music"><p className="module-kicker">01 / 先听这一页</p>{works}</section><aside className="qw-statistics">{library}</aside><section className="qw-ensemble"><p className="module-kicker">02 / 声音索引</p>{members}</section><section className="qw-sources">{notes}</section></div>),
member:({portrait,identity,summary,actions})=>(<div className="qw-solo"><div className="qw-solo-heading">{identity}</div><div className="qw-solo-photo">{portrait}</div><div className="qw-solo-notes">{summary}{actions}</div></div>),
};
export default function QwerDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
