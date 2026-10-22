'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
hero: ({title,intro,image,actions,facts}) => <div className={`izone-exhibit${facts ? '' : ' has-no-facts'}`}><div className="izone-cover-title">{title}</div>{facts && <aside className="izone-spine"><span className="izone-index-label">DATES / 时间索引</span>{facts}</aside>}<div className="izone-exhibit-cover">{image}</div><div className="izone-curator-note">{intro}{actions}</div></div>,
overview: ({members,works,notes,library}) => <div className="izone-volume"><div className="izone-reels"><span className="izone-chapter">01 / 影像目录</span>{works}{library}</div><div className="izone-history"><span className="izone-chapter">02 / 时间资料</span>{notes}</div><div className="izone-people"><span className="izone-chapter">03 / 人物档案</span>{members}</div></div>,
member: ({portrait,identity,summary,actions}) => <div className="izone-person-exhibit"><div className="izone-person-label">{identity}</div><div className="izone-person-print">{portrait}</div><div className="izone-person-record">{summary}{actions}</div></div>
};

export default function Design({content}:{content:CandidateContent}) {
 return <CandidateArtistExperience content={content} composition={composition}/>;
}
