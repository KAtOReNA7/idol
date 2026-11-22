import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

export const reviewStyleInputs = [
  'scripts/single-artist-review-styles.mjs',
  'data/candidate-index-visuals.json',
];

function fontNames(value) {
  return postcss.list.comma(value).map(family => family.trim().replace(/^(['"])(.*)\1$/, '$2').toLowerCase());
}

export function singleArtistReviewStyles(builder, root, slug, ignoredStyles) {
  const app = path.join(root, 'app');
  const workSheet = path.join(app, 'work-theme-tokens.css');
  const indexSheet = path.join(root, 'components/candidate-index-fonts.css');
  const visualData = JSON.parse(fs.readFileSync(path.join(root, 'data/candidate-index-visuals.json'), 'utf8'));
  const indexFont = Object.values(visualData).find(artist => artist.slug === slug)?.font;
  const themeSelector = '[data-work-theme="' + slug + '"]';
  const sharedLayouts = new Set(['music-experience.css', 'work-experience.css', 'candidate-experience.css']);
  builder.onLoad({filter: /[/\\]app[/\\][^/\\]+-experience\.css$/}, args => {
    const name = path.basename(args.path);
    if (path.dirname(args.path) !== app || sharedLayouts.has(name) || name === slug + '-experience.css') return;
    ignoredStyles.push('app/' + name);
    return {contents: '', loader: 'css'};
  });
  builder.onLoad({filter: /[/\\](?:work-theme-tokens|candidate-index-fonts)\.css$/}, args => {
    if (args.path !== workSheet && args.path !== indexSheet) return;
    const sheet = postcss.parse(fs.readFileSync(args.path, 'utf8'), {from: args.path});
    const families = new Set();
    if (args.path === indexSheet) {
      for (const family of Object.values(indexFont ?? {})) {
        for (const name of fontNames(family)) families.add(name);
      }
    } else {
      sheet.walkRules(rule => {
        const selectors = rule.selectors;
        const retained = selectors.filter(selector => !selector.includes('[data-work-theme=') || selector.includes(themeSelector));
        if (!retained.length) {
          rule.remove();
          return;
        }
        if (retained.length !== selectors.length) rule.selectors = retained;
        rule.walkDecls(/^(?:--font-(?:body|editorial|number)|font-family)$/, decl => {
          for (const name of fontNames(decl.value)) families.add(name);
        });
      });
    }
    // Font faces are global even when every rule that uses them is artist-scoped.
    // Keep every script subset and weight for the families used by this review.
    sheet.walkAtRules('font-face', face => {
      const family = face.nodes?.find(node => node.type === 'decl' && node.prop === 'font-family');
      if (!family || !fontNames(family.value).some(name => families.has(name))) face.remove();
    });
    return {contents: sheet.toString(), loader: 'css'};
  });
}
