#!/usr/bin/env node
/**
 * Deterministically scope the two reviewed source stylesheets, in cascade order.
 *
 * Run from this overlay or the integrated repository:
 *   node scripts/check-triples-review-styles.cjs --check
 *   node scripts/check-triples-review-styles.cjs --write
 *
 * Optional --source <merged-preview>, --host <main-repo>, --output <overlay>
 * arguments make this check portable without copying any font assets.
 *
 * PostCSS parses rules, nested at-rules, selector lists and declaration values.
 * Only the source's exact document selectors are mapped to the wrapper. Other
 * selectors retain their names and receive a descendant scope. Keyframe steps
 * are explicitly excluded, while both keyframe names and animation references
 * receive the review namespace.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const args = process.argv.slice(2);
function argument(flag, fallback) {
  const index = args.indexOf(flag);
  return index < 0 ? fallback : path.resolve(args[index + 1]);
}
const overlay = argument('--output', path.resolve(__dirname, '..'));
const workspace = path.resolve(overlay, '..');
const source = argument('--source', path.join(workspace, 'astra-triples-v2-intake/merged-preview'));
const defaultHost = fs.existsSync(path.join(overlay, 'package.json'))
  ? overlay
  : path.join(workspace, 'idol-day19-restored');
const host = argument('--host', defaultHost);
const mode = args.includes('--write') ? 'write' : 'check';
const requireHost = createRequire(path.join(host, 'package.json'));
const postcss = requireHost('postcss');
const valueParser = requireHost('postcss-value-parser');
const lightningcss = requireHost('lightningcss');
const SCOPE = '.triples-visual-review';
const KEYFRAME_PREFIX = 'triples-visual-review-';
const FONT_FAMILY = 'TriplesReviewChinese';
const styles = ['triples.css', 'triples-visual.css'];
const graphics = ['material-screen.svg', 'registration-corners.svg', 'sequence-ruler.svg'];
const fonts = [
  ['/fonts/unis/NotoSansSC-Regular.woff2', '400 500'],
  ['/fonts/unis/NotoSansSC-Bold.woff2', '600 900'],
];
const outputCSS = path.join(overlay, 'components/design-review/triples-visual-review.css');
const outputGraphics = path.join(overlay, 'public/design-review/triples/graphics');
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const sourceHashes = Object.fromEntries(styles.map((name) => [
  name, digest(fs.readFileSync(path.join(source, name))),
]));
const graphicHashes = Object.fromEntries(graphics.map((name) => [
  name, digest(fs.readFileSync(path.join(source, 'visual-v1/graphics', name))),
]));
const keyframes = new Map();
let sourceRuleCount = 0;
let scopedSourceRuleCount = 0;
let keyframeStepCount = 0;

function insideKeyframes(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /(?:^|-)keyframes$/i.test(parent.name)) return true;
  }
  return false;
}

function scopeSelector(selector) {
  const trimmed = selector.trim();
  if ([':root', 'html', 'body'].includes(trimmed)) return SCOPE;
  assert(!/(^|[\s,>+~])(?:body|html)\b|:root|:global|:host|&/.test(trimmed),
    `Document or nesting selector needs explicit review: ${trimmed}`);
  return `${SCOPE} ${trimmed}`;
}

const parsedSources = styles.map((name) => postcss.parse(
  fs.readFileSync(path.join(source, name), 'utf8'), { from: path.join(source, name) },
));
for (const root of parsedSources) {
  root.walkAtRules((rule) => {
    assert(['charset', 'media', 'keyframes'].includes(rule.name),
      `Unexpected source at-rule: @${rule.name}`);
    if (rule.name === 'keyframes') {
      keyframes.set(rule.params, `${KEYFRAME_PREFIX}${rule.params}`);
    }
  });
}

function mapValue(decl) {
  const value = valueParser(decl.value);
  value.walk((node) => {
    if (node.type === 'function' && node.value.toLowerCase() === 'url') {
      const urlNode = node.nodes.find((part) => ['string', 'word'].includes(part.type));
      assert(urlNode, `Cannot parse URL in ${decl.toString()}`);
      const graphic = graphics.find((name) => urlNode.value === `./visual-v1/graphics/${name}`);
      assert(graphic, `Unexpected source resource: ${urlNode.value}`);
      urlNode.value = `/design-review/triples/graphics/${graphic}`;
    }
    if (/^(?:-\w+-)?animation(?:-name)?$/.test(decl.prop) &&
        ['word', 'string'].includes(node.type) && keyframes.has(node.value)) {
      node.value = keyframes.get(node.value);
    }
  });
  // Keep the source's Manrope/system fallback order. No Manrope binary exists
  // in either intake or host, so do not substitute an unrelated Latin typeface.
  // Existing Noto assets are reused by URL, with a unique face name; the original
  // Noto/system faces remain available for glyphs outside the local subset.
  decl.value = value.toString();
  if (decl.prop === 'font-family') {
    decl.value = decl.value.replace(/"Noto Sans SC"/g, `"${FONT_FAMILY}","Noto Sans SC"`);
  }
}

const header = [
  '/* Generated tripleS visual review overlay. Source order: triples.css, triples-visual.css.',
  ' * Original class names, source declarations and project-designed SVG art are retained.',
  ' * Only wrapper scope, namespaced animation/font references and local asset URLs change.',
  ' * Host compatibility baseline below restores source browser defaults without global rules.',
  ...Object.entries(sourceHashes).map(([name, hash]) => ` * Source SHA-256 ${name}: ${hash}`),
  ...Object.entries(graphicHashes).map(([name, hash]) => ` * Graphic SHA-256 ${name}: ${hash}`),
  ' * Regenerate/check with scripts/check-triples-review-styles.cjs.',
  ' */',
].join('\n');
const fontCSS = fonts.map(([url, weight]) => {
  assert(fs.existsSync(path.join(host, 'public', url)), `Missing canonical host font: ${url}`);
  return `@font-face{font-family:"${FONT_FAMILY}";src:url("${url}") format("woff2");font-style:normal;font-weight:${weight};font-display:swap}`;
}).join('\n');
const baseline = [
  '/* The standalone source starts with browser 16px/normal text and a full-width main. */',
  `${SCOPE}{font-size:16px;line-height:normal;text-align:start;min-height:100vh;isolation:isolate}`,
  `${SCOPE} main{max-width:none;margin:0;padding:0}`,
  '/* Undo only host globals that otherwise supply declarations absent from the source. */',
  `${SCOPE} h1,${SCOPE} h2,${SCOPE} h3{line-height:normal}`,
  `${SCOPE} small{font-size:smaller}`,
  `${SCOPE} .brand{font:inherit;letter-spacing:normal;gap:normal}`,
  `${SCOPE} .quiet{font-size:inherit}`,
  `${SCOPE} .empty{color:inherit;align-items:normal}`,
  `${SCOPE} .empty p{font-size:inherit}`,
  `${SCOPE} .member-tile{position:static;text-align:inherit}`,
  `${SCOPE} .video-play{flex-direction:row;gap:normal;color:inherit;padding:0;backdrop-filter:none}`,
].join('\n');
let baselineRuleCount = 0;
postcss.parse(baseline).walkRules(() => { baselineRuleCount++; });
const chunks = [header, fontCSS, baseline];
for (const [index, root] of parsedSources.entries()) {
  root.walkAtRules('charset', (rule) => rule.remove());
  root.walkAtRules('keyframes', (rule) => { rule.params = keyframes.get(rule.params); });
  root.walkRules((rule) => {
    if (insideKeyframes(rule)) {
      keyframeStepCount++;
      assert(postcss.list.comma(rule.selector).every(
        (part) => /^(?:from|to|\d+(?:\.\d+)?%)$/.test(part.trim()),
      ), `Unexpected keyframe step: ${rule.selector}`);
      return;
    }
    sourceRuleCount++;
    // PostCSS's list parser respects parentheses and quoted commas, including
    // source selectors such as :where(a, button, input, [tabindex]):focus-visible.
    rule.selectors = rule.selectors.map(scopeSelector);
    scopedSourceRuleCount++;
  });
  root.walkDecls(mapValue);
  chunks.push(`/* ===== Scoped source: ${styles[index]} ===== */\n${root.toString()}`);
}
const css = `${chunks.join('\n\n')}\n`;

