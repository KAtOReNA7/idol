'use client';

import type {ReactNode} from 'react';
import {ReliableImage} from '@/components/reliable-image';
import {memberDisplayName, memberChineseName} from '@/lib/idol/member-display-name';
import {artistWorkUrl, type artistRoute} from '@/lib/idol/artist-preview';
import {loonaHomeAsset, loonaHomeReleases, loonaHomeVideos, loonaHomePortrait, loonaHomeUnits, loonaHomeHistory} from '@/lib/idol/loona-home';
import type {Member, Work} from '@/lib/idol/types';
import type {DisplayPortrait} from '@/lib/idol/candidate/portrait';

const name = (member: Member) => memberChineseName(member) || memberDisplayName(member);
function Link({href, children, className, focusKey}: {href?: string; children: ReactNode; className?: string; focusKey?: string}) {
  return href ? <a href={href} className={className} data-member-work-trigger={focusKey}>{children}</a> : <span className={className}>{children}</span>;
}
function Picture({src, alt, identityKey, priority = false, width, height}: {src?: string; alt: string; identityKey: string; priority?: boolean; width: number; height: number}) {
  const ratio = `${width} / ${height}`;
  return <ReliableImage src={src} alt={alt} identityKey={identityKey} priority={priority} width={width} height={height} style={{objectFit: 'contain', aspectRatio: ratio, width: '100%', height: 'auto'}} fallbackStyle={{aspectRatio: ratio, width: '100%', minHeight: 0}} referrerPolicy="no-referrer" missing={<span className="ln-image-message">照片暂缺</span>} errorFallback={<span className="ln-image-message">图片暂时无法加载</span>}/>;
}
export default function LoonaHome({roster, works, returnTo, portrait, navigate, homeMember, setLightbox}: {
  roster: Member[]; works: Work[]; returnTo: string;
  portrait: (member: Member) => DisplayPortrait | null | undefined;
  navigate: (patch: Partial<ReturnType<typeof artistRoute>>) => void;
  homeMember: (member: Member, location: string) => void;
  setLightbox: (photo: {src: string; label: string}) => void;
}) {
  const homeReleases = loonaHomeReleases(works), homeVideos = loonaHomeVideos(works);
  return <div className="ln-home-content">
    <section className="ln-home-identity" aria-label="LOONA 本月少女">
      <h1><Picture src={loonaHomeAsset('logo-loona.png')} width={398} height={84} alt="LOONA" identityKey="home:logo" priority/></h1>
      <div><p>本月少女</p><span>音乐作品与十二位历史成员</span></div>
    </section>
    <button className="ln-home-hero" aria-label="放大 LOONA 十二人历史资料照" aria-haspopup="dialog" onClick={() => setLightbox({src: loonaHomeAsset('hero.jpg'), label: 'LOONA · 十二人历史资料照'})}>
      <Picture src={loonaHomeAsset('hero.jpg')} width={1576} height={1051} alt="LOONA 十二人历史团体资料照，白衣与花植" identityKey="home:hero" priority/>
    </button>
    <div className="ln-home-entry"><button className="ln-home-solid" onClick={() => navigate({section: 'works', member: null})}>浏览作品</button><button onClick={() => document.getElementById('loona-people')?.scrollIntoView({block: 'start'})}>认识成员 →</button><span>LOONA / 本月少女</span></div>
    <section className="ln-home-section" id="loona-releases"><h2>发行</h2><div className="ln-home-releases">
      {homeReleases.map(entry => <article key={entry.releaseKey} data-release-key={entry.releaseKey}>
        <Link href={entry.work ? artistWorkUrl(entry.work, false, returnTo) : undefined} focusKey={`release:${entry.releaseKey}`} className="ln-home-release">
          <div className="ln-home-cover"><Picture src={loonaHomeAsset(entry.file)} width={entry.file.endsWith('.png') ? 500 : 600} height={entry.file.endsWith('.png') ? 500 : 600} alt={`${entry.title} 发行封面`} identityKey={`release:${entry.releaseKey}`}/></div>
          <h3>{entry.title}</h3><p>关联曲目 · {entry.song}</p><time dateTime={entry.date}>{entry.date}</time><small>{entry.title === 'LUMINOUS' ? '日本实体单曲发行' : '专辑发行'}</small><span>{entry.work ? '查看作品与记录 →' : '作品记录暂缺'}</span>
        </Link>
      </article>)}
    </div></section>
    <section className="ln-home-section ln-home-music"><h2>音乐视频</h2><div className="ln-home-videos">
      {homeVideos.map((entry, index) => <article className={index === 0 ? 'ln-home-video-main' : 'ln-home-video-small'} key={entry.id} data-home-video-id={entry.id}>
        <Link className="ln-home-video-image" href={entry.work ? artistWorkUrl(entry.work, false, returnTo) : undefined} focusKey={`home-video:${entry.id}`}><Picture src={loonaHomeAsset(entry.file)} width={index === 0 ? 480 : 1200} height={index === 0 ? 360 : 675} alt={`${entry.song} 音乐视频预览`} identityKey={`video:${entry.id}`}/></Link>
        <div className="ln-home-video-copy"><h3>{entry.song}</h3>{entry.work?.releaseDate && <time dateTime={entry.work.releaseDate}>{entry.work.releaseDate}</time>}<Link className={index === 0 ? 'ln-home-solid' : 'ln-home-video-link'} href={entry.work ? artistWorkUrl(entry.work, false, returnTo) : undefined} focusKey={`home-watch:${entry.id}`}>{entry.work ? '查看 MV 与记录 →' : '作品记录暂缺'}</Link></div>
      </article>)}
    </div></section>
    <section className="ln-home-section ln-home-members" id="loona-people"><h2>成员<span className="ln-home-sr"> · 历史成员 · {roster.length} 人 · 历史十二人名册</span></h2><div className="ln-home-roster">
      {roster.map(m => <button key={m.id} className="ln-home-person" aria-label={memberDisplayName(m)} data-artist-member-trigger={m.id} data-loona-member-trigger={`loona:home:${m.id}`} onClick={() => homeMember(m, 'home')}>
        <div className="ln-home-portrait"><Picture src={loonaHomePortrait(m) ?? portrait(m)?.image} width={800} height={1200} alt={memberDisplayName(m)} identityKey={`home:member:${m.id}`}/></div><span className="ln-home-cn">{name(m)}</span><span className="ln-home-stage">{m.stageName}</span>
      </button>)}
    </div></section>
    <section className="ln-home-section ln-home-units" id="loona-units"><h2>分队</h2><div className="ln-home-unit-grid">
      {loonaHomeUnits.map(unit => <article className={`ln-home-unit ln-home-unit-${unit.key}`} key={unit.key}>
        <button className="ln-home-unit-photo" aria-label={`放大${unit.title}历史资料照`} aria-haspopup="dialog" onClick={() => setLightbox({src: loonaHomeAsset(`unit-${unit.key}.jpg`), label: `${unit.title} · 历史分队资料照`})}><Picture src={loonaHomeAsset(`unit-${unit.key}.jpg`)} width={1000} height={unit.key === '13' ? 684 : unit.key === 'oec' ? 667 : 695} alt={`${unit.title} 历史分队资料照`} identityKey={`home:unit:${unit.key}`}/></button>
        <h3 className="ln-home-unit-logo"><Picture src={loonaHomeAsset(`logo-unit-${unit.key}.png`)} width={unit.width} height={unit.height} alt={unit.title} identityKey={`home:unit-logo:${unit.key}`}/></h3>
        <div className="ln-home-unit-names">{unit.members.flatMap(id => {const m = roster.find(item => item.id === id); return m ? [<button key={id} data-loona-member-trigger={`loona:unit:${id}`} onClick={() => homeMember(m, 'unit')}>{name(m)}</button>] : [];})}</div>
        <button className="ln-home-unit-link" onClick={() => navigate({section: 'members', member: null})}>查看全部成员 →</button>
      </article>)}
    </div>{roster.filter(m => m.id === 'recvxyICzHj5HJ').map(m => <button key={m.id} className="ln-home-solo" data-loona-member-trigger={`loona:solo:${m.id}`} onClick={() => homeMember(m, 'solo')}>{name(m)} / YEOJIN · SOLO →</button>)}</section>
    <section className="ln-home-section ln-home-history"><h2>一路走来</h2><div className="ln-home-history-grid">{loonaHomeHistory.map(event => <article key={event.id}><time dateTime={event.eventDate?.value}>{event.eventDate?.value.slice(0, 7).replace('-', '.')}</time><p>{event.id === 'e-loona-monthly-member-reveal-project' ? '逐月成员企划启动' : event.id === 'e-loona-complete-group-debut' ? '十二人完整体出道' : '[X X] · Butterfly'}</p></article>)}</div><button onClick={() => navigate({section: 'updates', member: null})}>浏览完整时间轴 →</button></section>
  </div>;
}
