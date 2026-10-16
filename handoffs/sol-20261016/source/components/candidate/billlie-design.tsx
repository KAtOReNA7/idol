'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="billlie-open-file"><div className="billlie-file-heading">{title}<span className="billlie-margin-number" aria-hidden="true">B.</span></div><div className="billlie-file-window">{image}</div><div className="billlie-file-prologue"><span className="billlie-chapter-label">PROLOGUE / 从这里读起</span>{intro}<p className="billlie-reading-note">人物、影像与页边记录，是三种不同的阅读入口。</p>{actions}</div><div className="billlie-file-footnote">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="billlie-story-spread"><div className="billlie-cast-chapter"><span className="billlie-chapter-label">CHAPTER 01 / 人物</span>{members}</div><div className="billlie-screen-chapter"><span className="billlie-chapter-label">CHAPTER 02 / 影像</span>{works}</div><aside className="billlie-reading-card">{library}</aside><div className="billlie-footnote-chapter"><span className="billlie-chapter-label">MARGINALIA / 页边记录</span>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="billlie-character-spread"><div className="billlie-character-title">{identity}</div><div className="billlie-character-window">{portrait}</div><div className="billlie-character-notes"><span className="billlie-chapter-label">HER CHAPTER / 个人篇章</span>{summary}{actions}</div></div>,
};
export default function BilllieDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
