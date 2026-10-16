'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="cherrybullet-cover"><div className="cherrybullet-spine" aria-hidden="true">CHERRY / BULLET / ARCHIVE</div><div className="cherrybullet-heading">{title}{actions}</div><div className="cherrybullet-sleeve">{image}<span aria-hidden="true">CB / COLLECTION</span></div><div className="cherrybullet-cover-copy">{intro}</div><div className="cherrybullet-cover-note">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="cherrybullet-dossier"><div className="cherrybullet-people"><p className="cherrybullet-file-label">FILE 01 / 人物记录</p>{members}</div><div className="cherrybullet-collection"><p className="cherrybullet-file-label">FILE 02 / 影像收藏</p>{works}{library}</div><div className="cherrybullet-history"><p className="cherrybullet-file-label">FILE 03 / 留存资料</p>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="cherrybullet-person-file"><div className="cherrybullet-person-cover">{portrait}</div><div className="cherrybullet-person-heading"><p className="cherrybullet-file-label">PERSONAL FILE</p>{identity}{actions}</div><div className="cherrybullet-person-summary">{summary}</div></div>,
};
export default function CherryBulletDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
