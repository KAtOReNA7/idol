'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className="atheart-letter"><div className="atheart-address">{title}</div><div className="atheart-fold"><div className="atheart-message"><span className="atheart-salutation">写给下一次重看</span>{intro}{actions}</div><div className="atheart-enclosure">{image}</div></div><div className="atheart-postscript">{facts}</div></div>,
overview: ({members,works,notes,library}) => <div className="atheart-correspondence"><div className="atheart-people"><span className="atheart-chapter">第一页 / 成员来信</span>{members}</div><div className="atheart-play-letter"><span className="atheart-chapter">第二页 / 作品</span>{works}</div><div className="atheart-personal-note">{library}</div><div className="atheart-reference"><span className="atheart-chapter">附页 / 来源与时期</span>{notes}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="atheart-person-letter"><div className="atheart-person-writing">{identity}{actions}</div><div className="atheart-person-enclosure">{portrait}</div><div className="atheart-person-summary">{summary}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
