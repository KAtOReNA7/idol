'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="udtt-classboard"><div className="udtt-class-title">{title}{intro}{actions}</div><div className="udtt-timetable"><p className="udtt-stamp">AFTER CLASS / PLAY LIST</p>{facts}</div><div className="udtt-class-photo">{image}</div></div>),
  overview:({members,works,notes,library})=>(<div className="udtt-noticeboard"><div className="udtt-register"><p className="udtt-reading-label">第一节 / 成员点名</p>{members}</div><div className="udtt-listening-desk"><p className="udtt-reading-label">第二节 / 课后放映</p>{works}</div><aside className="udtt-homework">{library}</aside><div className="udtt-bulletin"><p className="udtt-reading-label">公告栏 / 资料说明</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="udtt-student-card"><div className="udtt-student-copy">{identity}{actions}</div><div className="udtt-student-photo">{portrait}</div><div className="udtt-student-summary">{summary}</div></div>),
};

export default function UdttCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
