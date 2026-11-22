import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ReleaseTrackList} from '@/components/release-track-list';
import {ImageRecoveryControls, ImageRecoveryProvider, ReliableImage} from '@/components/reliable-image';
import artist from '@/data/itzy-artist.json';
import {ITZY_KILL_MY_DOUBT_PATH, ITZY_PATH, releaseTrackAnchor, releaseTrackReturn} from '@/lib/idol/artist-navigation';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {killMyDoubtCoverPreview, killMyDoubtCoverSet, killMyDoubtReleaseId, killMyDoubtTracks} from '@/lib/idol/itzy-kill-my-doubt';
import './release.css';

export const metadata: Metadata = {
  title: 'KILL MY DOUBT · ITZY | STAGE',
  description: 'ITZY 官方迷你专辑的完整封面、发行曲目与原版 MV。',
};

const release = artist.releases.find(item => item.id === killMyDoubtReleaseId);

export default function KillMyDoubtRelease() {
  if (!release?.image) notFound();

  return <div className="itzy-kmd">
    <a className="kmd-skip" href="#kmd-main">跳到专辑</a>
    <header className="kmd-nav">
      <nav aria-label="团体导航">
        <a className="kmd-wordmark" href={ITZY_PATH} aria-label="ITZY 团体主页">ITZY</a>
        <a href={ITZY_PATH + '?section=records#' + release.id}>返回发行目录</a>
      </nav>
    </header>
    <main id="kmd-main" tabIndex={-1}>
      <header className="kmd-heading">
        <h1>{release.title}</h1>
        <p>{release.type} <span aria-hidden="true">·</span> <time dateTime={release.date}>{release.date}</time></p>
      </header>
      <figure>
        <ImageRecoveryProvider>
          <a className="kmd-cover" href={release.image} aria-label="查看 KILL MY DOUBT 官方封面大图" aria-haspopup="dialog" data-original-photo="">
            <ReliableImage src={killMyDoubtCoverPreview} srcSet={killMyDoubtCoverSet}
              sizes="(max-width:700px) calc(100vw - 36px), (max-width:1440px) 33vw, 474px"
              alt="KILL MY DOUBT · JYP 官方发行封面" width={480} height={480} priority original/>
          </a>
          <figcaption>
            <a href={release.image} aria-haspopup="dialog" data-original-photo="">查看完整封面</a>
          </figcaption>
          <ImageRecoveryControls/>
        </ImageRecoveryProvider>
      </figure>
      <section className="kmd-tracks" aria-labelledby="kmd-track-heading">
        <h2 id="kmd-track-heading">发行曲目</h2>
        <ReleaseTrackList route={ITZY_KILL_MY_DOUBT_PATH}>
          {killMyDoubtTracks.map(({title, workId, lead}, index) => {
            const row = <>
              <span className="kmd-track-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="kmd-track-name">{title}{lead && <small>主打</small>}</span>
              {workId && <span className="kmd-watch">查看 MV</span>}
            </>;
            return <li key={title}>{workId
              ? <a className="kmd-track" id={releaseTrackAnchor(workId)} data-member-work-trigger={workId}
                  referrerPolicy="no-referrer" href={artistWorkUrl({id: workId}, false, releaseTrackReturn(ITZY_KILL_MY_DOUBT_PATH, workId))}>{row}</a>
              : <div className="kmd-track">{row}</div>}
            </li>;
          })}
        </ReleaseTrackList>
        <a className="kmd-source" href={release.sourceUrl} target="_blank" rel="noopener noreferrer">JYP 官方发行资料</a>
      </section>
    </main>
  </div>;
}
