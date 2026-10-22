'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="weeekly-journal"><div className="weeekly-week" aria-hidden="true">{['MON','TUE','WED','THU','FRI','SAT','SUN'].map(day=><span key={day}>{day}</span>)}</div><div className="weeekly-heading">{title}</div><div className="weeekly-sticky-note">{intro}<p className="weeekly-reading-note">成员是人物页，作品是播放页；各年的消息按原来的日期保留。</p></div><div className="weeekly-photo-page">{image}</div><div className="weeekly-page-actions">{actions}</div><div className="weeekly-date-notes">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="weeekly-notebook"><div className="weeekly-roster-page"><span className="weeekly-tab-label">PEOPLE / 人物页</span>{members}</div><div className="weeekly-works-page"><span className="weeekly-tab-label">PLAYLIST / 播放页</span>{works}</div><div className="weeekly-bookmark">{library}</div><div className="weeekly-notes-page"><span className="weeekly-tab-label">DATES & NOTES / 日期与随记</span>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="weeekly-person-page"><div className="weeekly-person-title">{identity}</div><div className="weeekly-person-picture">{portrait}</div><div className="weeekly-person-notes">{summary}{actions}</div></div>,
};
export default function WeeeklyDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
