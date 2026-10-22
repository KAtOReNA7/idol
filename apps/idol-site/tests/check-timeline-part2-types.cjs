'use strict';
/**
 * Offline scoped TypeScript QA. This is not the framework build or a check of
 * withheld real data/name metadata/journey implementation. Only exact approved
 * test substitutions in ALIAS_MANIFEST.json are permitted; no module stubs.
 *
 * node tests/check-timeline-part2-types.cjs --scope=core|routes|all
 * TIMELINE_QA_NODE_MODULES may point to an existing dependency directory.
 */
const fs = require('node:fs');
const path = require('node:path');
const sourceRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(__dirname, 'fixtures/timeline-host');
const manifest = require(path.join(fixtureRoot, 'ALIAS_MANIFEST.json'));
const registry = require(path.join(sourceRoot, 'HANDOFF/artist-registry51.json'));
const scope = (process.argv.find(argument => argument.startsWith('--scope=')) || '--scope=all').slice(8);
if (!['core', 'routes', 'all'].includes(scope)) throw new Error('Use --scope=core, --scope=routes or --scope=all.');

const runtimeCandidates = [
  process.env.TIMELINE_QA_NODE_MODULES,
  path.join(sourceRoot, 'node_modules'),
  path.resolve(sourceRoot, '../qa-runtime/node_modules'),
  ...(process.env.NODE_PATH || '').split(path.delimiter),
].filter(Boolean).map(value => path.resolve(value));
const runtimeModules = runtimeCandidates.find(directory => fs.existsSync(path.join(directory, 'typescript/lib/typescript.js')));
if (!runtimeModules) throw new Error('Existing offline TypeScript runtime was not found. Set TIMELINE_QA_NODE_MODULES; this script never installs packages.');
const ts = require(path.join(runtimeModules, 'typescript/lib/typescript.js'));
const exactAliases = new Map();
for (const row of manifest) {
  const target = path.resolve(sourceRoot, row.replacement);
  if (!target.startsWith(fixtureRoot + path.sep) || !fs.existsSync(target)) throw new Error('Explicit fixture alias target is unavailable: ' + row.replacement);
  if (row.original.startsWith('@/')) exactAliases.set(row.original, target);
}
const journeyImporter = path.join(sourceRoot, 'lib/idol/artist-preview.ts');
const journeyRow = manifest.find(row => row.original === './journey (only importer lib/idol/artist-preview.ts)');
if (!journeyRow) throw new Error('The importer-scoped journey alias is missing from the explicit manifest.');
const journeyTarget = path.resolve(sourceRoot, journeyRow.replacement);
const actualRouteRoots = registry.map(group => path.join(sourceRoot, 'app/artists', group.slug, 'page.tsx'));
for (const route of actualRouteRoots) if (!fs.existsSync(route)) throw new Error('Actual route source is missing: ' + route);
const coreRoots = fs.readdirSync(path.join(sourceRoot, 'lib/idol/timeline'))
  .filter(name => name.endsWith('.ts')).map(name => path.join(sourceRoot, 'lib/idol/timeline', name));
coreRoots.push(...['artist-timeline.tsx', 'artist-timeline-host.tsx', 'use-timeline-return.ts'].map(name => path.join(sourceRoot, 'components', name)));
const routeRoots = [...coreRoots, ...actualRouteRoots,
  path.join(sourceRoot, 'lib/idol/artist-navigation.ts'),
  path.join(sourceRoot, 'lib/idol/artist-preview.ts'),
];
const options = {
  target: ts.ScriptTarget.ES2017,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noEmit: true,
  isolatedModules: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  baseUrl: sourceRoot,
  paths: { '@/*': ['*'] },
  types: ['react', 'react-dom'],
  typeRoots: [path.join(runtimeModules, '@types')],
};
const diagnosticHost = {
  getCurrentDirectory: () => sourceRoot,
  getCanonicalFileName: name => name,
  getNewLine: () => '\n',
};

function check(name, roots) {
  const observed = new Map();
  const host = ts.createCompilerHost(options, true);
  const readFile = host.readFile.bind(host);
  host.readFile = filename => {
    if (path.resolve(filename).startsWith(path.join(sourceRoot, 'data') + path.sep)) throw new Error('Unauthorized actual data source requested: ' + filename);
    return readFile(filename);
  };
  host.resolveModuleNames = (names, containingFile) => names.map(specifier => {
    let target = exactAliases.get(specifier);
    if (specifier === './journey' && path.resolve(containingFile) === journeyImporter) target = journeyTarget;
    if (target) {
      observed.set(specifier + '|' + containingFile, { original: specifier, importer: path.relative(sourceRoot, containingFile), replacement: path.relative(sourceRoot, target) });
      return { resolvedFileName: target, extension: ts.Extension.Ts, isExternalLibraryImport: false };
    }
    const resolved = ts.resolveModuleName(specifier, containingFile, options, host).resolvedModule;
    if (resolved) return resolved;
    // Resolve real installed React/lucide declarations from the existing offline
    // runtime. This fallback does not synthesize declarations or resolve data.
    if (!specifier.startsWith('.') && !specifier.startsWith('@/') && !path.isAbsolute(specifier)) {
      return ts.resolveModuleName(specifier, path.join(path.dirname(runtimeModules), '__offline_scope__.tsx'), options, host).resolvedModule;
    }
    return undefined;
  });
  const program = ts.createProgram(roots, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const actualSources = new Set(program.getSourceFiles().map(file => path.resolve(file.fileName)));
  const routeCount = actualRouteRoots.filter(filename => actualSources.has(filename)).length;
  const productSources = [...actualSources].filter(filename => filename.startsWith(sourceRoot + path.sep) && !filename.startsWith(fixtureRoot + path.sep));
  const missingImports = diagnostics.filter(diagnostic => [2307, 2688, 7016].includes(diagnostic.code));
  const summary = {
    scope: name,
    check: 'strict scoped TypeScript, noEmit, actual source modules with exact test-content substitutions',
    typescript: ts.version,
    runtime: runtimeModules,
    entryRoots: roots.map(filename => path.relative(sourceRoot, filename)),
    actualRouteFilesChecked: routeCount,
    totalActualRoutes: actualRouteRoots.length,
    productSourceFilesChecked: productSources.length,
    fixtureSubstitutionCount: observed.size,
    diagnostics: diagnostics.length,
    missingImportOrDeclarationDiagnostics: missingImports.length,
    exitCode: diagnostics.length === 0 ? 0 : 1,
    limitations: [
      'No full framework build, no global app/journey/API/save implementation or production data checked.',
      'Real facts/name metadata/physical records replaced only via enumerated ALIAS_MANIFEST fixture sources.',
      'skipLibCheck skips declaration-package internals; product and fixture TypeScript remain strict.',
      'CSS layout and browser behavior are outside this type check.',
    ],
  };
  console.log(JSON.stringify(summary, null, 2));
  console.log('EXACT_FIXTURE_SUBSTITUTIONS ' + JSON.stringify([...observed.values()], null, 2));
  if (diagnostics.length) console.log(ts.formatDiagnostics(diagnostics, diagnosticHost));
  else console.log('TYPE_CHECK_PASS ' + name);
  return summary.exitCode;
}

let exitCode = 0;
if (scope === 'all' || scope === 'core') exitCode = Math.max(exitCode, check('core', coreRoots));
if (scope === 'all' || scope === 'routes') exitCode = Math.max(exitCode, check('routes', routeRoots));
process.exitCode = exitCode;
