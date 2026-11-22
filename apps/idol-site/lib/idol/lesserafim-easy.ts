import {easyOriginals} from './artist-navigation';

export const easyReleaseId = '12';
export const easyCardId = 'lesserafim-release-' + easyReleaseId;

export type EasyPreviews = {imagePreview?: string; imagePreviewLarge?: string};

export function easyPreviewSet({imagePreview, imagePreviewLarge}: EasyPreviews) {
  return imagePreview && imagePreviewLarge ? imagePreview + ' 480w, ' + imagePreviewLarge + ' 720w' : undefined;
}

type Track = {title: string; duration: string; lead?: boolean; workId?: string};

export const easyTracks: readonly Track[] = [
  {title:'Good Bones', duration:'2:40'},
  {title:'EASY', duration:'2:45', lead:true, workId:easyOriginals.EASY},
  {title:'Swan Song', duration:'2:37'},
  {title:'Smart', duration:'2:46', workId:easyOriginals.Smart},
  {title:'We got so much', duration:'2:46'},
];
