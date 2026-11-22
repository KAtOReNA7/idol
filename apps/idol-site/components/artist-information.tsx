'use client';

import {ArtistTimelineHost, useArtistTimelineHostOptions} from './artist-timeline-host';
import {informationGroupId, renderGroupInformation} from '@/lib/idol/group-information.mjs';
import introductions from '@/data/artist-home-introductions.json';
import type {CatalogView} from '@/lib/idol/types';
import '../public/artist/group-information.css';

type SectionProps = {slug: string; catalog: CatalogView | null};

export function ArtistIntroduction({slug}: {slug: keyof typeof introductions}) {
  return <p data-home-introduction={slug}><span className="group-intro-label">团体介绍</span>{introductions[slug].text}</p>;
}

export function ArtistInformation({slug, catalog}: SectionProps) {
  const group = catalog?.groups.find(row => row.id === informationGroupId(slug));
  return <div className="artist-information-host" dangerouslySetInnerHTML={{__html: renderGroupInformation(slug, group)}}/>;
}

export function ArtistHomeTimeline({slug, catalog}: SectionProps) {
  const host = useArtistTimelineHostOptions();
  const groupId = informationGroupId(slug);
  return <section className="artist-home-timeline" data-home-module="timeline">
    <header><small>TIMELINE</small><h2>时间轴</h2><a href={`/artists/${slug}?section=updates`}>完整时间轴 ↗</a></header>
    {groupId && <ArtistTimelineHost groupId={groupId} catalog={catalog} loading={host.loading} error={host.error}/>}
  </section>;
}
