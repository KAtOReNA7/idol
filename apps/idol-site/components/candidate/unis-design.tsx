'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';
const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=>(<section className={`unis-ticket${facts ? '' : ' has-no-facts'}`}><div className="unis-ticket-main">{title}{intro}{actions}</div>{facts && <aside className="unis-ticket-stub"><span className="unis-stub-label">KEEP THIS MOMENT</span>{facts}</aside>}<div className="unis-postcard">{image}<span className="unis-stamp" aria-hidden="true">REPLAY<br/>↗</span></div></section>),
 overview:({members,works,notes,library})=>(<div className="unis-boarding"><section className="unis-now"><div className="unis-chapter-label"><span>PLAY</span><p>观看票根 · 这一次想看什么？</p></div>{works}</section><aside className="unis-pocket">{library}</aside><section className="unis-namecards"><div className="unis-chapter-label"><span>PEOPLE</span><p>把名字写进手帐。</p></div>{members}</section><aside className="unis-receipts">{notes}</aside></div>),
 member:({portrait,identity,summary,actions})=>(<section className="unis-person-pass"><div className="unis-person-main">{portrait}<div className="unis-person-name">{identity}</div></div><aside className="unis-person-stub">{summary}{actions}</aside></section>),
};
export default function UnisDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
