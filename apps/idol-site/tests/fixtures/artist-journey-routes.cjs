'use strict';

const registry = require('../../data/artist-timeline-registry.json');
const publicGroups = require('../../data/public-artist-navigation-keys.json').groups;
const sevenReleases = require('../../data/seven-redesign-navigation-keys.json');
const load = require('../helpers/public-artist-loader.cjs');
const headings = require('./artist-journey-headings.json');
const knownSlugs = new Set(registry.map(row => row.slug));

// These pages combine the record directory with another section; a records
// query on them produces the same page as an existing navigation destination.
const combinedRecords = new Set([
  'genblue', 'unis', 'badvillain', 'youngposse', 'bewave', 'candyshop', 'oddyouth',
  'adya', 'geenius', 'tracer', 'witchx', 'spia', 'billlie', 'kep1er', 'newjeans',
]);
const noFormatControls = new Set(['babymonster','xg','aespa','badvillain']);
const indexedDesigns = new Set(['badvillain','billlie','cherrybullet','everglow','fromis9','hearts2hearts','idle','ive','izone','katseye','rocketpunch','weeekly']);
const releaseInRecords = new Set(['cherrybullet','everglow','fromis9','hearts2hearts','idle','izone','katseye','kiiikiii','rocketpunch','saymyname','vvup','weeekly']);
const nativeAstra = new Set(['ifeye', 'izna']);
const anchorEvents = new Set(['youngposse','bewave','candyshop','oddyouth','adya','geenius','tracer','witchx','spia']);
// Reported events added to mounted timelines after the original routing
// manifests were frozen. These are real HTML ids on the displayed event rows.
const additionalAnchors = {
  bewave: ['e-bewave-six-member-phase-end-announcement'],
  candyshop: ['e-candyshop-yuina-hiatus-announcement'],
  geenius: ['e-geenius-spoiler-book-instrumental'],
  atheart: ['e-atheart-aurora-second-hiatus-announcement'],
};

function routeEntries(slug) {
  if (!knownSlugs.has(slug)) return [];
  const path = '/artists/' + slug;
  const result = [];
  function add(kind, section, fields = {}, id) {
    const query = new URLSearchParams(section === 'overview' ? fields : {section, ...fields});
    const url = path + (query.size ? '?' + query : '');
    result.push({kind, section, ...(fields.format && {format:fields.format}), ...(id && {id}), url});
  }
  function anchor(id) {
    result.push({kind:'event',section:'updates',id,target:'anchor',url:path+'?section=updates#'+encodeURIComponent(id)});
  }
  for (const section of ['overview','members','works','updates']) add('section',section);
  if (!combinedRecords.has(slug)) add('section','records');
  if (!noFormatControls.has(slug)) {
    for (const format of ['mv','stage']) add('section','works',{format});
  }
  if (slug === 'billlie') add('section','works',{format:'release'});

  // The UDTT native router uses a hash for each exact release or media key.
  // Its section=works page does not interpret a release or media query.
  if (slug === 'udtt') {
    const model = load('lib/idol/udtt-native/model.mjs');
    const {artist} = load('lib/idol/udtt-native/presentation.mjs');
    const {releaseEventPairs} = load('lib/idol/design-review/sol15-runtime/groups/udtt/relations.mjs');
    for (const [kind, rows] of [['release',model.group.releases],['media',model.group.media]]) {
      for (const row of rows) {
        const url = model.reviewTarget(model.helpers.href(slug,'work',row.key));
        result.push({kind,id:row.key,section:'works',...(row.kind && {format:row.kind}),url});
      }
    }
    // The host explicitly focuses only events paired with a released record.
    for (const {event:{id}} of releaseEventPairs(artist)) {
      add('event','updates',{event:id},id);
    }
    return result;
  }

  const keys = publicGroups[slug];
  if (keys) {
    for (const id of keys.releases) add('release','works',{release:id},id);
    for (const {key:id,kind:format} of keys.media) add('media','works',{format,media:id},id);
    for (const {id} of keys.events) {
      if (nativeAstra.has(slug) || slug === 'genblue') add('event','updates',{event:id},id);
      else if (anchorEvents.has(slug)) anchor(id);
    }
    for (const id of additionalAnchors[slug] || []) anchor(id);
    return result;
  }

  let releases = [], media = [];
  if (indexedDesigns.has(slug)) {
    const design = require('../../data/' + slug + '-navigation-keys.json');
    releases = design.release || design.releases.map(row => row.id);
    media = (design.media || []).map(row => row.id);
  } else if (sevenReleases[slug]) {
    releases = sevenReleases[slug];
  } else if (slug === 'saymyname' || slug === 'kiiikiii') {
    releases = require('../../data/' + slug + '-artist.json').releases.map(row => row.id);
  } else if (slug === 'vvup') {
    releases = require('../../data/vvup-releases.json').entries.map(row => row.id);
  } else if (slug === 'unis') {
    releases = load('lib/idol/unis-editorial.ts').unisEditorialReleases.map(row => row.releaseKey);
  } else if (slug === 'newjeans') {
    const design = require('../../data/newjeans-design.json');
    releases = design.releases.map(row => row.id);
    media = design.media.filter(row => row.id.startsWith('newjeans-stage-')).map(row => row.id);
  }
  const section = releaseInRecords.has(slug) ? 'records' : 'works';
  for (const id of releases) add('release',section,{release:id},id);
  // These older renderers use the entity's own media id, including its type.
  // Giving their media details a format parameter changes some return paths.
  for (const id of media) add('media','works',{media:id},id);
  return result;
}

function memberEntries(slug) {
  if (nativeAstra.has(slug)) {
    return publicGroups[slug].memberIds.map(id => ({
      kind:'artist-member',id,url:'/artists/'+slug+'?'+new URLSearchParams({section:'members',member:id}),
    }));
  }
  if (slug === 'udtt') {
    const model = load('lib/idol/udtt-native/model.mjs');
    return model.group.members.map(row => ({
      kind:'artist-member',id:row.memberId,url:model.reviewTarget(model.helpers.href(slug,'member',row.key)),
    }));
  }
  return [];
}

// Headings are pinned from the rendered public pages, including the three
// Shadow DOM designs. Event titles belong to the focused timeline row.
function withExpectedHeading(slug, entry) {
  const key = entry.kind === 'section'
    ? [entry.section, entry.format].filter(Boolean).join('/')
    : entry.id;
  const expectedHeading = headings[slug][entry.kind][key];
  if (!expectedHeading) throw new Error('Missing expected heading for ' + entry.url);
  if (slug === 'ifeye' && entry.section === 'records') return {
    ...entry, expectedHeading, targetSelector: '.work-tabs [aria-current="page"]', targetText: '发行',
  };
  if (entry.kind !== 'event') return {...entry, expectedHeading};
  return {
    ...entry, expectedHeading, targetId: entry.id,
    ...(entry.target === 'anchor' && {fragment: '#' + encodeURIComponent(entry.id)}),
    targetSelector: slug === 'udtt' ? '[data-event-id="' + entry.id + '"]'
      : nativeAstra.has(slug) ? '[data-event-key="' + entry.id + '"]' : '#' + entry.id,
  };
}

function artistJourneys(slug) {
  return routeEntries(slug).map(entry => withExpectedHeading(slug, entry));
}

function nativeMemberJourneys(slug) {
  return memberEntries(slug).map(entry => withExpectedHeading(slug, entry));
}

module.exports = {artistJourneys,nativeMemberJourneys};
