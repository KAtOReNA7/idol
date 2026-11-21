import type {Member, Work} from '@/lib/idol/types';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {videoId} from '@/lib/idol/values';
import {ReliableImage} from '@/components/reliable-image';
import type {Release} from './catalog';
import direction from './art-direction.json';
import starshipProfile from '@/data/ive-love-dive-archive.json';

const minePhotography = 'https://www.genie.co.kr/magazine/subMain?mgz_seq=13648';
const originalDirectory = '/artist/ive/redesign-20261025/';
const periods = [
  {
    release: 'ive-release-love-dive', title: 'LOVE DIVE', date: '2022.04',
    image: starshipProfile.image, original: starshipProfile.original,
    caption: starshipProfile.caption, source: starshipProfile.sourceUrl, credit: 'STARSHIP 官网档案',
    videos: [{id:'recvxyHuKMaCIP', video:'Y8JFxS1HlDo', title:'LOVE DIVE'}],
  },
  {
    release: 'ive-release-ive-mine', title: 'I’VE MINE', date: '2023.10',
    image: '/artist/ive/ive-mine/group.webp', original: originalDirectory+'Mgz_Main_Top_20231013101216.jpg',
    caption: 'IVE《I’VE MINE》· Baddie 六人团照', source: minePhotography, credit: 'Genie 发行特辑',
    videos: [
      {id:'recvxyHuKMfJi3', video:'_Hu4GYtye5U', title:'Either Way'},
      {id:'recvxyHuKMScGV', video:'_ApV7Lm87cg', title:'Off The Record'},
      {id:'recvxyHuKMEnUT', video:'Da4P2uT4mVc', title:'Baddie'},
    ],
  },
];

// Same six members in both release campaigns. The filenames below come from the
// individually captioned jacket photographs in Genie's October 2023 feature.
const lineup = [
  ['recvxyICzHJ8OM','YUJIN','20231012151002'], ['recvxyICzHwHyh','GAEUL','20231012151031'],
  ['recvxyICzH0eFB','REI','20231012151204'], ['recvxyICzH8OvK','WONYOUNG','20231012151301'],
  ['recvxyICzH6EEe','LIZ','20231012151347'], ['recvxyICzHzmaT','LEESEO','20231012151424'],
] as const;
const releasePath = (id:string) => '/artists/ive?section=works&release='+encodeURIComponent(id);
export const ivePeriodFor = (id:string) => periods.find(period => period.release === id);

export function IvePeriodLinks({active}:{active?:string}) {
  return <nav aria-label="按发行时期浏览" className="ive-period-links">
    <span>发行时期</span>
    {periods.map(period => <a key={period.release} href={releasePath(period.release)}
      aria-current={active===period.release?'page':undefined}>
      <time>{period.date}</time><strong>{period.title}</strong>
    </a>)}
  </nav>;
}

type Props = {
  period: typeof periods[number]; release: Release; members: Member[]; works: Work[];
  enlarge: (image:string, label:string)=>void; openMember:(id:string)=>void;
};

export function IvePeriod({period,release,members,works,enlarge,openMember}:Props) {
  const mine=period.release==='ive-release-ive-mine';
  const returnTo=releasePath(release.id);
  return <article className={'ive-period'+(mine?' ive-mine-period':'')} data-period={release.id}>
    <IvePeriodLinks active={release.id}/>
    <header className="ive-period-opening">
      <div className="ive-period-title"><time dateTime={release.date}>{release.date}</time>
        <h1>{period.title}</h1><p>{mine?'THE 1ST EP':'THE 2ND SINGLE ALBUM'}</p>
        <button className="ive-period-sleeve" aria-label={'放大'+period.title+'发行封面'} onClick={()=>enlarge(release.image,period.title+' 发行封面')}>
          <ReliableImage src={release.image} alt={period.title+' 发行封面'} priority/>
        </button>
      </div>
      <figure><button aria-label={'放大'+period.caption} onClick={()=>enlarge(period.original,period.caption)}>
        <ReliableImage src={period.image} alt={period.caption} priority/></button>
        <figcaption><span>{mine?'Baddie 拍摄现场':'2022 年 4 月官网团照'}</span>
          <a href={period.source} target="_blank" rel="noreferrer">{period.credit} ↗</a></figcaption>
      </figure>
    </header>
    <section className="ive-period-music"><h2>曲目与影像</h2>
      <ol className="sr-tracklist">{release.tracks?.map(track=>{
        const recording=period.videos.find(item=>item.title.toLowerCase()===track.toLowerCase());
        const work=recording&&works.find(w=>w.id===recording.id&&videoId(w.url)===recording.video);
        return <li key={track}><span>{track}</span>{recording&&<div>
          <a href={work?artistWorkUrl(work,false,returnTo):'https://www.youtube.com/watch?v='+recording.video}
            {...(!work?{target:'_blank',rel:'noreferrer'}:{})}>{work?'观看 MV':'官方 MV'}</a>
          {work&&(work.stage||work.stageSupplement?.alternatives.length)?<a href={artistWorkUrl(work,true,returnTo)}>收录舞台</a>:null}
        </div>}</li>;
      })}</ol>
    </section>
    <section className="ive-period-lineup"><h2>发行阵容</h2>
      <p>{mine?'《Baddie》唱片拍摄花絮 · 2023 年 10 月':'《LOVE DIVE》学院系列概念照 · 2022 年 3 月'}</p>
      <div>{lineup.map(([id,name,mineImage])=>{
        const dive=direction.ive.portraits[id];
        const src=mine?'/artist/ive/ive-mine/'+name.toLowerCase()+'.webp':dive.image;
        const full=mine?originalDirectory+'Mgz_Sub_IMG_'+mineImage+'.jpg':dive.original;
        return <article key={id}>
          <button className="ive-period-portrait" aria-label={'放大'+name+'时期照片'} onClick={()=>enlarge(full,name+' · '+period.title)}>
            <ReliableImage src={src} alt={name+' · '+period.title}/>
          </button>
          {members.some(m=>m.id===id)?<button className="ive-period-member" data-artist-member-trigger={id}
            data-artist-roster-action="profile" onClick={()=>openMember(id)}>{name} ↗</button>:<strong>{name}</strong>}
          <a className="ive-period-credit" href={mine?minePhotography:dive.sourceUrl} target="_blank" rel="noreferrer">照片出处 ↗</a>
        </article>;
      })}</div>
    </section>
    <footer className="ive-period-source"><a href={release.sourceUrl} target="_blank" rel="noreferrer">官网发行资料 ↗</a>
      {release.sales?.copies!=null&&<p>已核实实体销量 {release.sales.copies.toLocaleString()} · 截至 {release.sales.asOf}。{release.sales.coverageLabel}</p>}
      <a href="/artists/ive?section=works">全部发行与作品</a>
    </footer>
  </article>;
}
