'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="purplekiss-record-sleeve"><div className="purplekiss-sleeve-title">{title}</div><div className="purplekiss-sleeve-voice">{intro}{actions}</div><div className="purplekiss-sleeve-art">{image}<p aria-hidden="true">A PLACE FOR THE ECHO</p></div><div className="purplekiss-sleeve-liner">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="purplekiss-archive"><div className="purplekiss-liner-notes"><span className="purplekiss-side-label">SIDE A / 留存的时间</span>{notes}</div><div className="purplekiss-records"><span className="purplekiss-side-label">SIDE B / 再次播放</span>{works}{library}</div><div className="purplekiss-people-index"><span className="purplekiss-side-label">INNER SLEEVE / 人物档案</span>{members}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="purplekiss-person-sleeve"><div className="purplekiss-person-title">{identity}{actions}</div><div className="purplekiss-person-art">{portrait}</div><div className="purplekiss-person-liner">{summary}</div></div>,
};
export default function PurpleKissDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
