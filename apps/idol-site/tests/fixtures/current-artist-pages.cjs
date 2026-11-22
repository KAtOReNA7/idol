// Exercise actual route components using the already approved repository snapshot.
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const {renderToReadableStream} = require('react-dom/server');
const esbuild = require('esbuild');
const registry = require('../../data/artist-timeline-registry.json');

const imports = registry.map(({slug}, i) => `import Page${i} from './app/artists/${slug}/page';`);
const entries = registry.map(({slug}, i) => `${JSON.stringify(slug)}:Page${i}`);
const source = [
  ...imports,
  `export const pages={${entries.join(',')}};`,
  "export {ArtistTimelineHostProvider} from './components/artist-timeline-host';",
  "export {ArtistTimeline} from './components/artist-timeline';",
  "export {PublicAccessProvider} from './components/public-access';",
  "export {projectCatalog} from './lib/idol/catalog';",
  "export {projectArtistCatalog} from './lib/idol/artist-catalog';",
  "export {projectBrowserCatalog} from './lib/idol/browser-catalog';",
  "export {loadArtistTimeline} from './lib/idol/timeline/production';",
  "export {prepareTimelinePresentation} from './lib/idol/timeline/presentation';",
].join('\n');
function bundlePages(alias = {}) {
 const bundle = esbuild.buildSync({
  stdin: {contents:source, resolveDir:process.cwd(), loader:'tsx'},
  bundle:true, write:false, platform:'node', format:'cjs', jsx:'automatic',
  external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only'],
  loader:{'.css':'empty'}, logLevel:'silent', alias,
 });
 const filename = path.resolve(__dirname,'current-artist-pages.bundle.cjs');
 const compiled = new Module(filename,module);
 compiled.filename = filename;
 compiled.paths = module.paths;
 compiled.require = name => name==='cloudflare:workers' ? {env:{}} : name==='server-only' ? {} : require(name);
 compiled._compile(bundle.outputFiles[0].text,filename);
 return compiled.exports;
}
const api = bundlePages();
const snapshot = require('../../data/snapshot.json');
const catalog = api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt);

const nativeSlugs = new Set(['ifeye','izna','udtt']);

function artistCatalog(group) {
  return api.projectBrowserCatalog(api.projectArtistCatalog(catalog, group.groupId));
}

async function renderArtist(group, query = {}, data = artistCatalog(group), options = {}, renderer = api) {
  const search = new URLSearchParams(query).toString();
  const serverRoute = group.path + (search ? '?' + search : '');
  const {canEdit, ...hostOptions} = options;
  const page = React.createElement(renderer.ArtistTimelineHostProvider,
    {value: {catalog: data, serverRoute, ...hostOptions}},
    React.createElement(renderer.pages[group.slug], {searchParams: Promise.resolve(query)}));
  const node = canEdit === undefined ? page : React.createElement(renderer.PublicAccessProvider, {canEdit}, page);
  const stream = await renderToReadableStream(node);
  await stream.allReady;
  return new Response(stream).text();
}

module.exports = {registry, nativeSlugs, artistCatalog, renderArtist, bundlePages, loadArtistTimeline:api.loadArtistTimeline, prepareTimelinePresentation:api.prepareTimelinePresentation};
