import {readFileSync, statSync} from 'node:fs';

// Run from any directory with Node. Reads public photo bindings and archived files only.
const app = new URL('../../../../apps/idol-site/', import.meta.url);
const json = file => JSON.parse(readFileSync(new URL('data/' + file, app), 'utf8'));
const bytes = path => statSync(new URL('public' + path, app)).size;
const still = '第三方具名 MV 截图';
const originals = json('mv-public-media.json').portraits;
const editions = Object.values(json('mv-recognition-editions.json'));
const groups = json('artist-timeline-registry.json');
const inventory = new Map(json('stages/inventory.json').works.map(w => [w.recordId, w]));
const slugById = new Map(groups.map(g => [g.groupId, g.slug]));
const slugFor = workId => slugById.get(inventory.get(workId).groupIds[0]);
const perGroup = Object.fromEntries(groups.map(g => [g.slug, {works: 0, cards: 0, before: 0, replaced: 0, remaining: 0}]));
const key = (work, video, member) => [work, video, member].join('/');
const byIdentity = new Map(originals.map(r => [key(r.workId, r.videoId, r.memberId), r]));
for (const row of originals) {
  if (row.label === still) perGroup[slugFor(row.workId)].before++;
}
const prior = [], current = [], originalLabels = {}, distinctNewOriginals = new Set(), works = new Set();
for (const edition of editions) {
  for (const binding of edition.works) {
    if (works.has(binding.workId)) throw Error('Duplicate work ' + binding.workId);
    works.add(binding.workId);
    const group = perGroup[slugFor(binding.workId)];
    group.works++;
    for (const memberId of binding.memberIds) {
      const old = byIdentity.get(key(binding.workId, binding.videoId, memberId));
      const selected = edition.portraits[memberId];
      if (!old || !selected) throw Error('Missing identity ' + memberId);
      group.cards++;
      if (old.label === still) group.replaced++;
      originalLabels[old.label] = (originalLabels[old.label] ?? 0) + 1;
      prior.push(old.src);
      current.push(selected.preview);
      distinctNewOriginals.add(selected.original);
    }
  }
}
for (const group of Object.values(perGroup)) group.remaining = group.before - group.replaced;
const amount = paths => [...paths].reduce((sum, item) => sum + bytes(item), 0);
const photoBytes = paths => ({cardOccurrences: amount(paths), distinctPaths: new Set(paths).size, distinctBytes: amount(new Set(paths))});
const totalStill = Object.values(perGroup).reduce((n, g) => n + g.before, 0);
console.log(JSON.stringify({
  existingWorkMemberBindings: originals.length, groupsWithChanges: Object.values(perGroup).filter(g => g.cards).length,
  works: works.size, cards: current.length, series: editions.length, distinctSelectedOriginals: distinctNewOriginals.size,
  beforeStill: totalStill, replacedStill: originalLabels[still], remainingStill: totalStill - originalLabels[still],
  replacedOriginalLabels: originalLabels,
  previewFileBytes: {before: photoBytes(prior), after: photoBytes(current)},
  perGroup
}, null, 2));
