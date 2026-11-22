import {dripOriginals} from './artist-navigation';

export const dripReleaseId = 'drip';
export const dripCardId = 'babymonster-release-' + dripReleaseId;
export const dripCoverOriginal = '/artist/babymonster/cover-drip.jpg';
export const dripSource = 'https://www.ygfamily.com/en/artists/babymonster/discography/1615';

type DripTrack = {
  title: string;
  workId?: string;
  lead?: boolean;
  performanceVideo?: boolean;
};

export const dripTracks: readonly DripTrack[] = [
  {title:'CLIK CLAK', workId:dripOriginals['CLIK CLAK'], lead:true},
  {title:'DRIP', workId:dripOriginals.DRIP, lead:true},
  {title:'Love, Maybe'},
  {title:'Really Like You', workId:dripOriginals['Really Like You']},
  {title:'BILLIONAIRE', workId:dripOriginals.BILLIONAIRE, performanceVideo:true},
  {title:'Love In My Heart', workId:dripOriginals['Love In My Heart']},
  {title:'Woke Up In Tokyo (RUKA & ASA)'},
  {title:'FOREVER', workId:dripOriginals.FOREVER},
  {title:'BATTER UP (Remix)'},
];
