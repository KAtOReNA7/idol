'use strict';

// Static product-source proof, complementary to the real-host SSR fixture.
// Run with the existing/offline TypeScript dependency exposed through NODE_PATH.
// No product modules, missing data, global journey or save APIs are mocked here.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const legacy = new Set(['artist-sample', 'illit-artist', 'expanded-artist', 'ive-artist', 'kiof-artist', 'stayc-artist', 'nmixx-artist', 'hearts2hearts-artist', 'kiiikiii-artist', 'itzy-artist', 'lesserafim-artist', 'saymyname-artist', 'katseye-artist']);

function parse(projectRoot, relative) {
  const absolute = path.join(projectRoot, relative);
  if (!fs.existsSync(absolute)) return null;
  return ts.createSourceFile(relative, fs.readFileSync(absolute, 'utf8'), ts.ScriptTarget.Latest, true, relative.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}
function walk(node, visit) { if (!node) return; visit(node); ts.forEachChild(node, child => walk(child, visit)); }
function modulePath(projectRoot, source, specifier) {
  const clean = specifier.split('?')[0];
  const relative = clean.startsWith('@/') ? clean.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(source), clean));
  const suffixes = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '/index.ts', '/index.tsx'];
  return {base: relative, path: suffixes.map(suffix => relative + suffix).find(file => fs.existsSync(path.join(projectRoot, file)) && fs.statSync(path.join(projectRoot, file)).isFile()) || null};
}
function imports(projectRoot, source) {
  const found = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const resolution = specifier.startsWith('@/') || specifier.startsWith('.') ? modulePath(projectRoot, source.fileName, specifier) : {base: specifier, path: null};
    const clause = statement.importClause;
    if (clause?.name) found.set(clause.name.text, {...resolution, specifier});
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const element of clause.namedBindings.elements) found.set(element.name.text, {...resolution, specifier});
  }
  return found;
}
function jsxName(node) { return ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node) ? node.tagName.getText() : null; }
function position(source, node) { return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1; }
function attribute(node, name) {
  const item = node.attributes.properties.find(prop => ts.isJsxAttribute(prop) && prop.name.getText() === name);
  return item?.initializer ? item.initializer.getText() : null;
}
function sectionsLabel(source) {
  let label = null;
  walk(source, node => { if (ts.isArrayLiteralExpression(node) && node.elements.length >= 2 && ts.isStringLiteral(node.elements[0]) && node.elements[0].text === 'updates' && ts.isStringLiteral(node.elements[1])) label = node.elements[1].text; });
  return label;
}
function definitions(source) {
  const result = new Map();
  walk(source, node => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) result.set(node.name.text, node.initializer);
    if (ts.isFunctionDeclaration(node) && node.name && node.body) result.set(node.name.text, node.body);
  });
  return result;
}
function sectionCondition(node, section) {
  if (!ts.isBinaryExpression(node) || ![ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(node.operatorToken.kind)) return false;
  return (ts.isPropertyAccessExpression(node.left) && node.left.name.text === 'section' && ts.isStringLiteral(node.right) && node.right.text === section) || (ts.isPropertyAccessExpression(node.right) && node.right.name.text === 'section' && ts.isStringLiteral(node.left) && node.left.text === section);
}
function simpleBoolean(node, slug) {
  if (ts.isParenthesizedExpression(node)) return simpleBoolean(node.expression, slug);
  if (ts.isIdentifier(node) && node.text === 'xg') return slug === 'xg';
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) { const value = simpleBoolean(node.operand, slug); return value === null ? null : !value; }
  return null;
}
function reachableHosts(projectRoot, source, body, slug) {
  const refs = imports(projectRoot, source), locals = definitions(source), visited = new Set(), result = [];
  function visit(node) {
    if (!node) return;
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      if (simpleBoolean(node.left, slug) !== false) { visit(node.left); visit(node.right); }
      return;
    }
    if (ts.isConditionalExpression(node)) {
      const value = simpleBoolean(node.condition, slug);
      visit(node.condition);
      if (value !== false) visit(node.whenTrue);
      if (value !== true) visit(node.whenFalse);
      return;
    }
    const name = jsxName(node), imported = name && refs.get(name);
    if (imported?.base === 'components/artist-timeline-host') result.push({component: name, path: imported.path, line: position(source, node), groupId: attribute(node, 'groupId'), background: attribute(node, 'background')});
    // Follow actual references from JSX/calls/object shorthands to local JSX or
    // render helpers; merely importing a host never proves it is rendered.
    if (ts.isIdentifier(node) && !visited.has(node.text) && locals.has(node.text)) {
      const parent = node.parent;
      if (node === body || (ts.isJsxExpression(parent) && parent.expression === node) || (ts.isCallExpression(parent) && parent.expression === node) || ts.isShorthandPropertyAssignment(parent)) { visited.add(node.text); visit(locals.get(node.text)); }
    }
    ts.forEachChild(node, visit);
  }
  visit(body);
  return result;
}
function sectionHosts(projectRoot, source, section, slug) {
  const result = [];
  walk(source, node => { if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && sectionCondition(node.left, section)) result.push(...reachableHosts(projectRoot, source, node.right, slug)); });
  return result;
}
function candidateDesignProof(projectRoot, source) {
  const refs = imports(projectRoot, source), result = {sharedComponent: null, rendersSharedComponent: false, passesComposition: false, rendersNotesSlot: false};
  walk(source, node => {
    const name = jsxName(node), ref = name && refs.get(name);
    if (ref?.base === 'components/candidate-artist-experience') { result.sharedComponent = ref.path; result.rendersSharedComponent = true; result.passesComposition = attribute(node, 'composition') === '{composition}'; }
    if (ts.isPropertyAssignment(node) && node.name.getText() === 'overview' && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      const fn = node.initializer;
      const bindsNotes = fn.parameters.some(parameter => ts.isObjectBindingPattern(parameter.name) && parameter.name.elements.some(element => element.name.getText() === 'notes'));
      if (bindsNotes) walk(fn.body, child => { if (ts.isJsxExpression(child) && child.expression && ts.isIdentifier(child.expression) && child.expression.text === 'notes') result.rendersNotesSlot = true; });
    }
  });
  return result;
}
function inspectMigration(projectRoot = root) {
  const registry = JSON.parse(fs.readFileSync(path.join(projectRoot, 'HANDOFF/artist-registry51.json'), 'utf8'));
  const common = parse(projectRoot, 'components/candidate-artist-experience.tsx');
  const timeline = parse(projectRoot, 'components/artist-timeline.tsx');
  let timelineHeading = null;
  walk(timeline, node => { if (ts.isBindingElement(node) && node.name.getText() === 'title' && node.initializer && ts.isStringLiteral(node.initializer)) timelineHeading = node.initializer.text; });
  const rows = registry.map(group => {
    const routeFile = `app/artists/${group.slug}/page.tsx`, route = parse(projectRoot, routeFile);
    const row = {slug: group.slug, groupId: group.groupId, route: group.path, routeFile, routePresent: !!route, kind: null, component: null, componentPresent: false, routeComponentLine: null, routeSlug: null, navLabel: null, timelineHeading, overviewHosts: [], updatesHosts: [], designProof: null, status: 'missing'};
    if (!route) return row;
    const refs = imports(projectRoot, route);
    walk(route, node => {
      const name = jsxName(node), ref = name && refs.get(name);
      if (!ref?.base.startsWith('components/')) return;
      row.component = ref.path || `${ref.base}.tsx`; row.componentPresent = !!ref.path; row.routeComponentLine = position(route, node); row.routeSlug = attribute(node, 'slug');
    });
    const component = row.componentPresent && parse(projectRoot, row.component);
    if (!component) return row;
    if (row.component.startsWith('components/candidate/') && !candidateDesignProof(projectRoot, component).rendersSharedComponent && sectionHosts(projectRoot, component, 'overview', group.slug).length && sectionHosts(projectRoot, component, 'updates', group.slug).length) {
      row.kind = 'independent'; row.navLabel = sectionsLabel(component); row.overviewHosts = sectionHosts(projectRoot, component, 'overview', group.slug); row.updatesHosts = sectionHosts(projectRoot, component, 'updates', group.slug);
    } else if (row.component.startsWith('components/candidate/')) {
      row.kind = 'candidate'; row.designProof = candidateDesignProof(projectRoot, component); row.navLabel = common && sectionsLabel(common);
      if (common) { row.overviewHosts = sectionHosts(projectRoot, common, 'overview', group.slug); row.updatesHosts = sectionHosts(projectRoot, common, 'updates', group.slug); }
    } else if (legacy.has(path.basename(row.component, '.tsx'))) {
      row.kind = 'legacy'; row.navLabel = sectionsLabel(component); row.overviewHosts = sectionHosts(projectRoot, component, 'overview', group.slug); row.updatesHosts = sectionHosts(projectRoot, component, 'updates', group.slug);
    }
    const rendered = row.overviewHosts.length && row.updatesHosts.length && [...row.overviewHosts, ...row.updatesHosts].every(host => host.path && host.groupId && (row.kind === 'independent' || host.background));
    const designReady = row.kind !== 'candidate' || (row.designProof.rendersSharedComponent && row.designProof.passesComposition && row.designProof.rendersNotesSlot);
    const slugReady = !['xg', 'aespa'].includes(row.slug) || row.routeSlug === `"${row.slug}"`;
    row.status = rendered && designReady && slugReady && ['大事时间轴', '时间轴'].includes(row.navLabel) ? 'wired-static' : 'incomplete';
    return row;
  });
  const host = parse(projectRoot, 'components/artist-timeline-host.tsx');
  let sharedHostRendersTimeline = false;
  if (host) { const refs = imports(projectRoot, host); walk(host, node => { const name = jsxName(node), ref = name && refs.get(name); if (ref?.base === 'components/artist-timeline') sharedHostRendersTimeline = true; }); }
  return {scope: 'TypeScript AST source wiring proof; does not establish browser behavior, loaded production catalog, global navigation guards or original full-app build.', sharedHostPresent: !!host, sharedHostRendersTimeline, timelineHeading, counts: {total: rows.length, candidate: rows.filter(row => row.kind === 'candidate').length, legacy: rows.filter(row => row.kind === 'legacy').length, independent: rows.filter(row => row.kind === 'independent').length, wired: rows.filter(row => row.status === 'wired-static').length}, rows};
}
function inspectMissingImports(projectRoot = root) {
  const result = [];
  function scan(directory) {
    for (const entry of fs.readdirSync(path.join(projectRoot, directory), {withFileTypes: true})) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'tests') continue;
      const relative = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) scan(relative);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
        const source = parse(projectRoot, relative);
        walk(source, node => {
          if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;
          const specifier = node.moduleSpecifier.text;
          if (!(specifier.startsWith('@/') || specifier.startsWith('.'))) return;
          const resolved = modulePath(projectRoot, relative, specifier);
          if (!resolved.path) result.push({source: relative, line: position(source, node), specifier, base: resolved.base});
        });
      }
    }
  }
  for (const directory of ['app', 'components', 'lib']) if (fs.existsSync(path.join(projectRoot, directory))) scan(directory);
  return result;
}
module.exports = {inspectMigration, inspectMissingImports};

