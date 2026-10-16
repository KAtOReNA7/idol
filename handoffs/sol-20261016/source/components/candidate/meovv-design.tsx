'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateComposition, CandidateContent} from '@/lib/idol/candidate/types';

const composition: CandidateComposition = {
  hero: ({title, intro, image, actions, facts}) => (
    <div className="meovv-cover">
      <div className="meovv-cover-copy">
        {title}
        {intro}
        {actions}
      </div>
      <div className="meovv-cover-photo">{image}</div>
      <div className="meovv-cover-facts">{facts}</div>
    </div>
  ),
  overview: ({members, works, notes, library}) => (
    <div className="meovv-night-index">
      <div className="meovv-members-block">
        <p className="meovv-section-kicker">THE FIVE / 各自的声音</p>
        {members}
      </div>
      <div className="meovv-listening-block">
        <div className="meovv-listening-label" aria-hidden="true"><span>PLAY</span><span>IT BACK.</span><small>MV / LIVE</small></div>
        <div className="meovv-listening-content">{works}{library}</div>
      </div>
      <div className="meovv-notes-block">{notes}</div>
    </div>
  ),
  member: ({portrait, identity, summary, actions}) => (
    <div className="meovv-person-sheet">
      <div className="meovv-person-copy"><p className="meovv-section-kicker">ONE VOICE / MEOVV</p>{identity}{summary}{actions}</div>
      <div className="meovv-person-photo">{portrait}</div>
    </div>
  ),
};

export default function MeovvDesign({content}: {content: CandidateContent}) {
  return <CandidateArtistExperience content={content} composition={composition}/>;
}
