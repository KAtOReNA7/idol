'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="tracer-signal-board"><div className="tracer-channel"><p className="tracer-marker">SIGNAL / OPEN</p>{title}{intro}{actions}</div><div className="tracer-monitor">{image}<span aria-hidden="true" className="tracer-coordinate">TRACER · VISUAL INDEX</span></div><div className="tracer-signal-data">{facts}</div></div>),
  overview:({members,works,notes,library})=>(<div className="tracer-index"><div className="tracer-people"><p className="tracer-reading-label">01 / 人物频道</p>{members}</div><div className="tracer-stream"><div className="tracer-stream-main"><p className="tracer-reading-label">02 / 影像信号</p>{works}</div><aside className="tracer-stream-meter">{library}</aside></div><div className="tracer-log"><p className="tracer-reading-label">03 / 资料日志</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="tracer-person-console"><div className="tracer-person-main">{portrait}{actions}</div><div className="tracer-person-log">{identity}{summary}</div></div>),
};

export default function TracerCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
