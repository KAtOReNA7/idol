'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="newjeans-letter"><div className="newjeans-letter-heading">{title}<span className="newjeans-paper-mark" aria-hidden="true">TO KEEP.</span></div><div className="newjeans-letter-message">{intro}<p className="newjeans-reading-note">合照留在它的资料时期，个人记录从成员贴签打开。</p>{actions}</div><div className="newjeans-picture-pocket">{image}</div><div className="newjeans-date-stamps">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="newjeans-scrapbook"><div className="newjeans-name-labels"><span className="newjeans-note-label">PEOPLE / 人物贴签</span>{members}</div><div className="newjeans-listening-note">{library}</div><div className="newjeans-record-shelf"><span className="newjeans-note-label">RECORDS / 唱片书架</span>{works}</div><div className="newjeans-saved-notes"><span className="newjeans-note-label">KEEP THESE DATES / 时间随记</span>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="newjeans-person-letter"><div className="newjeans-person-greeting">{identity}</div><div className="newjeans-person-picture">{portrait}</div><div className="newjeans-person-note">{summary}</div><div className="newjeans-person-signoff">{actions}</div></div>,
};
export default function NewJeansDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
