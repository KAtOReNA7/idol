import {armageddonOriginals} from './artist-navigation';

export const armageddonReleaseId = 'aespa-release-armageddon';
export const armageddonCampaign = 'https://sp.wmg.jp/aespa_Armageddon/';

type Track = {title:string; lead?:boolean; workId?:string};

// Official album order. Each optional ID belongs to a separately verified original MV.
export const armageddonTracks: readonly Track[] = [
  {title:'Supernova', lead:true, workId:armageddonOriginals.Supernova},
  {title:'Armageddon', lead:true, workId:armageddonOriginals.Armageddon},
  {title:'Set The Tone'},
  {title:'Mine'},
  {title:'Licorice'},
  {title:'BAHAMA'},
  {title:'Long Chat (#♥)'},
  {title:'Prologue'},
  {title:'Live My Life', workId:armageddonOriginals['Live My Life']},
  {title:'Melody'},
];
