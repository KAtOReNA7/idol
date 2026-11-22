import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ReleaseTrackList} from '@/components/release-track-list';
import {ImageRecoveryControls, ImageRecoveryProvider, ReliableImage} from '@/components/reliable-image';
import artist from '@/data/lesserafim-artist.json';
import {EASY_FROM_OVERVIEW, LESSERAFIM_EASY_PATH, LESSERAFIM_PATH, releaseTrackAnchor, releaseTrackReturn} from '@/lib/idol/artist-navigation';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {easyCardId, easyPreviewSet, easyReleaseId, easyTracks} from '@/lib/idol/lesserafim-easy';
import './release.css';

export const metadata: Metadata = {
  title: 'EASY · LE SSERAFIM | STAGE',
  description: 'LE SSERAFIM 第三张迷你专辑的官方封面、五首发行曲目和原版 MV。',
};

type AlbumQuery = Record<string, string | string[] | undefined>;

export default async function EasyRelease({searchParams}: {searchParams: Promise<AlbumQuery>}) {
  const release = artist.releases.find(item => item.id === easyReleaseId);
  if (!release?.imagePreview || !release.dateSource) notFound();
  const fromOverview = (await searchParams).from === 'overview';
  const album = fromOverview ? EASY_FROM_OVERVIEW : LESSERAFIM_EASY_PATH;
  const back = LESSERAFIM_PATH + (fromOverview ? '' : '?section=records') + '#' + easyCardId;
  return <div className="lf-easy">
    <a className="lf-easy-skip" href="#lf-easy-main">跳到专辑</a>
    <header className="lf-easy-header"><nav aria-label="团体导航">
      <a href={LESSERAFIM_PATH} aria-label="LE SSERAFIM 团体主页">
        <img className="lf-easy-logo" src="/artist/lesserafim/identity/official-logo.png" width={800} height={280} alt="LE SSERAFIM"/>
      </a>
      <a href={back}>{fromOverview ? '返回首页专辑' : '返回发行目录'}</a>
    </nav></header>
    <main id="lf-easy-main" tabIndex={-1}>
      <header className="lf-easy-heading">
        <h1>{release.title}</h1>
        <p>第三张迷你专辑 <span aria-hidden="true">·</span> <time dateTime={release.date}>{release.date}</time></p>
      </header>
      <figure>
        <ImageRecoveryProvider>
          <a className="lf-easy-cover" href={release.image} aria-label="查看 EASY 官方封面原图" aria-haspopup="dialog" data-original-photo="">
            <ReliableImage src={release.imagePreview} srcSet={easyPreviewSet(release)}
              sizes="(max-width:680px) calc(100vw - 36px), (max-width:1440px) 28.48vw, 410px"
              alt="EASY · SOURCE MUSIC 官方发行封面" width={480} height={480} priority original/>
          </a>
          <figcaption>
            <span>SOURCE MUSIC 官方封面</span>
            <a href={release.image} aria-label="查看 EASY 官方封面原图" aria-haspopup="dialog" data-original-photo="">查看原图</a>
          </figcaption>
          <ImageRecoveryControls/>
        </ImageRecoveryProvider>
      </figure>
      <section className="lf-easy-tracks" aria-labelledby="lf-easy-track-heading">
        <header><h2 id="lf-easy-track-heading">曲目</h2><p>{easyTracks.length} 首 · 13:34</p></header>
        <ReleaseTrackList route={album}>
          {easyTracks.map((track, index) => {
            const row = <>
              <span className="lf-easy-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
              <span className="lf-easy-song">{track.title}{track.lead && <small>主打</small>}</span>
              <time dateTime={'PT'+track.duration.replace(':','M')+'S'}>{track.duration}</time>
              {track.workId && <span className="lf-easy-watch">看 MV</span>}
            </>;
            return <li key={track.title}>{track.workId
              ? <a className="lf-easy-row" id={releaseTrackAnchor(track.workId)} data-member-work-trigger={track.workId}
                  referrerPolicy="no-referrer" href={artistWorkUrl({id:track.workId}, false, releaseTrackReturn(album,track.workId))}>{row}</a>
              : <div className="lf-easy-row">{row}</div>}</li>;
          })}
        </ReleaseTrackList>
        <div className="lf-easy-sources">
          <a href={release.sourceUrl} target="_blank" rel="noopener noreferrer">SOURCE MUSIC 发行资料</a>
          <a href={release.dateSource} target="_blank" rel="noopener noreferrer">发行公告</a>
        </div>
      </section>
    </main>
  </div>;
}
