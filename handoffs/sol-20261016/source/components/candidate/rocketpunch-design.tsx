'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="rocket-ticket"><div className="rocket-ticket-head">{title}{intro}<p className="rocket-reading-note">先选一支作品，再把人物与历史日期分别收进票根。</p></div><aside className="rocket-ticket-stub"><span className="rocket-stub-label">ARCHIVE / 票根</span>{facts}</aside><div className="rocket-ticket-picture">{image}</div><div className="rocket-ticket-gate">{actions}<span aria-hidden="true">KEEP THIS REPLAY</span></div></div>,
overview: ({members,works,notes,library}) => <div className="rocket-itinerary"><div className="rocket-passengers"><span className="rocket-stop">01 / 成员档案</span>{members}</div><div className="rocket-departures"><span className="rocket-stop">02 / 作品目录</span>{works}{library}</div><div className="rocket-travel-record"><span className="rocket-stop">03 / 历史记录</span>{notes}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="rocket-person-pass"><div className="rocket-person-header">{identity}</div><div className="rocket-person-portrait">{portrait}</div><div className="rocket-person-stub">{summary}{actions}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
