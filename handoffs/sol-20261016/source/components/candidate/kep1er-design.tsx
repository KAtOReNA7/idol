'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="kep1er-atlas"><div className="kep1er-coordinate-title">{title}<div className="kep1er-coordinate-line" aria-hidden="true"><span>ORIGIN</span><span>PLAY</span><span>RETURN</span></div></div><div className="kep1er-viewfinder">{image}</div><div className="kep1er-mission-note">{intro}<p className="kep1er-reading-note">公告安排与历史名册分开读；作品沿已有记录继续。</p></div><div className="kep1er-route-actions">{actions}</div><div className="kep1er-flight-record">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="kep1er-map-pages"><div className="kep1er-orbit-roster"><span className="kep1er-map-label">01 / 人物坐标</span>{members}</div><div className="kep1er-route-map"><span className="kep1er-map-label">02 / 影像航线</span>{works}</div><div className="kep1er-log-strip">{library}</div><div className="kep1er-date-map"><span className="kep1er-map-label">03 / 时间标记</span>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="kep1er-person-coordinate"><div className="kep1er-person-name">{identity}{actions}</div><div className="kep1er-person-window">{portrait}</div><div className="kep1er-person-telemetry">{summary}</div></div>,
};
export default function Kep1erDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