function validate(output) {
  const root = postcss.parse(output, { from: outputCSS });
  const registeredKeyframes = new Set();
  const declaredFaces = new Set();
  let scopedRules = 0;
  let steps = 0;
  let resourceReferences = 0;
  root.walkAtRules((rule) => {
    assert(['media', 'keyframes', 'font-face'].includes(rule.name), `Unsafe @${rule.name}`);
    if (rule.name === 'keyframes') {
      assert(rule.params.startsWith(KEYFRAME_PREFIX), `Unscoped keyframe: ${rule.params}`);
      registeredKeyframes.add(rule.params);
    }
    if (rule.name === 'font-face') {
      const family = rule.nodes.find((decl) => decl.prop === 'font-family')?.value;
      const weight = rule.nodes.find((decl) => decl.prop === 'font-weight')?.value;
      assert.equal(family, `"${FONT_FAMILY}"`);
      assert(!declaredFaces.has(`${family}:${weight}`), 'Duplicate font face');
      declaredFaces.add(`${family}:${weight}`);
    }
  });
  root.walkRules((rule) => {
    if (insideKeyframes(rule)) {
      steps++;
      assert(rule.selectors.every((selector) => /^(?:from|to|\d+(?:\.\d+)?%)$/.test(selector)));
      return;
    }
    scopedRules++;
    for (const selector of rule.selectors) {
      assert(selector === SCOPE || selector.startsWith(`${SCOPE} `),
        `Unscoped selector: ${selector}`);
      assert(!/(^|[\s,>+~])(?:body|html)\b|:root|:global|:host|&/.test(selector),
        `Escaping selector: ${selector}`);
      assert(!selector.startsWith(`${SCOPE} +`) && !selector.startsWith(`${SCOPE} ~`),
        `Sibling escape: ${selector}`);
    }
  });
  root.walkDecls((decl) => {
    valueParser(decl.value).walk((node) => {
      if (node.type === 'function' && node.value.toLowerCase() === 'url') {
        resourceReferences++;
        const url = node.nodes.find((part) => ['string', 'word'].includes(part.type))?.value;
        assert(
          graphics.some((name) => url === `/design-review/triples/graphics/${name}`) ||
          fonts.some(([canonical]) => url === canonical),
          `External or unexpected resource: ${url}`,
        );
      }
      if (/^(?:-\w+-)?animation(?:-name)?$/.test(decl.prop) && node.type === 'word') {
        assert(!keyframes.has(node.value), `Old keyframe reference: ${node.value}`);
      }
    });
  });
  assert.equal(sourceRuleCount, scopedSourceRuleCount);
  assert.equal(scopedRules, sourceRuleCount + baselineRuleCount);
  assert.equal(steps, keyframeStepCount);
  assert.equal(registeredKeyframes.size, keyframes.size);
  assert.equal(declaredFaces.size, fonts.length);
  // Independent browser-oriented CSS parsing catches malformed selectors/values.
  const compiled = lightningcss.transform({
    filename: 'triples-visual-review.css', code: Buffer.from(output),
    minify: false, errorRecovery: false,
  });
  assert(!compiled.warnings.length, `CSS warnings: ${JSON.stringify(compiled.warnings)}`);
  return { sourceRules: sourceRuleCount, scopedRules, keyframeSteps: steps,
    keyframes: [...registeredKeyframes], fontFaces: declaredFaces.size, resourceReferences };
}

const report = validate(css);
if (mode === 'write') {
  fs.mkdirSync(path.dirname(outputCSS), { recursive: true });
  fs.mkdirSync(outputGraphics, { recursive: true });
  fs.writeFileSync(outputCSS, css);
  for (const graphic of graphics) {
    fs.copyFileSync(path.join(source, 'visual-v1/graphics', graphic),
      path.join(outputGraphics, graphic));
  }
}
assert.equal(fs.readFileSync(outputCSS, 'utf8'), css, 'Scoped CSS differs from deterministic source');
for (const [graphic, hash] of Object.entries(graphicHashes)) {
  assert.equal(digest(fs.readFileSync(path.join(outputGraphics, graphic))), hash,
    `Graphic provenance mismatch: ${graphic}`);
}
console.log(JSON.stringify({ ok: true, mode, cssBytes: Buffer.byteLength(css), ...report,
  sourceHashes, graphics: graphicHashes, canonicalFonts: fonts.map(([url]) => url),
  fontNote: 'Manrope remains the original optional system face; no external fonts or duplicate binary assets.',
}, null, 2));
