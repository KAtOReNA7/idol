import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ReleaseTrackList} from '@/components/release-track-list';
import {ImageRecoveryControls, ImageRecoveryProvider, ReliableImage} from '@/components/reliable-image';
import artist from '@/data/babymonster-artist.json';
import {BABYMONSTER_DRIP_PATH, BABYMONSTER_PATH, DRIP_FROM_OVERVIEW, releaseTrackAnchor, releaseTrackReturn} from '@/lib/idol/artist-navigation';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {dripCardId, dripCoverOriginal, dripReleaseId, dripSource, dripTracks} from '@/lib/idol/babymonster-drip';
import './release.css';

export const metadata: Metadata = {
  title: 'DRIP · BABYMONSTER | STAGE',
  description: 'BABYMONSTER 首张正规专辑的 YG 官方封面、九首发行曲目及对应的站内影像。',
};

type ReleaseQuery = Record<string, string | string[] | undefined>;

export default async function DripRelease({searchParams}: {searchParams: Promise<ReleaseQuery>}) {
  const release = artist.releases.find(item => item.id === dripReleaseId);
  if (!release?.image) notFound();
  const fromOverview = (await searchParams).from === 'overview';
  const route = fromOverview ? DRIP_FROM_OVERVIEW : BABYMONSTER_DRIP_PATH;
  const back = BABYMONSTER_PATH + (fromOverview ? '' : '?section=records') + '#' + dripCardId;

  return <div className="bm-drip">
    <a className="bm-drip-skip" href="#bm-drip-main">跳到专辑</a>
    <header className="bm-drip-nav">
      <nav className="bm-drip-width" aria-label="团体导航">
        <a className="bm-drip-wordmark" href={BABYMONSTER_PATH}>BABYMONSTER</a>
        <a href={back}>{fromOverview ? '返回首页专辑' : '返回发行目录'}</a>
      </nav>
    </header>
    <main className="bm-drip-width" id="bm-drip-main" tabIndex={-1}>
      <header className="bm-drip-heading">
        <h1>{release.title}</h1>
        <p>首张正规专辑 <span aria-hidden="true">·</span> <time dateTime={release.date}>{release.date}</time></p>
      </header>
      <div className="bm-drip-content">
        <figure>
          <ImageRecoveryProvider>
            <a className="bm-drip-cover" href={dripCoverOriginal} aria-label="查看 DRIP 官方封面原图"
              aria-haspopup="dialog" data-original-photo="">
              <ReliableImage src={release.image} alt="DRIP · YG 官方专辑封面" width={500} height={500} priority original/>
              <span>查看官方封面原图</span>
            </a>
            <ImageRecoveryControls/>
          </ImageRecoveryProvider>
        </figure>
        <section className="bm-drip-tracks" aria-labelledby="bm-drip-track-heading">
          <header>
            <h2 id="bm-drip-track-heading">发行曲目</h2>
            <p>{dripTracks.length} 首</p>
          </header>
          <ReleaseTrackList route={route}>
            {dripTracks.map(({title, workId, lead, performanceVideo}, index) => {
              const entry = <>
                <span className="bm-drip-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="bm-drip-song">{title}{lead && <small>双主打</small>}</span>
                {workId && <span className="bm-drip-watch">{performanceVideo ? '看表演视频' : '查看 MV'}</span>}
              </>;
              return <li key={title}>{workId
                ? <a className="bm-drip-row" id={releaseTrackAnchor(workId)} data-member-work-trigger={workId}
                  aria-label={title + (performanceVideo ? ' · 看表演视频' : ' · 查看 MV')}
                  referrerPolicy="no-referrer" href={artistWorkUrl({id:workId}, false, releaseTrackReturn(route, workId))}>{entry}</a>
                : <div className="bm-drip-row">{entry}</div>}
              </li>;
            })}
          </ReleaseTrackList>
          <a className="bm-drip-source" href={dripSource} target="_blank" rel="noopener noreferrer">YG 官方发行资料</a>
        </section>
      </div>
    </main>
  </div>;
}
