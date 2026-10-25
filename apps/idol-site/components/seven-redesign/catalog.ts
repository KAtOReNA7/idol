import madein from '@/data/madein-artist.json';
import qwerReleases from '@/public/artist/qwer/redesign-20261025/releases.json';
import qwer from '@/data/qwer-artist.json';
import purplekiss from '@/data/purplekiss-artist.json';
import ive from '@/data/ive-artist.json';
import iveFilms from '@/data/ive-soft-issue.json';
import triples from '@/data/triples-artist.json';
import rescene from '@/data/rescene-artist.json';
import illit from '@/data/illit-artist.json';
import purpleData from '@/data/design-review/purplekiss-sol-v1.json';
import resceneData from '@/data/design-review/rescene-sol-v1.json';
import madeinReleases from '@/data/madein-releases.json';
import {triplesPublicReleases,triplesPublicVideos,triplesPublicStages} from '@/lib/idol/triples-design-catalog';
import type {CandidatePortrait,CandidateContent} from '@/lib/idol/candidate/types';

export type SevenSlug='madein'|'qwer'|'purplekiss'|'ive'|'triples'|'rescene'|'illit';
export type Release={id:string;title:string;date:string;image:string;sourceUrl:string;type?:string;tracks?:string[];workIds?:string[];sales?:{copies:number|null;asOf:string;coverageLabel?:string;cumulativeComplete?:boolean}|null};
export type Film={id:string;title:string;image:string;sourceUrl:string;date:string;kind:string;releaseId?:string};
export type SevenDesign={slug:SevenSlug;groupId:string;name:string;era:string;reference:string;hero:string;heroCaption:string;logo?:string;portraits:Record<string,CandidatePortrait>;memberVisuals?:Record<string,{image:string;sourceUrl:string;label:string}>;rosterNote:string;releases:Release[];films:Film[];intro:string};
const archiveReleases=(d:typeof purpleData|typeof resceneData):Release[]=>d.works.filter(w=>w.kind==='release').map(w=>({id:w.key,title:w.title,date:w.date??'',image:w.image,sourceUrl:w.url,type:w.subtype,tracks:w.tracks}));
const archiveFilms=(d:typeof purpleData|typeof resceneData):Film[]=>d.works.filter(w=>w.kind==='mv'||w.kind==='stage').map(w=>({id:w.key,title:w.title,date:w.date??'',image:w.image,sourceUrl:w.url,kind:w.kind,releaseId:w.releaseId??undefined}));
const asset=(s:SevenSlug,f:string)=>`/artist/${s}/redesign-20261025/${f}`;
const candidate=(d:CandidateContent):Pick<SevenDesign,'groupId'|'name'|'portraits'|'rosterNote'|'intro'>=>({groupId:d.groupId,name:d.name,portraits:d.portraits,rosterNote:d.rosterNote,intro:d.intro});
export const sevenDesigns:Record<SevenSlug,SevenDesign>={
 madein:{...candidate(madein),slug:'madein',era:'Super Obvious',reference:'https://www.madein-official.net/',hero:asset('madein','hero-desktop.jpg'),heroCaption:'Super Obvious · 日本官网首页四人宣传照；成员状态见档案',logo:asset('madein','logo-white.png'),releases:madeinReleases.map(r=>({id:r.key,title:r.title,date:('releaseDate'in r?r.releaseDate:r.catalogueDate)??'',image:r.key==='madein-rise'?'/artist/madein/figma-20261017/rise-cover.jpg':r.key==='madein-forever'?'/artist/madein/figma-20261017/madein-forever-cover.jpg':r.key==='madein-girl-meets-boy'?'/artist/madein/figma-20261017/girl-meets-boy-cover.jpg':'',sourceUrl:'https://www.madein-official.net/',workIds:r.workIds,...('extraTrack'in r?{tracks:[r.extraTrack!]}:{})})),films:[]},
 qwer:{...candidate(qwer),slug:'qwer',era:'QWER · LIVE & MUSIC',reference:'https://qwerjapan.com/',hero:asset('qwer','hero-band.jpeg'),heroCaption:'QWER 日本官网 · 四人乐队宣传照',logo:asset('qwer','logo.png'),releases:qwerReleases.releases.map(r=>({...r,image:r.cover})),films:[]},
 purplekiss:{...candidate(purplekiss),slug:'purplekiss',era:'HIDE & SEEK',reference:'https://m.melon.com/musicstory/detail.htm?mstorySeq=11666',hero:asset('purplekiss','official-group-01.jpg'),heroCaption:'HIDE & SEEK · 2021 年七人时期官方宣传照',releases:archiveReleases(purpleData),films:archiveFilms(purpleData)},
 ive:{slug:'ive',groupId:ive.groupId,name:'IVE',era:'I’VE MINE',reference:'https://www.genie.co.kr/magazine/subMain?mgz_seq=13648',hero:ive.hero.image,heroCaption:'I’VE MINE · Baddie · 2023 年官方宣传照',portraits:{},memberVisuals:ive.memberVisuals,rosterNote:'六位成员 · 成员身份与个人记录保持原始资料绑定。',intro:ive.profile.summary,releases:ive.releases.map(r=>({id:r.id,title:r.title,date:r.date,image:r.image,sourceUrl:r.sourceUrl,type:r.type,tracks:'trackLists'in r?r.trackLists.flat():[],sales:r.circle})),films:iveFilms.media.map(f=>({...f}))},
 triples:{...candidate(triples),slug:'triples',name:'tripleS',era:'24 MEMBERS. ONE tripleS.',reference:'https://www.triples-official.jp/',hero:triples.hero.image,heroCaption:'tripleS 日本官网 · 24 人团体照',releases:triplesPublicReleases.map(r=>({id:r.key,title:r.title,date:r.date??'',image:r.localImage,sourceUrl:r.sourceUrl,type:r.kind})),films:[...triplesPublicVideos,...triplesPublicStages].map(f=>({id:f.key,title:f.title,image:f.localImage,sourceUrl:f.officialUrl??f.sourceUrl,date:f.date??'',kind:f.kind,releaseId:f.releaseKey}))},
 rescene:{...candidate(rescene),slug:'rescene',era:'RESCENE',reference:'https://themuze.kr/rescene',hero:asset('rescene','official-hero.jpg'),heroCaption:'THE MUZE 官方 RESCENE 五人宣传照 · 拍摄日期未注明',releases:archiveReleases(resceneData),films:archiveFilms(resceneData)},
 illit:{slug:'illit',groupId:illit.groupId,name:'ILLIT',era:'SUPER REAL ME',reference:'https://beliftlab.com/artist/discography/ILLIT/8',hero:asset('illit','real-me-41.jpg'),heroCaption:'SUPER REAL ME · REAL ME · 2024 年五人官方概念照',portraits:{},memberVisuals:illit.memberVisuals,rosterNote:'五位成员 · 单人资料照使用具名 SUPER ME 官方概念照。',intro:illit.profile.summary,releases:illit.releases.map(r=>({id:r.id,title:r.title,date:r.date,image:r.image,sourceUrl:r.sourceUrl,type:r.type,sales:r.circle})),films:[]},
};
export const sevenByGroup=(id:string)=>Object.values(sevenDesigns).find(d=>d.groupId===id);
