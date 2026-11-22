import {createRequire} from 'node:module';
export {capturePortraitBaseline, checkReleasePortraits} from './everglow-slay-portraits.mjs';

const require = createRequire(import.meta.url);
const release = require('../evidence/20261122-member-release-portraits/wooah-qurious-candidates.json');
const previousPhotos = require('../../../apps/idol-site/data/mv-public-media.json').portraits;

// The two editions share their new release portraits. Each old MV still belongs to its own recording.
export const quriousWorks = release.works.map(work => ({
  ...work,
  portraits: release.photos.map(person => {
    const old = previousPhotos.find(row => row.workId === work.workId && row.videoId === work.videoId && row.memberId === person.memberId);
    if (!old) throw Error('缺少原作品图 ' + work.title + ' · ' + person.member);
    return {
      name: person.member, memberId: person.memberId,
      previousDefault: person.currentCard, previousDefaultBytes: person.currentCardBytes,
      preview: '/artist/recognition-editions/wooah/qurious-2020-' + person.member.toLowerCase() + '.card.webp',
      previewDimensions: [480, 640], previewBytes: person.temporaryCardBytes,
      original: person.fullPhotoUrl, originalDimensions: person.fullPhotoDimensions,
      retainedWorkPhoto: old.src, retainedWorkDimensions: [old.width, old.height],
    };
  }),
}));
