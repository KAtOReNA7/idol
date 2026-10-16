'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
hero:({title,intro,image,actions,facts})=>(<div className="bv-poster"><div className="bv-name">{title}</div><div className="bv-statement">{intro}{actions}</div><div className="bv-screen">{image}</div><div className="bv-dossier">{facts}</div></div>),
overview:({members,works,notes,library})=>(<div className="bv-program"><section className="bv-feature"><p className="module-kicker">01 / 作品放映</p>{works}</section><aside className="bv-ledger">{library}{notes}</aside><section className="bv-people"><p className="module-kicker">02 / 舞台人物</p>{members}</section></div>),
member:({portrait,identity,summary,actions})=>(<div className="bv-person"><div className="bv-person-name">{identity}</div><div className="bv-person-photo">{portrait}</div><div className="bv-person-score">{summary}{actions}</div></div>),
};
export default function BadvillainDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
