import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {canonicalReviewPath, normalizeReviewLocation} from '../review/genblue/routes.mjs';

test('directory, explicit HTML and review aliases all enter the native GENBLUE route', () => {
  for (const path of ['/artists/genblue', '/artists/genblue/', '/artists/genblue/index.html', '/review-genblue', '/review-genblue/', '/review-genblue/index.html']) {
    assert.equal(canonicalReviewPath(path), '/artists/genblue');
  }
  assert.equal(canonicalReviewPath('/index.html'), '/');
});

test('static entry normalization preserves deep-link queries, fragments and return state without adding history', () => {
  for (const search of ['?section=members&member=rec28krkUzoxdS', '?section=works&format=mv&media=night-market-queen-mv', '?section=updates']) {
    const state = {genblueOrigin:{from:'/artists/genblue?section=works'},scrollY:420};
    const calls = [];
    const history = {state,replaceState:(...args)=>calls.push(args),pushState:()=>assert.fail('Must not add a back-navigation entry')};
    assert.equal(normalizeReviewLocation({pathname:'/artists/genblue/index.html',search,hash:'#details'},history),'/artists/genblue');
    assert.equal(calls.length,1);
    assert.strictEqual(calls[0][0],state);
    assert.equal(calls[0][2],'/artists/genblue'+search+'#details');
  }
});

test('shared record URLs and unknown paths retain their identity', () => {
  for (const pathname of ['/', '/artists/genblue', '/artists/wooah', '/api/save', '/artists/genblue/unknown']) {
    assert.equal(normalizeReviewLocation({pathname,search:'?view=works&work=recExample',hash:''},{state:null,replaceState:()=>assert.fail('Unexpected rewrite')}),pathname);
  }
});

test('the built review includes a physical GENBLUE entry with resolvable scripts and styles', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(),'genblue-route-test-'));
  try {
    execFileSync(process.execPath,['scripts/build-genblue-review.mjs','--out',out],{stdio:'pipe'});
    const html = fs.readFileSync(path.join(out,'artists/genblue/index.html'),'utf8');
    assert.equal(html,fs.readFileSync(path.join(out,'index.html'),'utf8'));
    assert.equal(html,fs.readFileSync(path.join(out,'review-genblue/index.html'),'utf8'));
    assert.match(html,/<div id="root"><\/div>/);
    assert.match(html,/示例资料 · 评分不写入正式手帐/);
    for (const asset of html.matchAll(/(?:src|href)="(\/review-genblue\/[^\"]+\.(?:js|css))"/g)) {
      assert.ok(fs.statSync(path.join(out,asset[1])).size>0,asset[1]);
    }
    assert.match(html,/connect-src 'none'/);
  } finally {
    fs.rmSync(out,{recursive:true,force:true});
  }
});
