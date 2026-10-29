const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '..');
const validator = path.join(root, 'scripts/validate-stages.mjs');
const files = ['data/stage-videos.json', 'data/stages/inventory.json', 'data/stages/status.json', 'data/stages/selection-policy-baseline-20261028.json'];
const bv = 'BVa1b2c3d4e5';
const checkedAt = '2026-10-28T00:00:00Z';
const proof = { note: 'Synthetic evidence of the full matching music-program performance.', urls: ['https://example.org/program'] };
const key = source => `bilibili:${source.videoId}:cid:${source.bilibili.cid}:p:${source.bilibili.page}`+(source.clip?`@${source.clip.startSeconds}-${source.clip.endSeconds}`:'');
const candidate = source => ({ platform: source.platform, videoId: source.videoId, bilibili: structuredClone(source.bilibili), title: source.title, url: source.url, likesDisplay: '未知', kind: source.kind,...(source.clip?{clip:structuredClone(source.clip)}:{}) });

function bili(overrides = {}) {
  const source = {
    sourceClass: 'reupload', platform: 'bilibili', completeness: 'full',
    videoId: bv, bilibili: { cid: '12345678901234567890', page: 2 },
    url: `https://www.bilibili.com/video/${bv}/?p=2`,
    title: 'Synthetic full music-program performance', channel: 'Synthetic archive uploader', kind: 'broadcast_stage',
    typeNote: '转载来源；完整内容和版本证据单独记录。', sourceUrl: 'https://example.org/program', checkedAt,
    likes: { value: null, display: '未知', precision: 'unknown' }, selectionNote: '点赞未知，按内容证据选择。',
    selection: { occasion: 'music_program', evidence: proof }, sourceEvidence: proof, ...overrides,
  };
  source.candidates = [candidate(source)]; source.candidateCount = 1;
  source.scoreBinding = { videoId: source.videoId, sourceKey: key(source), initializedAt: checkedAt, initialScore: null };
  return source;
}

function add(videos, status, inventory, id, source, song = id) {
  inventory.works.push({ recordId: id, groupIds: ['synthetic-group'], song, mv: { videoId: 'syntheticMV' } });
  status.inventoryCount = inventory.works.length;
  status.works[id] = { status: 'verified', reason: 'Synthetic validator fixture', checkedAt };
  videos[id] = source;
}

function run(edit) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-multiplatform-validator-'));
  try {
    fs.mkdirSync(path.join(temporary, 'data/stages'), { recursive: true });
    const objects = Object.fromEntries(files.map(file => [file, JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))]));
    edit?.(objects[files[0]], objects[files[2]], objects[files[1]]);
    for (const file of files) fs.writeFileSync(path.join(temporary, file), JSON.stringify(objects[file]));
    return cp.spawnSync(process.execPath, [validator], { cwd: temporary, encoding: 'utf8' });
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function rejects(edit, message) {
  const result = run((v, s, inventory) => {
    const source = bili(); edit(source);
    add(v, s, inventory, 'synthetic-bili', source);
  });
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, message);
}

test('the current catalog including X and all legacy source bindings validates', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).sources, 500);
});

test('official, reupload and third-party Bilibili performances accept unknown likes and exact multipart bindings', () => {
  for (const sourceClass of ['official', 'reupload', 'third_party']) {
    for (const host of ['www.bilibili.com', 'bilibili.com']) {
      const result = run((v, s, inventory) => {
        const source = bili({ sourceClass, url: `https://${host}/video/${bv}?p=2&cid=12345678901234567890` });
        // A canonical candidate URL without the optional matching CID is the same exact identity.
        source.candidates[0].url = `https://www.bilibili.com/video/${bv}/?p=2`;
        add(v, s, inventory, 'synthetic-bili', source);
      });
      assert.equal(result.status, 0, result.stderr);
    }
  }
});

