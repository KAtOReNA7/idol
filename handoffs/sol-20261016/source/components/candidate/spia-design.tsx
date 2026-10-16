'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="spia-cover"><div className="spia-masthead">{title}</div><div className="spia-deck">{intro}{actions}</div><div className="spia-cover-plate">{image}</div><aside className="spia-cover-index">{facts}</aside></div>),
  overview:({members,works,notes,library})=>(<div className="spia-edition"><div className="spia-featured"><p className="spia-reading-label">开篇 / 影像专题</p>{works}</div><div className="spia-people"><span className="spia-divider" aria-hidden="true">THE PEOPLE / THE FRAMES</span>{members}</div><div className="spia-reading-score">{library}</div><div className="spia-footnotes"><p className="spia-reading-label">刊末 / 资料注脚</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="spia-profile-edition"><div className="spia-profile-title">{identity}</div><div className="spia-profile-plate">{portrait}</div><div className="spia-profile-notes">{summary}{actions}</div></div>),
};

export default function SpiaCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
