import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ReleaseTrackList} from '@/components/release-track-list';
import {ReliableImage} from '@/components/reliable-image';
import xg from '@/data/xg-artist.json';
import {XG_NEW_DNA_PATH, XG_PATH, releaseTrackAnchor, releaseTrackReturn} from '@/lib/idol/artist-navigation';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {newDnaCampaign, newDnaReleaseId, newDnaTracks} from '@/lib/idol/xg-new-dna';
import './release.css';

export const metadata: Metadata = {
  title: 'NEW DNA · XG | STAGE',
  description: 'XG 首张迷你专辑的发行资料、完整曲目和原版 MV。',
};

export default function NewDnaRelease() {
  const release = xg.releases.find(item => item.id === newDnaReleaseId);
  if (!release) notFound();
  return <div className="xg-dna">
    <a className="xg-dna-skip" href="#xg-dna-main">跳到专辑</a>
    <header className="xg-dna-header">
      <nav aria-label="团体导航">
        <a className="xg-dna-wordmark" href={XG_PATH} aria-label="XG 团体主页">XG</a>
        <a href={XG_PATH+'?section=records#'+release.id}>返回发行目录</a>
      </nav>
    </header>
    <main id="xg-dna-main" tabIndex={-1}>
      <header className="xg-dna-heading">
        <h1>{release.title}</h1>
        <p>首张迷你专辑 <span aria-hidden="true">·</span> <time dateTime={release.date}>{release.date}</time></p>
      </header>
      <figure>
        {release.image && <ReliableImage src={release.image} alt="NEW DNA · X 版官方包装" width={640} height={641} priority original retryMode="inline"/>}
        <figcaption>X 版官方包装</figcaption>
      </figure>
      <section className="xg-dna-tracks" aria-labelledby="xg-dna-tracks-heading">
        <h2 id="xg-dna-tracks-heading">发行曲目</h2>
        <ReleaseTrackList route={XG_NEW_DNA_PATH}>
          {newDnaTracks.map((track, index) => {
            const item = <>
              <span className="xg-dna-number" aria-hidden="true">{String(index+1).padStart(2, '0')}</span>
              <span className="xg-dna-name">{track.title}</span>
              {track.workId && <span className="xg-dna-watch">查看 MV</span>}
            </>;
            return <li key={track.title}>{track.workId
              ? <a className="xg-dna-track" id={releaseTrackAnchor(track.workId)} data-member-work-trigger={track.workId}
                  referrerPolicy="no-referrer" href={artistWorkUrl({id:track.workId}, false, releaseTrackReturn(XG_NEW_DNA_PATH,track.workId))}>{item}</a>
              : <div className="xg-dna-track">{item}</div>}</li>;
          })}
        </ReleaseTrackList>
        <div className="xg-dna-sources">
          <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer">XGALX 发行资料</a>
          <a href={newDnaCampaign} target="_blank" rel="noopener noreferrer">NEW DNA 官方专题</a>
        </div>
      </section>
    </main>
  </div>;
}
