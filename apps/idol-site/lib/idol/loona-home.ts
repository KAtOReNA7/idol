import timeline from '@/data/artist-timelines/loona.json';
import type {Member, Work} from './types';
import {LOONA_GROUP_ID} from './loona-curation';

export const loonaHomeAsset = (file: string) => `/artist/loona/approved-home/${file}`;
// Release identity and date come from the existing reviewed timeline, never an MV date.
const releaseSlots = [
  {eventId: 'e-loona-xx-kr-repackage', title: '[X X]', file: 'butterfly-album.jpg', song: 'Butterfly'},
  {eventId: 'e-loona-hash-kr-release', title: '[#]', file: 'so-what-album.jpg', song: 'So What'},
  {eventId: 'e-loona-and-release', title: '[&]', file: 'ptt-album.jpg', song: 'PTT (Paint The Town)'},
  {eventId: 'e-loona-luminous-japan-single-plan', title: 'LUMINOUS', file: 'luminous.png', song: 'LUMINOUS'},
];
function exactWork(works: readonly Work[], id: string | undefined, song: string) {
  const matches = works.filter(work => work.id === id && work.groupIds.includes(LOONA_GROUP_ID));
  return matches.length === 1 && matches[0].song === song ? matches[0] : undefined;
}
export function loonaHomeReleases(works: readonly Work[]) {
  return releaseSlots.map(slot => {
    const event = timeline.events.find(item => item.id === slot.eventId)!;
    return {...slot, date: event.eventDate!.value, work: exactWork(works, event.workIds[0], slot.song), releaseKey: event.releaseKey};
  });
}
const videoSlots = [
  {id: 'recvxyOz5X7G95', song: 'Butterfly', file: 'butterfly.jpg'},
  {id: 'recvxyOz5XKztg', song: 'Flip That', file: 'flip-that.jpg'},
  {id: 'recvxyOz5XLBUV', song: 'Star', file: 'star.jpg'},
  {id: 'recvxyOz5XL5xq', song: 'Why Not?', file: 'why-not.jpg'},
];
export function loonaHomeVideos(works: readonly Work[]) {
  return videoSlots.map(slot => ({...slot, work: exactWork(works, slot.id, slot.song)}));
}
const portraitSlots = [
  ['recvxyICzHkFju', 'HEEJIN', 'heejin.jpg'], ['recvxyICzHMcHc', 'HYUNJIN', 'hyunjin.jpg'],
  ['recvxyICzHzxW0', 'HASEUL', 'haseul.jpg'], ['recvxyICzHj5HJ', 'YEOJIN', 'yeojin.jpg'],
  ['recvxyICzHcv3M', 'VIVI', 'vivi.jpg'], ['recvxyICzHrAo6', 'KIM LIP', 'kim-lip.jpg'],
  ['recvxyICzHQpJU', 'JINSOUL', 'jinsoul.jpg'], ['recvxyICzH78Q7', 'CHOERRY', 'choerry.jpg'],
  ['recvxyICzHYN3y', 'YVES', 'yves.jpg'], ['recvxyICzHTm4b', 'CHUU', 'chuu.jpg'],
  ['recvxyICzHbSOh', 'GOWON', 'gowon.jpg'], ['recvxyICzHRB0v', 'OLIVIA HYE', 'olivia-hye.jpg'],
];
export function loonaHomePortrait(member: Member) {
  const slot = portraitSlots.find(([id, stageName]) => member.id === id && member.stageName === stageName);
  return slot ? loonaHomeAsset(slot[2]) : undefined;
}
export const loonaHomeUnits = [
  {key: '13', title: 'LOONA 1/3', width: 250, height: 76, members: ['recvxyICzHkFju', 'recvxyICzHMcHc', 'recvxyICzHzxW0', 'recvxyICzHcv3M']},
  {key: 'oec', title: 'ODD EYE CIRCLE', width: 360, height: 37, members: ['recvxyICzHrAo6', 'recvxyICzHQpJU', 'recvxyICzH78Q7']},
  {key: 'yyxy', title: 'LOONA yyxy', width: 200, height: 33, members: ['recvxyICzHYN3y', 'recvxyICzHTm4b', 'recvxyICzHbSOh', 'recvxyICzHRB0v']},
];
export const loonaHomeHistory = ['e-loona-monthly-member-reveal-project', 'e-loona-complete-group-debut', 'e-loona-xx-kr-repackage'].map(id => timeline.events.find(event => event.id === id)!);
