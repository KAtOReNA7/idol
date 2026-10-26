const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..'), cache = new Map();
exports.load = function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const result = esbuild.buildSync({entryPoints: [path.join(root, relative)], absWorkingDir: root, bundle: true, write: false, platform: 'node', format: 'cjs', logLevel: 'silent', external: ['react', 'react-dom', 'react-dom/server'], loader: {'.css': 'empty'}});
  const filename = path.join(root, 'tests', '.sol-review-test-module.cjs');
  const module = new Module(filename); module.filename = filename; module.paths = Module._nodeModulePaths(path.dirname(filename)); module._compile(result.outputFiles[0].text, filename);
  cache.set(relative, module.exports); return module.exports;
};
exports.syntheticCatalog = function syntheticCatalog(slug) {
  const ids=JSON.parse(fs.readFileSync(path.join(root,'data/public-artist-identity-map.json'))).groups[slug];
  const source=JSON.parse(fs.readFileSync(path.join(root,`data/design-review/${slug}-sol-v1.json`)));
  return {scope:{type:'artist',groupId:ids.groupId},groups:[{id:ids.groupId,name:slug,note:'PRIVATE_GROUP_SENTINEL'}],members:source.members.map(row=>({id:row.id,name:row.stageName,cnName:row.name,stageName:row.stageName,groupIds:slug==='rescene'?[ids.groupId]:[],formerGroupIds:slug==='purplekiss'?[ids.groupId]:[],note:'PRIVATE_MEMBER_SENTINEL',favorite:9.87654,profile:'PRIVATE_PROFILE_SENTINEL',photo:null})),works:ids.media.map(row=>({id:row.workId,groupIds:[ids.groupId],name:row.key,song:row.key,url:row.url,stage:null,placeholder:null,score:9.87654,stageScore:1.23456,note:'PRIVATE_WORK_SENTINEL',watched:'PRIVATE_WATCH_SENTINEL',ratingIds:[],releaseDate:'',officialTitle:row.key})),ratings:[{memory:'PRIVATE_RATING_SENTINEL'}],mode:'live',capturedAt:'2026-10-20',loadedAt:'2026-10-20',warning:null,counts:{}};
};
