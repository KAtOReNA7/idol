'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className="izna-prism"><header className="izna-mast">{title}<span aria-hidden="true">↗</span>{actions}</header><div className="izna-frame">{image}</div><div className="izna-light">{intro}</div><aside className="izna-ledger">{facts}</aside></section>),
 overview:({members,works,notes,library})=>(<div className="izna-sequence"><section className="izna-opening"><p className="izna-number">01 / 作品回看</p>{works}</section><div className="izna-people"><p className="izna-number">02 / VOICES</p>{members}</div><aside className="izna-margin">{library}{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="izna-person"><div className="izna-person-number" aria-hidden="true">VOICE<br/>↗</div><div className="izna-person-photo">{portrait}</div><div className="izna-person-name">{identity}{actions}</div><div className="izna-person-score">{summary}</div></section>),
};
export default function IznaDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
