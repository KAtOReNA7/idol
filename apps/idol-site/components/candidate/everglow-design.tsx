'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="everglow-cinema"><div className="everglow-marquee">{title}</div><div className="everglow-screen">{image}<div className="everglow-screen-actions">{actions}</div></div><aside className="everglow-programme"><span className="everglow-programme-label">放映单 / 历史归档</span>{intro}{facts}</aside></div>,
overview: ({members,works,notes,library}) => <div className="everglow-programme-pages"><div className="everglow-feature-film">{works}{library}</div><div className="everglow-cast-seats"><p className="everglow-cast-label">人物席 / 已有档案</p>{members}</div><div className="everglow-programme-notes"><p className="everglow-cast-label">片尾 / 来源与日期</p>{notes}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="everglow-person-screen"><div className="everglow-person-banner">{portrait}</div><div className="everglow-person-credit">{identity}{actions}</div><div className="everglow-person-replay">{summary}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
