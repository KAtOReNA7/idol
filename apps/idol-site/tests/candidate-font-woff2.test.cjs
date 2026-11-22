const test = require('node:test');
const {artistStyle, journalStyle, importedStyle, assertFace, assertStack} = require('./helpers/routed-fonts.cjs');

const dmSans = ['/fonts/DMSans-Variable.woff2'];
const notoRegular = ['/fonts/unis/NotoSansSC-Regular.woff2'];
const sevenArtistStyle = '@/components/seven-redesign/artist.css';

test('QWER, TRACER, Kep1er, izna and tripleS load the fonts of their active designs', () => {
  for (const slug of ['qwer', 'triples']) {
    const home = artistStyle(slug, sevenArtistStyle);
    assertFace(home, 'SevenBody', dmSans, '100 1000');
    assertStack(home, 'SevenBody,Noto Sans SC,Microsoft YaHei,sans-serif');
  }
  assertFace(journalStyle('qwer'), 'League Spartan', ['/fonts/qwer/LeagueSpartan-Latin.woff2'], '100 900');
  const tokens = importedStyle('app/page.tsx', './work-theme-tokens.css');
  assertStack(tokens, 'League Spartan,Noto Sans SC,Microsoft YaHei,sans-serif');

  const tracer = artistStyle('tracer', '@/components/tracer-artist', './tracer-artist.css');
  for (const sheet of [tracer, journalStyle('tracer')]) {
    assertFace(sheet, 'TracerSans', dmSans, '100 1000');
    assertFace(sheet, 'TracerText', notoRegular, '400');
    assertStack(sheet, 'TracerSans,TracerText,sans-serif');
  }
  const kep1er = artistStyle('kep1er', '@/components/design-review/kep1er-design-review', './kep1er-figma-design.css');
  assertFace(kep1er, 'KepInter', ['/fonts/hearts2hearts/Inter-Latin-Variable.woff2'], '100 900');
  assertFace(kep1er, 'KepEditorial', ['/fonts/InstrumentSerif-Italic.woff2'], '400', 'italic');
  assertFace(journalStyle('kep1er'), 'Kep1erDetail', ['/fonts/SpaceGrotesk.woff2', '/fonts/SpaceGrotesk.ttf'], '300 700');

  const izna = artistStyle('izna', '@/components/izna/editorial', './identity.css');
  assertFace(izna, 'IznaBebas', ['/artist/izna/identity/BebasNeue-Regular.ttf'], '400');
});

test('RESCENE, Weeekly, SPIA and UNIS keep the editorial and Chinese fonts used by their current routes', () => {
  const rescene = artistStyle('rescene', sevenArtistStyle);
  for (const sheet of [rescene, journalStyle('rescene')]) {
    assertFace(sheet, 'ResceneMontserrat', ['/artist/rescene/redesign-20261025/montserrat-latin.woff2'], '100 900');
  }
  assertStack(rescene, 'ResceneMontserrat,SevenBody,Microsoft YaHei,sans-serif');
  const weeekly = artistStyle('weeekly', './weeekly-artist.css');
  assertFace(weeekly, 'WeekText', dmSans, '100 1000');
  assertStack(weeekly, 'WeekText,Microsoft YaHei,sans-serif');
  assertStack(journalStyle('weeekly'), 'Georgia,serif');

  const spia = artistStyle('spia', '@/components/spia-artist', './spia-artist.css');
  for (const sheet of [spia, journalStyle('spia')]) {
    assertFace(sheet, 'SpiaSerif', ['/fonts/PlayfairDisplay-Variable.woff2'], '400 900');
    assertFace(sheet, 'SpiaSans', dmSans, '100 1000');
    assertFace(sheet, 'SpiaText', notoRegular, '400');
    assertStack(sheet, 'SpiaSans,SpiaText,sans-serif');
  }
  const unis = artistStyle('unis', '@/components/design-review/unis-design-review.css');
  assertFace(unis, 'UNISDisplay', ['/fonts/unis/URWGothic-Demi.otf'], '700');
  assertFace(unis, 'UNISBody', notoRegular, '400 500');
  assertFace(unis, 'UNISBody', ['/fonts/unis/NotoSansSC-Bold.woff2'], '600 900');
  assertStack(unis, 'UNISBody,Noto Sans SC,sans-serif');
});
