'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="vcha-archive-cover"><div className="vcha-archive-title">{title}{intro}</div><div className="vcha-volume-one"><span className="vcha-volume-label">VCHA / 原名档案</span>{image}{actions}</div><div className="vcha-volume-two"><p className="vcha-chapter-note">旧名作品与后来章节分开阅读；下列日期只适用于对应记录。</p><span className="vcha-volume-label">历史时间线 / 逐条日期</span>{facts}</div></div>),
  overview:({members,works,notes,library})=>(<div className="vcha-archive-shelves"><div className="vcha-archive-roster">{members}</div><div className="vcha-archive-records">{works}</div><aside className="vcha-reading-desk">{library}</aside><div className="vcha-source-ledger">{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="vcha-biography"><div className="vcha-biography-heading">{identity}</div><div className="vcha-biography-image">{portrait}</div><div className="vcha-biography-record">{summary}{actions}</div></div>),
};

export default function VchaCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
