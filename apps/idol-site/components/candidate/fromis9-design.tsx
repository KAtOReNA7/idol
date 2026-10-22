'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="fromis-postcard"><div className="fromis-postcard-image">{image}<span className="fromis-postmark" aria-hidden="true">重看<br/>邮局</span></div><div className="fromis-postcard-writing">{title}{intro}{actions}</div><div className="fromis-stamps">{facts}</div></div>,
overview: ({members,works,notes,library}) => <div className="fromis-album"><div className="fromis-address-book">{members}</div><div className="fromis-replay-list"><p className="fromis-section-label">寄给下一次重看</p>{works}{library}</div><div className="fromis-postscript"><p className="fromis-section-label">附笺 / 来源与时期</p>{notes}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="fromis-member-postcard"><div className="fromis-member-stamp">{portrait}</div><div className="fromis-member-address">{identity}{actions}</div><div className="fromis-member-history">{summary}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
