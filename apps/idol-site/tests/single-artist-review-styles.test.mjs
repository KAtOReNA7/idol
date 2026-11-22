import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import {singleArtistReviewStyles} from '../scripts/single-artist-review-styles.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const workFile = 'app/work-theme-tokens.css';
const indexFile = 'components/candidate-index-fonts.css';
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const visuals = Object.values(JSON.parse(read('data/candidate-index-visuals.json')));
const builders = fs.readdirSync(path.join(root, 'scripts')).flatMap(file =>
  /^build-(.+)-review\.mjs$/.exec(file)?.slice(1) ?? []
).filter(slug => slug !== 'all');

function styleLoader(slug) {
  const readers = [];
  const ignored = [];
  singleArtistReviewStyles({onLoad(options, handler) { readers.push({...options, handler}); }}, path.resolve(root), slug, ignored);
  return name => {
    const filename = path.join(root, name);
    return readers.find(({filter}) => filter.test(filename))?.handler({path: filename});
  };
}

function faces(sheet) {
  const result = [];
  sheet.walkAtRules('font-face', face => {
    const family = face.nodes.find(decl => decl.prop === 'font-family').value.replace(/["']/g, '').toLowerCase();
    result.push({family, css: face.toString()});
  });
  return result;
}

test('every standalone review keeps its theme, all local font subsets and the shared work layouts', () => {
  const work = postcss.parse(read(workFile)), index = postcss.parse(read(indexFile));
  const workFaces = faces(work), indexFaces = faces(index);
  for (const slug of builders) {
    const load = styleLoader(slug);
    const selectors = [], families = new Set();
    work.walkRules(rule => {
      if (!rule.selector.includes('[data-work-theme="' + slug + '"]')) return;
      selectors.push(rule.selector);
      rule.walkDecls(/^(?:--font-(?:body|editorial|number)|font-family)$/, decl => {
        for (const name of postcss.list.comma(decl.value)) families.add(name.replace(/["']/g, '').toLowerCase());
      });
    });
    assert.ok(selectors.length, slug);
    const projected = postcss.parse(load(workFile).contents);
    const retained = [];
    projected.walkRules(rule => retained.push(rule.selector));
    assert.deepEqual(retained, selectors, slug + ' work selectors');
    assert.deepEqual(faces(projected), workFaces.filter(face => families.has(face.family)), slug + ' work faces and subsets');
    const font = visuals.find(visual => visual.slug === slug)?.font;
    const indexFamilies = Object.values(font ?? {}).map(name => name.toLowerCase());
    const scopedIndex = load(indexFile).contents;
    assert.deepEqual(faces(postcss.parse(scopedIndex)), indexFaces.filter(face => indexFamilies.includes(face.family)), slug + ' index faces');
    for (const css of [scopedIndex, projected.toString()]) {
      for (const [,owner] of css.matchAll(/url\(['"]?\/artist\/([^/]+)\//g)) assert.equal(owner, slug);
    }
    for (const layout of ['music', 'work', 'candidate', slug]) assert.equal(load('app/' + layout + '-experience.css'), undefined);
    const foreign = slug === 'rocketpunch' ? 'vvup' : 'rocketpunch';
    assert.equal(load('app/' + foreign + '-experience.css').contents, '');
    assert.equal(load('review/work-theme-tokens.css'), undefined);
  }
});
