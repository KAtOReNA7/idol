import type {Work} from '../types';
import {videoId} from '../values';
const base='/artist/meovv/figma-20261017/';
export const MEOVV_LOGO=base+'meovv-logo-white.png';
export const MEOVV_HERO=base+'group-spotify-hero.jpg';
// Display assets are bound to both existing work identity and the exact video.
// Covers are never used as music-video or stage stills.
export const MEOVV_VIDEO_ART:Readonly<Record<string,{videoId:string;src:string}>>={
 rec28ldfRTrB45:{videoId:'jpLHg-AsQV0',src:base+'meow-mv-spotify.jpg'},
 rec28ldfRTrJ3E:{videoId:'8F61FXiYpP0',src:base+'toxic-mv-spotify.jpg'},
 rec28ldfRTrJ7M:{videoId:'yFGsw8phPn4',src:base+'body-mv-spotify.jpg'},
 rec28ldfRTrJc9:{videoId:'sL0pCS6K9bc',src:base+'hands-up-mv-spotify.jpg'},
 rec28ldfRTrJgk:{videoId:'l4On7TQoM-M',src:base+'drop-top-mv-spotify.jpg'},
 rec28ldfRTrJro:{videoId:'hlULtigNNao',src:base+'burning-up-mv-spotify.jpg'},
 rec28ldfRTrJDu:{videoId:'9ARSmN2Fj7s',src:base+'in-my-hands-mv-spotify.jpg'},
 rec28ldfRTrLsE:{videoId:'vYq_Xzj8HUM',src:base+'hit-em-mv-spotify.jpg'},
};
export function meovvVideoArt(work:Pick<Work,'id'|'url'|'stage'>,stage=false):string|null{
 const art=MEOVV_VIDEO_ART[work.id];
 const id=stage?work.stage?.videoId:videoId(work.url);
 if(stage&&(!work.stage||work.stage.clip||work.stage.url!==`https://www.youtube.com/watch?v=${id}`))return null;
 // Exact NPOP image-layer export retained in the approved Figma asset package.
 if(stage&&work.id==='rec28ldfRTrB45'&&id==='118STdpg-fY')return base+'meow-npop-figma-render.png';
 return art&&id===art.videoId?art.src:null;
}
export const MEOVV_RELEASES=[
 {title:'MEOW',src:'/artist/meovv/release-meow.jpg',year:'2024',kind:'单曲',workId:'rec28ldfRTrB45'},
 {title:'TOXIC',src:'/artist/meovv/release-toxic.jpg',year:'2024',kind:'单曲',workId:'rec28ldfRTrJ3E'},
 {title:'HANDS UP',src:base+'hands-up-cover.jpg',year:'2025',kind:'单曲',workId:'rec28ldfRTrJc9'},
 {title:'BURNING UP',src:base+'burning-up-cover.jpg',year:'2025',kind:'单曲',workId:'rec28ldfRTrJro'},
 {title:'BITE NOW',src:base+'bite-now-cover.jpg',year:'2026',kind:'EP',workId:null},
 {title:'MY EYES OPEN VVIDE',src:'/artist/meovv/release-repairs-20261018/meovv-my-eyes-open-vvide.jpg',year:'2025',kind:'EP',workId:'rec28ldfRTrJgk',releaseDate:'2025-05-12',sourceUrl:'https://www.universal-music.co.jp/meovv/news/2025-05-12/'},
 {title:'ME ME ME',src:'/artist/meovv/release-repairs-20261018/meovv-me-me-me.png',year:'2025',kind:'日本数字单曲',workId:null,releaseDate:'2025-07-29',sourceUrl:'https://www.universal-music.co.jp/meovv/news/2025-07-29-3/'},
 {title:'GO HARD',src:'/artist/meovv/release-repairs-20261018/meovv-go-hard.jpg',year:'2026',kind:'单曲专辑',workId:null,releaseDate:'2026-10-12',sourceUrl:'https://www.universal-music.co.jp/meovv/news/2026-10-12/'},
] as const;
