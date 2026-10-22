'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="cs-sleeve"><div className="cs-shop-sign">{title}{intro}{actions}</div><div className="cs-window">{image}</div><aside className="cs-receipt"><p className="module-kicker">THE LINER / 发行与档案</p>{facts}</aside></div>),
overview:({members,works,notes,library})=>(<div className="cs-record-shop"><section className="cs-records"><p className="module-kicker">A-SIDE / 作品唱片架</p>{works}</section><aside className="cs-bookmarks">{library}</aside><section className="cs-artists"><p className="module-kicker">B-SIDE / 人物目录</p>{members}</section><section className="cs-shop-notes">{notes}</section></div>),
member:({portrait,identity,summary,actions})=>(<div className="cs-person-sleeve"><div className="cs-person-label">{identity}</div><div className="cs-person-cover">{portrait}</div><div className="cs-person-insert">{summary}{actions}</div></div>),
};
export default function CandyshopDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
