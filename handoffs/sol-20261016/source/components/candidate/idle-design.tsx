'use client';

import {CandidateArtistExperience} from '@/components/candidate-artist-experience';
import type {CandidateContent, CandidateComposition} from '@/lib/idol/candidate/types';

const composition: CandidateComposition = {
  hero: ({title, intro, image, actions, facts}) => (
    <section className="idle-editorial-cover">
      <div className="idle-cover-heading">
        {title}
        {intro}
      </div>
      <div className="idle-cover-photograph">{image}</div>
      <nav className="idle-chapter-index" aria-label="i-dle 章节目录">
        <a href="/artists/idle?section=members"><span>01</span> 人物索引 <span aria-hidden="true">↗</span></a>
        <a href="/artists/idle?section=works"><span>02</span> 作品与舞台 <span aria-hidden="true">↗</span></a>
        <a href="/artists/idle?section=updates"><span>03</span> 资料与时间线 <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="idle-cover-footnotes">
        <div className="idle-cover-facts">{facts}</div>
        <div className="idle-cover-actions">{actions}</div>
      </div>
    </section>
  ),
  overview: ({members, works, notes, library}) => (
    <div className="idle-editorial-body">
      <section id="idle-people" className="idle-chapter idle-people-chapter">
        <p className="idle-chapter-marker"><span>01</span> / 人物索引</p>
        {members}
      </section>
      <section id="idle-works" className="idle-chapter idle-works-chapter">
        <p className="idle-chapter-marker"><span>02</span> / 作品书架</p>
        {works}
        {library}
      </section>
      <section id="idle-notebook" className="idle-chapter idle-notebook-chapter">
        <p className="idle-chapter-marker"><span>03</span> / 记录与续页</p>
        {notes}
      </section>
    </div>
  ),
  member: ({portrait, identity, summary, actions}) => (
    <section className="idle-person-spread">
      <div className="idle-person-heading">
        <p className="idle-chapter-marker"><span>01</span> / 人物专页</p>
        {identity}
      </div>
      <div className="idle-person-portrait">{portrait}</div>
      <div className="idle-person-record">
        {summary}
        {actions}
      </div>
    </section>
  ),
};

export default function IdleDesign({content}: {content: CandidateContent}) {
  return <CandidateArtistExperience content={content} composition={composition} />;
}
