import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {normalizePath} from 'vite';

const artworkFile = 'music-index-artwork.json';
const completionFile = 'group-statistics-completion-evidence.json';
const factsFile = 'group-information-facts.json';
const inputFiles = [artworkFile, completionFile, factsFile];
const virtualPrefix = '\0idol:group-information-display/';
const socialFields = ['platform', 'url', 'accountExists', 'observedValue', 'observedAt', 'countLabel', 'status', 'subjectName', 'sourceTitle', 'sourceUrl'];

function fields(record, names) {
  return Object.fromEntries(names.filter(name => Object.hasOwn(record, name)).map(name => [name, record[name]]));
}

function metricForDisplay(metric) {
  if (metric == null) return metric;
  const display = fields(metric, ['observedValue', 'value', 'status', 'lowerBound', 'scope', 'asOf', 'sourceUrl', 'sourceTitle', 'title']);
  if (metric.sources) display.sources = metric.sources.map(source => fields(source, ['title', 'url']));
  if (metric.evidence) {
    display.evidence = fields(metric.evidence, ['chart', 'periodType', 'periodLabel']);
    if (metric.evidence.dayRows) display.evidence.dayRows = metric.evidence.dayRows.map(row => fields(row, ['date']));
  }
  return display;
}

export function groupInformationDisplayInputs(inputs) {
  const complete = inputs[completionFile].groups ?? {};
  const groups = Object.fromEntries(Object.entries(complete).map(([slug, group]) => [slug, group && {
    social: group.social.map(account => fields(account, socialFields)),
    sales: metricForDisplay(group.sales),
    wins: metricForDisplay(group.wins),
  }]));
  // The renderer can still use a legacy row when a group or either metric is missing.
  function fallbackRows(rows) {
    const entries = [];
    for (const [slug, row] of Object.entries(rows)) {
      const current = complete[slug];
      if (current?.sales != null && current.wins != null) continue;
      const display = {};
      if (!current && row?.social) display.social = row.social.map(account => fields(account, socialFields));
      if (current?.sales == null && row?.sales != null) display.sales = metricForDisplay(row.sales);
      if (current?.wins == null && row?.wins != null) display.wins = metricForDisplay(row.wins);
      // A present top-level row takes precedence over a nested legacy row, even if empty.
      entries.push([slug, row == null ? row : display]);
    }
    return Object.fromEntries(entries);
  }
  const {groups: legacyGroups, ...legacyRows} = inputs[factsFile];
  const facts = fallbackRows(legacyRows);
  if (legacyGroups) facts.groups = fallbackRows(legacyGroups);
  return {
    [artworkFile]: inputs[artworkFile].map(group => fields(group, ['slug', 'groupId', 'name'])),
    [completionFile]: {groups},
    [factsFile]: facts,
  };
}

// Only the React display component uses this projection. The shared renderer,
// native clients and research consumers retain access to the authoritative model.
export function groupInformationDisplay() {
  let root, component, model, displayModel, projected;
  return {
    name: 'group-information-display',
    apply: 'build',
    enforce: 'pre',
    applyToEnvironment: environment => environment.name === 'client',
    configResolved(config) {
      root = config.root;
      component = normalizePath(path.resolve(root, 'components/artist-information.tsx'));
      model = normalizePath(path.resolve(root, 'lib/idol/group-information.mjs'));
      displayModel = model + '?artist-information-display';
    },
    buildStart() {
      projected = undefined;
    },
    resolveId(source, importer) {
      if (importer === component && (source === '@/lib/idol/group-information.mjs' || normalizePath(source) === model)) {
        return displayModel;
      }
      if (importer !== displayModel || !source.startsWith('../../data/')) return;
      const name = source.slice('../../data/'.length);
      if (inputFiles.includes(name)) return virtualPrefix + name;
    },
    async load(id) {
      if (id === displayModel) {
        this.addWatchFile(model);
        return readFile(model, 'utf8');
      }
      if (!id.startsWith(virtualPrefix)) return;
      if (!projected) {
        projected = Promise.all(inputFiles.map(async name => {
          const file = path.resolve(root, 'data', name);
          this.addWatchFile(file);
          return [name, JSON.parse(await readFile(file, 'utf8'))];
        })).then(entries => groupInformationDisplayInputs(Object.fromEntries(entries)));
      }
      const inputs = await projected;
      return JSON.stringify(inputs[id.slice(virtualPrefix.length)]);
    },
  };
}
