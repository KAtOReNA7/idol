'use client';
import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent,CandidateComposition} from '@/lib/idol/candidate/types';

const composition:CandidateComposition={
 hero:({title,intro,image,actions,facts})=><div className="wooah-station"><div className="wooah-station-heading">{title}<div className="wooah-frequency" aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></div><div className="wooah-station-screen">{image}</div><div className="wooah-station-intro">{intro}<p className="wooah-reading-note">先打开影像，再认识声音背后的成员。</p></div><div className="wooah-station-controls">{actions}</div><div className="wooah-station-index">{facts}</div></div>,
 overview:({members,works,notes,library})=><div className="wooah-broadcast"><div className="wooah-now-playing"><span className="wooah-channel-label">01 / 打开作品</span>{works}</div><div className="wooah-station-roster"><span className="wooah-channel-label">02 / 认识成员</span>{members}</div><div className="wooah-listening-meter">{library}</div><div className="wooah-station-log"><span className="wooah-channel-label">03 / 电台记事</span>{notes}</div></div>,
 member:({portrait,identity,summary,actions})=><div className="wooah-profile-channel"><div className="wooah-profile-name">{identity}</div><div className="wooah-profile-screen">{portrait}</div><div className="wooah-profile-data">{summary}</div><div className="wooah-profile-controls">{actions}</div></div>,
};
export default function WooahDesign({content}:{content:CandidateContent}){return <CandidateArtistExperience content={content} composition={composition}/>;}
