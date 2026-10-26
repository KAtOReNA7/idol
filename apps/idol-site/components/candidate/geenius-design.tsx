'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition,CandidateContent} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
  hero:({title,intro,image,actions,facts})=>(<div className="geenius-frontispiece"><div className="geenius-book-title">{title}</div><div className="geenius-plate">{image}<span className="geenius-plate-mark" aria-hidden="true">A VOYAGE / IN SOUND</span></div><div className="geenius-letter">{intro}{actions}<div className="geenius-colophon">{facts}</div></div></div>),
  overview:({members,works,notes,library})=>(<div className="geenius-pages"><div className="geenius-contents"><p className="geenius-reading-label">第一章 / 影像目录</p>{works}</div><div className="geenius-marginalia">{library}</div><div className="geenius-portraits"><p className="geenius-reading-label">第二章 / 人物折页</p>{members}</div><div className="geenius-postscript"><p className="geenius-reading-label">卷末 / 来源与时间</p>{notes}</div></div>),
  member:({portrait,identity,summary,actions})=>(<div className="geenius-person-spread"><div className="geenius-person-plate">{portrait}</div><div className="geenius-person-letter">{identity}{summary}{actions}</div></div>),
};

export default function GeeniusCandidateDesign({content}:{content:CandidateContent}){
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
