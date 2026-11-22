const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const formats = {'.woff2': 'woff2', '.woff': 'woff', '.ttf': 'truetype', '.otf': 'opentype'};

function importedStyle(entry, ...specifiers) {
  let file = path.join(root, entry);
  for (const specifier of specifiers) {
    const imports = ts.preProcessFile(fs.readFileSync(file, 'utf8')).importedFiles;
    assert.ok(imports.some(item => item.fileName === specifier), `${path.relative(root, file)} must import ${specifier}`);
    const target = specifier.replace(/\?url$/, '');
    file = target.startsWith('@/') ? path.join(root, target.slice(2)) : path.resolve(path.dirname(file), target);
    if (!path.extname(file)) file += '.tsx';
  }
  return postcss.parse(fs.readFileSync(file, 'utf8'), {from: file});
}

function artistStyle(slug, ...specifiers) {
  return importedStyle(`app/artists/${slug}/page.tsx`, ...specifiers);
}

function journalStyle(slug, candidate = true) {
  const registry = candidate ? 'lib/idol/candidate/experience-styles.ts' : 'lib/idol/work-experience-styles.ts';
  if (candidate) {
    const {candidateExperienceStylesheet} = require('./experience-styles-loader.cjs');
    assert.equal(candidateExperienceStylesheet(`candidate-experience candidate-${slug}-experience`), `/test-assets/${slug}-experience.css`);
  }
  return importedStyle(registry, `@/app/${slug}-experience.css?url`);
}

function assertFace(sheet, family, urls, weight = 'normal', style = 'normal') {
  const label = `${path.relative(root, sheet.source.input.file)} — ${family} ${weight} ${style}`;
  const matches = [];
  sheet.walkAtRules('font-face', rule => {
    const face = Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
    if (face['font-family'].replace(/['"]/g, '') === family &&
        (face['font-weight'] ?? 'normal') === weight && (face['font-style'] ?? 'normal') === style) matches.push(face);
  });
  assert.equal(matches.length, 1, label);
  assert.equal(matches[0]['font-display'], 'swap', label);
  const src = postcss.list.comma(matches[0].src).map(source => source.replace(/['"]/g, '').replace(/\s+/g, ' ').trim());
  assert.deepEqual(src, urls.map(url => `url(${url}) format(${formats[path.extname(url)]})`), label);
  for (const url of urls) assert.ok(fs.statSync(path.join(root, 'public', url)).size > 0, url);
}

function assertStack(sheet, expected) {
  const normal = text => text.replace(/['"\s]/g, '');
  const values = [];
  sheet.walkDecls(decl => {
    if (['font', 'font-family'].includes(decl.prop) || decl.prop.startsWith('--')) values.push(normal(decl.value));
  });
  assert.ok(values.some(value => value.includes(normal(expected))), `${sheet.source.input.file} must use ${expected}`);
}

module.exports = {artistStyle, journalStyle, importedStyle, assertFace, assertStack};