if (require.main === module && process.argv.includes('--report')) {
  const destination = process.argv[process.argv.indexOf('--report') + 1];
  if (!destination || !path.isAbsolute(destination)) throw new Error('Report destination must be an explicit absolute path.');
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.writeFileSync(destination, JSON.stringify({...inspectMigration(), missingImports: inspectMissingImports()}, null, 2) + '\n');
} else {
  const {test} = require('node:test');
  const matrix = inspectMigration();
  test('actual source has 33 candidate, 4 independent and 14 legacy routes and a rendering shared timeline host', () => {
    assert.deepEqual(matrix.counts, {total: 51, candidate: 33, independent: 4, legacy: 14, wired: 51});
    assert.equal(matrix.sharedHostPresent, true); assert.equal(matrix.sharedHostRendersTimeline, true);
    assert.equal(matrix.timelineHeading, '大事时间轴');
  });
  for (const row of matrix.rows) test(`${row.slug}: actual route renders timeline in overview and updates`, () => {
    assert.equal(row.status, 'wired-static', JSON.stringify(row));
    assert.ok(row.overviewHosts.length); assert.ok(row.updatesHosts.length);
  });
  test('all 51 artist route files remain byte-identical and frozen schema remains unchanged', () => {
    const files = JSON.parse(fs.readFileSync(path.join(root, 'HANDOFF/PART2_CODE_MANIFEST.json'), 'utf8')).files.filter(file => /^app\/artists\/[^/]+\/page\.tsx$/.test(file.path));
    files.push({path: 'app/artists/babymonster/page.tsx', sha256: '0981f0e779034f9e20052eb5ea68dc49265de013192f747931479ce5a1fc1321'}, {path: 'app/artists/meovv/page.tsx', sha256: '5fc44a6555c4e1395c369b7aa9415faa31c16db4be4c0d024f142e2e629a11d2'});
    assert.equal(new Set(files.map(file => file.path)).size, 51);
    files.push({path: 'HANDOFF/timeline-event.schema.json', sha256: 'f71721b2d445d1e04f659ce40d0bf42d4dc3a43a2b712c22acba405cfa7c80bc'});
    for (const file of files) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file.path))).digest('hex'), file.sha256, file.path);
  });
}
