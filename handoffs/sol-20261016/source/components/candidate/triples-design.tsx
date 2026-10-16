'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className="triples-console"><div className="triples-console-title">{title}<p className="triples-code">作品目录 / 成员关系 / 回看</p>{actions}</div><div className="triples-console-copy">{intro}</div><aside className="triples-console-facts">{facts}</aside><div className="triples-contact-strip">{image}</div></section>),
 overview:({members,works,notes,library})=>(<div className="triples-index"><aside className="triples-dashboard">{library}<p className="triples-code">每条记录，都有自己的归属。</p></aside><section className="triples-matrix">{members}</section><section className="triples-release-grid">{works}</section><aside className="triples-source-drawer">{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="triples-person-terminal"><header>{identity}</header><aside className="triples-id-card">{portrait}{actions}</aside><div className="triples-person-data">{summary}</div></section>),
};
export default function TriplesDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
