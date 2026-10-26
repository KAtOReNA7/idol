'use strict';
/**
 * Strict offline image-source TypeScript QA; does not run the application build.
 * Uses only exact, enumerated image-fixture substitutions for withheld inputs.
 * IMAGE_QA_NODE_MODULES can point to an already installed dependency directory.
 * node tests/image-types.cjs --scope=core|routes|all
 */
const fs = require('node:fs');
const path = require('node:path');
const sourceRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(__dirname, 'fixtures/image-reliability');
const manifest = require(path.join(fixtureRoot, 'ALIAS_MANIFEST.json'));
const registry = require(path.join(sourceRoot, 'HANDOFF/artist-registry51.json'));
const scope = (process.argv.find(value => value.startsWith('--scope=')) || '--scope=all').slice(8);
if (!['core', 'routes', 'all'].includes(scope)) throw new Error('Use --scope=core, --scope=routes or --scope=all.');

const candidates = [process.env.IMAGE_QA_NODE_MODULES, path.join(sourceRoot, 'node_modules'), path.resolve(sourceRoot, '../qa-runtime/node_modules'), ...(process.env.NODE_PATH || '').split(path.delimiter)].filter(Boolean).map(value => path.resolve(value));
const runtimeModules = candidates.find(directory => fs.existsSync(path.join(directory, 'typescript/lib/typescript.js')));
if (!runtimeModules) throw new Error('Offline TypeScript runtime unavailable. Set IMAGE_QA_NODE_MODULES; this script never installs dependencies.');
const ts = require(path.join(runtimeModules, 'typescript/lib/typescript.js'));
const exactAliases = new Map();
for (const row of manifest) {
  const target = path.resolve(sourceRoot, row.replacement);
  if (!target.startsWith(path.join(sourceRoot, 'tests') + path.sep) || !fs.existsSync(target)) throw new Error('Missing or non-test manifest target: ' + row.replacement);
  if (row.original.startsWith('@/')) exactAliases.set(row.original, target);
}
function manifestedTarget(original) {
  const row = manifest.find(item => item.original === original);
  if (!row) throw new Error('Exact fixture-manifest row unavailable: ' + original);
  return path.resolve(sourceRoot, row.replacement);
}
const journeyTarget = manifestedTarget('./journey (only lib/idol/artist-preview.ts)');
const timelineHostTarget = manifestedTarget('./artist-timeline-host (only artist components)');
const artistNames = ['artist-sample', 'illit-artist', 'expanded-artist', 'ive-artist', 'kiof-artist', 'stayc-artist', 'nmixx-artist', 'hearts2hearts-artist', 'kiiikiii-artist', 'lesserafim-artist', 'itzy-artist', 'saymyname-artist', 'katseye-artist', 'candidate-artist-experience'];
const artistFiles = artistNames.map(name => path.join(sourceRoot, 'components', name + '.tsx'));
const artistImporters = new Set(artistFiles);
const routeRoots = registry.map(group => path.join(sourceRoot, 'app/artists', group.slug, 'page.tsx'));
const coreRoots = ['lib/idol/image-presentation.ts', 'lib/idol/image-lightbox-session.ts', 'components/reliable-image.tsx', 'components/photo-lightbox.tsx', 'components/app-image-presentation.tsx'].map(filename => path.join(sourceRoot, filename));
for (const filename of [...routeRoots, ...coreRoots, ...artistFiles]) if (!fs.existsSync(filename)) throw new Error('Actual source unavailable: ' + path.relative(sourceRoot, filename));

const options = {
  target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], jsx: ts.JsxEmit.ReactJSX,
  strict: true, noEmit: true, isolatedModules: true, esModuleInterop: true,
  allowSyntheticDefaultImports: true, resolveJsonModule: true, skipLibCheck: false,
  baseUrl: sourceRoot, paths: { '@/*': ['*'] }, types: ['react', 'react-dom'], typeRoots: [path.join(runtimeModules, '@types')],
};
const diagnosticHost = {getCurrentDirectory: () => sourceRoot, getCanonicalFileName: name => name, getNewLine: () => '\n'};

