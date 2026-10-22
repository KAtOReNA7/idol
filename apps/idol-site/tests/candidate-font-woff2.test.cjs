const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const sources = [
  ['app/qwer-experience.css', 'QwerScore'],
  ['app/tracer-experience.css', 'TracerCandidate'],
  ['app/kep1er-experience.css', 'Kep1erDetail', '300 700'],
  ['app/artists/qwer/qwer-artist.css', 'QwerScore'],
  ['app/artists/tracer/tracer-artist.css', 'TracerCandidate'],
  ['app/artists/kep1er/kep1er-artist.css', 'Kep1erAtlas', '300 700'],
  ['app/artists/izna/izna-artist.css', 'CandidateIzna', undefined, false],
  ['app/artists/triples/triples-artist.css', 'CandidateTriples', undefined, false],
];

test('eight candidate styles prefer existing Space Grotesk WOFF2 with unchanged TTF fallback and descriptors', () => {
  for (const [file, family, weight, formattedFallback = true] of sources) {
    const faces = [];
    postcss.parse(fs.readFileSync(path.join(root, file), 'utf8')).walkAtRules('font-face', rule => {
      if (rule.nodes.some(node => node.prop === 'src' && node.value.includes('SpaceGrotesk'))) faces.push(rule);
    });
    assert.equal(faces.length, 1, file);
    const descriptors = Object.fromEntries(faces[0].nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
    const expected = {
      'font-family': family,
      src: "url('/fonts/SpaceGrotesk.woff2') format('woff2'),url('/fonts/SpaceGrotesk.ttf')" + (formattedFallback ? " format('truetype')" : ''),
      'font-display': 'swap',
    };
    if (weight) expected['font-weight'] = weight;
    assert.deepEqual(descriptors, expected, file);
  }
  for (const name of ['SpaceGrotesk.woff2', 'SpaceGrotesk.ttf', 'spacegrotesk-OFL.txt']) {
    assert.ok(fs.statSync(path.join(root, 'public/fonts', name)).size > 0, name);
  }
});

test('six candidate styles prefer full editorial WOFF2 with unchanged TTF fallback and descriptors', () => {
  const editorialSources = [
    ['app/artists/rescene/rescene-artist.css', 'PlayfairDisplay-Variable', 'CandidateRescene', undefined, false],
    ['app/artists/weeekly/weeekly-artist.css', 'PlayfairDisplay-Variable', 'WeeeklyJournal', '400 900'],
    ['app/weeekly-experience.css', 'PlayfairDisplay-Variable', 'WeeeklyDetail', '400 900'],
    ['app/artists/spia/spia-artist.css', 'PlayfairDisplay-Variable', 'SpiaCandidate'],
    ['app/spia-experience.css', 'PlayfairDisplay-Variable', 'SpiaCandidate'],
    ['app/artists/unis/unis-artist.css', 'DMSans-Variable', 'CandidateUnis', undefined, false],
  ];
  for (const [file, font, family, weight, formattedFallback = true] of editorialSources) {
    const faces = [];
    postcss.parse(fs.readFileSync(path.join(root, file), 'utf8')).walkAtRules('font-face', rule => {
      if (rule.nodes.some(node => node.prop === 'src' && node.value.includes(font))) faces.push(rule);
    });
    assert.equal(faces.length, 1, file);
    const descriptors = Object.fromEntries(faces[0].nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
    const expected = {
      'font-family': family,
      src: `url('/fonts/${font}.woff2') format('woff2'),url('/fonts/${font}.ttf')` + (formattedFallback ? " format('truetype')" : ''),
      'font-display': 'swap',
    };
    if (weight) expected['font-weight'] = weight;
    assert.deepEqual(descriptors, expected, file);
  }
  for (const name of ['PlayfairDisplay-Variable.woff2', 'PlayfairDisplay-Variable.ttf', 'playfairdisplay-OFL.txt', 'DMSans-Variable.woff2', 'DMSans-Variable.ttf', 'dmsans-OFL.txt']) {
    assert.ok(fs.statSync(path.join(root, 'public/fonts', name)).size > 0, name);
  }
});
