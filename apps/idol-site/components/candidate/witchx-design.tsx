'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="witchx-programme"><div className="witchx-headline">{title}</div><div className="witchx-programme-dates">{facts}</div><div className="witchx-portal">{image}</div><div className="witchx-invitation">{intro}{actions}</div></div>),
  overview:({members,works,notes,library})=>(<div className="witchx-night-bill"><div className="witchx-cast"><p className="witchx-reading-label">第一幕 / 人物节目单</p>{members}</div><div className="witchx-main-stage"><p className="witchx-act-title" aria-hidden="true">第二幕 / THE SCREENING ROOM</p>{works}</div><div className="witchx-interval">{library}</div><div className="witchx-programme-notes"><p className="witchx-reading-label">场刊 / 日期与来源</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="witchx-solo"><div className="witchx-solo-identity">{identity}</div><div className="witchx-solo-portal">{portrait}</div><div className="witchx-solo-notes">{summary}{actions}</div></div>),
};

export default function WitchxCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
