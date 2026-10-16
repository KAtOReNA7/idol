'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="loona-orbit"><div className="loona-orbit-title">{title}</div><div className="loona-lunar-frame">{image}</div><div className="loona-orbit-copy">{actions}{intro}</div><div className="loona-phase-record">{facts}</div></div>,
overview: ({members,works,notes,library}) => <div className="loona-ledger"><div className="loona-chronology"><span className="loona-section-marker">01 / 历史坐标</span>{notes}</div><div className="loona-person-index"><span className="loona-section-marker">02 / 人物索引</span>{members}</div><div className="loona-film-index"><span className="loona-section-marker">03 / 放映记录</span>{works}{library}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="loona-person-orbit"><div className="loona-person-name">{identity}</div><div className="loona-person-phase">{portrait}</div><div className="loona-person-coordinates">{summary}{actions}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