test('nonofficial YouTube sources retain the legacy whole-video key', () => {
  for (const sourceClass of ['reupload', 'third_party']) {
    const result = run((v, s, inventory) => {
      const source = bili({ sourceClass });
      delete source.bilibili;
      source.platform = 'youtube'; source.videoId = 'TestStage01';
      source.url = 'https://www.youtube.com/watch?v=TestStage01';
      source.scoreBinding = { videoId: source.videoId, sourceKey: source.videoId, initializedAt: checkedAt, initialScore: null };
      source.candidates = [{ title: source.title, url: source.url, likesDisplay: '未知', kind: source.kind }];
      add(v, s, inventory, 'synthetic-youtube', source);
    });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('Bilibili URL, CID and page ambiguity is rejected before it can identify a score source', () => {
  for (const mutate of [
    s => delete s.bilibili,
    s => { s.videoId = 'BVshort'; },
    s => { s.bilibili.cid = 123; },
    s => { s.bilibili.cid = '0'; },
    s => { s.bilibili.cid = '00123'; },
    s => { s.bilibili.cid = '123456789012345678901'; },
    s => { s.bilibili.startSeconds = 30; },
    s => { s.bilibili.page = '2'; },
    s => { s.bilibili.page = 0; },
    s => { s.bilibili.page = Number.MAX_SAFE_INTEGER + 1; },
    s => { s.url = `https://www.bilibili.com/video/${bv}`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=1`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=2&p=2`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=2&cid=1`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=2&cid=${s.bilibili.cid}&cid=${s.bilibili.cid}`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=2&t=3`; },
    s => { s.url = `https://www.bilibili.com/video/${bv}?p=2#part`; },
    s => { s.url = `https://www.bilibili.com.evil.example/video/${bv}?p=2`; },
    s => { s.url = `https://user@www.bilibili.com/video/${bv}?p=2`; },
    s => { s.url = `http://www.bilibili.com/video/${bv}?p=2`; },
  ]) rejects(mutate, /invalid exact Bilibili CID\/page identity/);
});

test('Bili program clips require exact range keys, real full-part bounds and matched candidate scope',()=>{
 const result=run((v,s,inventory)=>{
  const c={startSeconds:1085,endSeconds:1273,sourceDurationSeconds:1469,evidence:proof};
  add(v,s,inventory,'synthetic-clip',bili({clip:c,likesScope:'whole_video'}));
 });
 assert.equal(result.status,0,result.stderr);
 rejects(s=>{s.clip={startSeconds:1,endSeconds:10,sourceDurationSeconds:120,evidence:proof};},/clip score binding lacks exact source key/);
});
test('X video sources validate only explicit media-index identities and truthful whole-post popularity scope',()=>{
 const make=()=>{const x=bili({platform:'x',videoId:'2090845225845747984',url:'https://x.com/test_fixture/status/2090845225845747984/video/1',xMedia:{videoIndex:1},likesScope:'whole_post'});delete x.bilibili;x.scoreBinding={videoId:x.videoId,sourceKey:'x:'+x.videoId+':video:1',initializedAt:checkedAt,initialScore:null};x.candidates=[{platform:'x',videoId:x.videoId,xMedia:x.xMedia,title:x.title,url:x.url,likesDisplay:'未知',kind:x.kind}];return x;};
 assert.equal(run((v,s,i)=>add(v,s,i,'synthetic-x',make())).status,0);
 for(const mutate of [s=>{s.xMedia.videoIndex=2;},s=>{s.scoreBinding.sourceKey=s.videoId;},s=>{s.url=s.url.replace('/video/1','');},s=>{s.likesScope='performance';},s=>{s.selectionNote='点赞最高';}]){const r=run((v,s,i)=>{const x=make();mutate(x);add(v,s,i,'synthetic-x',x);});assert.notEqual(r.status,0);}
});

test('Bilibili score bindings and candidates must retain the complete CID/page identity', () => {
  for (const sourceKey of [undefined, bv, `bilibili:${bv}:cid:1:p:2`, `bilibili:${bv}:cid:12345678901234567890:p:1`]) {
    rejects(s => { s.scoreBinding.sourceKey = sourceKey; }, /Bilibili score binding requires exact CID\/page/);
  }
  rejects(s => { delete s.candidates[0].bilibili; }, /malformed or duplicate candidate/);
  rejects(s => { delete s.candidates[0].platform; }, /malformed or duplicate candidate/);
  rejects(s => { s.candidates[0].bilibili.cid = '1'; }, /selected source absent/);
  rejects(s => { s.candidates.push({ ...s.candidates[0], url: `${s.url}&cid=${s.bilibili.cid}` }); s.candidateCount += 1; }, /malformed or duplicate candidate/);
});

test('different parts of a BV can serve different works, but the same full identity cannot', () => {
  for (const other of [
    bili({ bilibili: { cid: '999', page: 3 }, url: `https://www.bilibili.com/video/${bv}?p=3` }),
    bili({ bilibili: { cid: '999', page: 2 }, url: `https://www.bilibili.com/video/${bv}?p=2` }),
  ]) {
    const result = run((v, s, inventory) => { add(v, s, inventory, 'synthetic-one', bili()); add(v, s, inventory, 'synthetic-two', other); });
    assert.equal(result.status, 0, result.stderr);
  }
  const reused = run((v, s, inventory) => { add(v, s, inventory, 'synthetic-one', bili()); add(v, s, inventory, 'synthetic-two', bili()); });
  assert.notEqual(reused.status, 0);
  assert.match(reused.stderr, /different group\/song/);
});

test('audio equivalence cannot transfer evidence between different Bilibili CID or page identities', () => {
  for (const part of [{ cid: '12345678901234567890', page: 2 }, { cid: '999', page: 2 }, { cid: '12345678901234567890', page: 3 }]) {
    const result = run((v, s, inventory) => {
      add(v, s, inventory, 'synthetic-one', bili());
      const source = bili({ bilibili: part, url: `https://www.bilibili.com/video/${bv}?p=${part.page}` });
      source.audioEquivalence = { sameAudio: true, originalBoundWorkId: 'synthetic-one', basis: 'Synthetic same-audio proof', evidenceUrls: proof.urls };
      add(v, s, inventory, 'synthetic-two', source);
    });
    if (part.cid === '12345678901234567890' && part.page === 2) assert.equal(result.status, 0, result.stderr);
    else { assert.notEqual(result.status, 0); assert.match(result.stderr, /audio equivalence lacks/); }
  }
});

test('unknown likes and mixed-platform candidates cannot claim a direct highest-like ranking', () => {
  rejects(s => { s.selectionNote = '同曲候选中点赞最高'; }, /unknown or rounded likes cannot claim highest/);
  rejects(s => { s.likes = { value: 200, display: '200', precision: 'exact', metric: 'views' }; }, /non-like metric/);
  for (const claim of [false, true]) {
    const result = run((v, s, inventory) => {
      const source = bili(); source.likes = { value: 200, display: '200', precision: 'exact' };
      source.candidates.push({ title: 'Synthetic YouTube candidate', url: 'https://www.youtube.com/watch?v=TestStage01', likesDisplay: '100', kind: 'broadcast_stage' });
      source.candidateCount = 2;
      source.selectionNote = claim ? '跨平台候选中点赞最高' : '跨平台点赞不可直接比较，按内容证据选择。';
      add(v, s, inventory, 'synthetic-bili', source);
    });
    if (claim) { assert.notEqual(result.status, 0); assert.match(result.stderr, /cross-platform candidates/); }
    else assert.equal(result.status, 0, result.stderr);
  }
});

test('broader source platforms and classes do not waive the evidence, occasion or completeness gates', () => {
  for (const mutate of [s => { delete s.selection; }, s => { s.selection.evidence = { note: '', urls: [] }; }, s => { s.selection.occasion = 'concert'; }, s => { s.completeness = 'excerpt'; }, s => { s.sourceClass = 'unclassified'; }]) {
    rejects(mutate, /new or changed source requires/);
  }
  rejects(s => { delete s.sourceEvidence; }, /third-party upload provenance evidence absent/);
  rejects(s => { s.sourceEvidence = { note: 'A title alone is not linked evidence.', urls: [] }; }, /third-party upload provenance evidence absent/);
});