function check(name, roots) {
  const observed = new Map();
  const host = ts.createCompilerHost(options, true);
  const originalRead = host.readFile.bind(host);
  host.readFile = filename => {
    if (path.resolve(filename).startsWith(path.join(sourceRoot, 'data') + path.sep)) throw new Error('Unauthorized actual data source requested: ' + filename);
    return originalRead(filename);
  };
  host.resolveModuleNames = (names, containingFile) => names.map(specifier => {
    const importer = path.resolve(containingFile);
    let target = exactAliases.get(specifier);
    if (specifier === './journey' && importer === path.join(sourceRoot, 'lib/idol/artist-preview.ts')) target = journeyTarget;
    if (specifier === './artist-timeline-host' && artistImporters.has(importer)) target = timelineHostTarget;
    if (target) {
      observed.set(specifier + '|' + importer, {original: specifier, importer: path.relative(sourceRoot, importer), replacement: path.relative(sourceRoot, target)});
      return {resolvedFileName: target, extension: target.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts, isExternalLibraryImport: false};
    }
    const resolved = ts.resolveModuleName(specifier, containingFile, options, host).resolvedModule;
    if (resolved) return resolved;
    // Resolve actual installed declaration files; never fabricate an ambient module.
    if (!specifier.startsWith('.') && !specifier.startsWith('@/') && !path.isAbsolute(specifier)) return ts.resolveModuleName(specifier, path.join(path.dirname(runtimeModules), '__offline_image_scope__.tsx'), options, host).resolvedModule;
    return undefined;
  });
  const program = ts.createProgram(roots, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const actualSources = new Set(program.getSourceFiles().map(file => path.resolve(file.fileName)));
  const checkedProduct = [...actualSources].filter(filename => filename.startsWith(sourceRoot + path.sep) && !filename.startsWith(path.join(sourceRoot, 'tests') + path.sep));
  const summary = {
    scope: name, check: 'strict noEmit isolated source TypeScript; exact image fixture aliases only',
    typescript: ts.version, runtime: runtimeModules, entryRoots: roots.map(filename => path.relative(sourceRoot, filename)),
    actualImageRootsChecked: coreRoots.filter(filename => actualSources.has(filename)).length,
    actualArtistImplementationsChecked: artistFiles.filter(filename => actualSources.has(filename)).length,
    actualRouteFilesChecked: routeRoots.filter(filename => actualSources.has(filename)).length, totalRoutes: routeRoots.length,
    productSourceFilesChecked: checkedProduct.length, observedFixtureSubstitutions: observed.size,
    diagnostics: diagnostics.length, unresolvedImportOrDeclarationDiagnostics: diagnostics.filter(item => [2307, 2688, 7016].includes(item.code)).length,
    exitCode: diagnostics.length ? 1 : 0,
    limitations: [
      'No application/framework build, App page, Editor, API, save or production records checked.',
      'Routes use enumerated synthetic content and explicit non-image history/timeline/physical/name ports; those behaviors are not verified here.',
      'All actual image modules, routed artist implementations and installed declaration files remain strictly checked without source suppressions.',
      'CSS layout, network performance, modal focus and browser behavior are outside this type check.',
    ],
  };
  console.log(JSON.stringify(summary, null, 2));
  console.log('EXACT_IMAGE_FIXTURE_SUBSTITUTIONS ' + JSON.stringify([...observed.values()], null, 2));
  if (diagnostics.length) console.log(ts.formatDiagnostics(diagnostics, diagnosticHost));
  else console.log('TYPE_CHECK_PASS ' + name);
  return summary.exitCode;
}
let code = 0;
if (scope === 'core' || scope === 'all') code = Math.max(code, check('core', coreRoots));
if (scope === 'routes' || scope === 'all') code = Math.max(code, check('routes', [...coreRoots, ...routeRoots]));
process.exitCode = code;
