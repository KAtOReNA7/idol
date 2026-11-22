import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowLeft, ArrowUpRight, Play} from 'lucide-react';
import {ReliableImage} from '@/components/reliable-image';
import aespa from '@/data/aespa-artist.json';
import {armageddonCampaign, armageddonReleaseId, armageddonTracks} from '@/lib/idol/aespa-armageddon';
import {AESPA_ARMAGEDDON_PATH, releaseTrackAnchor, releaseTrackReturn} from '@/lib/idol/artist-navigation';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {ReleaseTrackList} from '@/components/release-track-list';
import './release.css';

export const metadata: Metadata = {
  title: 'Armageddon · aespa | STAGE',
  description: '查看 aespa 首张正规专辑的完整曲目、站内 MV 和官方发行资料。',
};

export default function ArmageddonRelease() {
  const release = aespa.releases.find(item => item.id === armageddonReleaseId);
  if (!release) notFound();
  return <div className="armageddon-release">
    <a className="arm-skip" href="#arm-main">跳至专辑详情</a>
    <header className="arm-navigation">
      <a href="/" className="arm-brand" aria-label="STAGE 首页">STAGE</a>
      <nav aria-label="网站导航">
        <a href="/?view=works">作品库</a>
        <a href="/?view=members">成员档案</a>
        <a href="/?view=groups">团体索引</a>
      </nav>
    </header>
    <main id="arm-main">
      <a className="arm-back" href={'/artists/aespa?section=records#'+release.id}>
        <ArrowLeft aria-hidden="true" size={15}/>aespa · 发行目录
      </a>
      <header className="arm-heading">
        <span>{aespa.profile.name}</span>
        <h1>{release.title}</h1>
        <p>首张正规专辑 <span aria-hidden="true">·</span> <time dateTime={release.date}>{release.date.replaceAll('-','.')}</time></p>
      </header>
      <div className="arm-content">
        <figure>
          {release.image&&<ReliableImage src={release.image} alt={release.title+' 官方专辑封面'} width={640} height={640} priority retryMode="inline"/>}
          <figcaption>
            <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer">官方发行页<ArrowUpRight aria-hidden="true" size={14}/></a>
            <a href={armageddonCampaign} target="_blank" rel="noopener noreferrer">发行特设站<ArrowUpRight aria-hidden="true" size={14}/></a>
          </figcaption>
        </figure>
        <section className="arm-tracklist" aria-labelledby="arm-tracks">
          <header><h2 id="arm-tracks">曲目</h2><span>{armageddonTracks.length} 首</span></header>
          <ReleaseTrackList route={AESPA_ARMAGEDDON_PATH}>
            {armageddonTracks.map((track,index)=>{
              const item = <>
                <span className="arm-track-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
                <span className="arm-track-name">{track.title}{track.lead&&<small>主打</small>}</span>
                {track.workId&&<span className="arm-watch"><Play aria-hidden="true" size={12} fill="currentColor"/>看 MV</span>}
              </>;
              return <li key={track.title}>{track.workId
                ? <a className="arm-track" id={releaseTrackAnchor(track.workId)} data-member-work-trigger={track.workId}
                    referrerPolicy="no-referrer" href={artistWorkUrl({id:track.workId},false,releaseTrackReturn(AESPA_ARMAGEDDON_PATH,track.workId))}>{item}</a>
                : <div className="arm-track">{item}</div>}</li>;
            })}
          </ReleaseTrackList>
        </section>
      </div>
    </main>
  </div>;
}
