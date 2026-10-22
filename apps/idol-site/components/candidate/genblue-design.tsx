'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className={`genblue-horizon${facts ? '' : ' has-no-facts'}`}><header>{title}<p aria-hidden="true">BLUE / NEXT / PLAY</p></header>{facts && <aside className="genblue-coordinates">{facts}</aside>}<div className="genblue-seascape">{image}</div><div className="genblue-route">{intro}{actions}</div></section>),
 overview:({members,works,notes,library})=>(<div className="genblue-logbook"><section className="genblue-departure">{library}</section><section className="genblue-soundline"><div className="genblue-section-label"><span>01</span><p>作品航线 · 按收录目录出发</p></div>{works}</section><section className="genblue-crew"><div className="genblue-section-label"><span>02</span><p>人物坐标</p></div>{members}</section><aside className="genblue-log">{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="genblue-person-port"><header>{identity}</header><div className="genblue-person-photo">{portrait}</div><aside className="genblue-person-log">{summary}<div className="genblue-person-actions">{actions}</div></aside></section>),
};
export default function GenblueDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
