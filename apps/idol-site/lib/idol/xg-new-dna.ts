import {newDnaOriginals} from './artist-navigation';

export const newDnaReleaseId = 'xg-directory-20';
export const newDnaCampaign = 'https://xg-newdna.com/en/';

type Track = {title: string; workId?: string};

// The album's NEW DANCE video was released in August.
export const newDnaTracks: readonly Track[] = [
  {title: 'HESONOO'},
  {title: 'X-GENE'},
  {title: 'GRL GVNG', workId: newDnaOriginals['GRL GVNG']},
  {title: 'TGIF', workId: newDnaOriginals.TGIF},
  {title: 'NEW DANCE', workId: newDnaOriginals['NEW DANCE']},
  {title: 'PUPPET SHOW', workId: newDnaOriginals['PUPPET SHOW']},
];
