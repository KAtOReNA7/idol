const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..'), cache = new Map();
exports.load = function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const result = esbuild.buildSync({entryPoints: [path.join(root, relative)], absWorkingDir: root, bundle: true, write: false, platform: 'node', format: 'cjs', logLevel: 'silent', external: ['react', 'react-dom', 'react-dom/server'], loader: {'.css': 'empty'}});
  const filename = path.join(root, 'tests', '.triples-review-test-module.cjs');
  const module = new Module(filename); module.filename = filename; module.paths = Module._nodeModulePaths(path.dirname(filename)); module._compile(result.outputFiles[0].text, filename);
  cache.set(relative, module.exports); return module.exports;
};
exports.syntheticCatalog = function syntheticCatalog() {
  const identities = JSON.parse(fs.readFileSync(path.join(root, 'data/public-artist-identity-map.json'))).groups.triples;
  const evidence = JSON.parse(fs.readFileSync(path.join(root, 'data/triples/identity-evidence.json')));
  const workMap = new Map();
  for (const media of identities.media) {
    let work = workMap.get(media.workId);
    if (!work) {work = {id: media.workId, groupIds: [identities.groupId], name: media.key, song: media.key, url: '', stage: null, placeholder: null, score: 9.87654, stageScore: 1.23456, note: 'PRIVATE_WORK_SENTINEL', watched: 'PRIVATE_WATCH_SENTINEL', ratingIds: [], releaseDate: '', officialTitle: media.key}; workMap.set(media.workId, work);}
    if (media.kind === 'mv') work.url = media.url;
    else work.stage = {videoId: media.videoId, url: media.url, scoreBinding: {videoId: media.videoId, sourceKey: media.videoId}, title: media.key};
  }
  return {scope: {type: 'artist', groupId: identities.groupId}, groups: [{id: identities.groupId, name: 'tripleS', note: 'PRIVATE_GROUP_SENTINEL'}], members: evidence.entries.map(row => ({id: row.memberId, name: row.officialStageName, cnName: '', stageName: row.officialStageName, groupIds: [identities.groupId], formerGroupIds: [], note: 'PRIVATE_MEMBER_SENTINEL', favorite: 9.87654, profile: 'PRIVATE_PROFILE_SENTINEL', photo: null})), works: [...workMap.values()], ratings: [{memory: 'PRIVATE_RATING_SENTINEL'}], mode: 'live', capturedAt: '2026-10-20', loadedAt: '2026-10-20', warning: null, counts: {}};
};
