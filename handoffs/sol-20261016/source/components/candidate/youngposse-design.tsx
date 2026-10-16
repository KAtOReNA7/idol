'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="yp-frontpage"><header className="yp-banner">{title}</header><div className="yp-lead">{intro}{actions}</div><div className="yp-press-photo">{image}</div><aside className="yp-column"><p className="module-kicker">FIELD NOTES / 日期与出处</p>{facts}</aside></div>),
overview:({members,works,notes,library})=>(<div className="yp-newspaper"><section className="yp-headlines"><p className="module-kicker">ON THE RECORD / 本期作品</p>{works}</section><section className="yp-credits">{members}</section><aside className="yp-margins">{library}{notes}</aside></div>),
member:({portrait,identity,summary,actions})=>(<div className="yp-profile"><div className="yp-profile-head">{identity}</div><div className="yp-profile-portrait">{portrait}</div><div className="yp-profile-caption">{summary}{actions}</div></div>),
};
export default function YoungposseDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
