'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="hitgs-zine"><div className="hitgs-masthead">{title}<span className="hitgs-issue" aria-hidden="true">放映<br/>再一遍</span></div><div className="hitgs-callout">{actions}{intro}</div><div className="hitgs-poster">{image}</div><div className="hitgs-fact-strip">{facts}</div></div>,
overview: ({members,works,notes,library}) => <div className="hitgs-pages"><div className="hitgs-play-page"><p className="hitgs-stamp">01 / 先听作品</p>{works}{library}</div><div className="hitgs-people-page"><p className="hitgs-stamp">02 / 认识成员</p>{members}</div><div className="hitgs-footnotes"><p className="hitgs-stamp">03 / 出处与日期</p>{notes}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="hitgs-person"><div className="hitgs-person-title">{identity}{actions}</div><div className="hitgs-person-photo">{portrait}</div><div className="hitgs-person-tallies">{summary}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
