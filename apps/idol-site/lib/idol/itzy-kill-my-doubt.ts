import {killMyDoubtOriginals} from './artist-navigation';

export const killMyDoubtReleaseId = 'source-itzy-r4uyqzku';
export const killMyDoubtCoverPreview = '/artist/itzy/kill-my-doubt/cover-480.webp';
const largeCoverPreview = '/artist/itzy/kill-my-doubt/cover-720.webp';
export const killMyDoubtCoverSet = `${killMyDoubtCoverPreview} 480w, ${largeCoverPreview} 720w`;

type Track = {title: string; workId?: string; lead?: boolean};

export const killMyDoubtTracks: readonly Track[] = [
  {title: 'BET ON ME', workId: killMyDoubtOriginals['BET ON ME']},
  {title: 'CAKE', workId: killMyDoubtOriginals.CAKE, lead: true},
  {title: 'None of My Business', workId: killMyDoubtOriginals['None of My Business']},
  {title: 'Bratty (나쁜 애)'},
  {title: 'Psychic Lover'},
  {title: 'Kill Shot'},
];
