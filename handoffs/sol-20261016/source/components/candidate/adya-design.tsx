'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="adya-playbook"><div className="adya-masthead">{title}</div><div className="adya-opening">{intro}{actions}</div><div className="adya-image-lane">{image}</div><aside className="adya-fact-lane"><p className="adya-label">THE FILE / 团体资料</p>{facts}</aside></div>),
  overview:({members,works,notes,library})=>(<div className="adya-content-map"><div className="adya-rollcall"><p className="adya-reading-label">01 / 点名册</p>{members}</div><div className="adya-score-strip">{library}</div><div className="adya-screen-list"><p className="adya-reading-label">02 / 今日放映</p>{works}</div><div className="adya-context"><p className="adya-reading-label">03 / 练习册附记</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="adya-member-sheet"><div className="adya-member-title">{identity}{actions}</div><div className="adya-member-image">{portrait}</div><div className="adya-member-stats">{summary}</div></div>),
};

export default function AdyaCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
