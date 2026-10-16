'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className="madein-atelier"><div className="madein-spine" aria-hidden="true">M / WORK IN PROGRESS</div><div className="madein-print">{image}</div><div className="madein-label">{title}{intro}{actions}</div><div className="madein-catalogue">{facts}</div></section>),
 overview:({members,works,notes,library})=>(<div className="madein-collection"><section className="madein-workbench"><header><span>01</span><p>作品工坊 · 逐页回看</p></header>{works}{library}</section><section className="madein-portraits"><header><span>02</span><p>名字，各自成章。</p></header>{members}</section><div className="madein-filing">{notes}</div></div>),
 member:({portrait,identity,summary,actions})=>(<section className="madein-person-folder"><div className="madein-person-label">{identity}</div><div className="madein-person-print">{portrait}</div><div className="madein-person-paper">{summary}{actions}</div></section>),
};
export default function MadeinDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
