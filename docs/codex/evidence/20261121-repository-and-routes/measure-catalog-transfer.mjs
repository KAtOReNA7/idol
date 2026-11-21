// Run against npm run preview:synthetic -- <port>. Reports sizes, never catalog contents.
import assert from 'node:assert/strict';
import {get} from 'node:http';
import {gunzipSync} from 'node:zlib';

const port = Number(process.argv[2] ?? 8787);
assert.ok(Number.isInteger(port) && port > 0 && port <= 65535, 'Expected a local port');
async function catalog(scope, compact) {
  const query = new URLSearchParams({shape: 'display-v1'});
  if (scope) query.set('artist', scope);
  const headers = {'Accept-Encoding': 'gzip'};
  if (compact) headers.Prefer = 'omit-stage-candidates';
  const response = await new Promise((resolve, reject) => {
    get({hostname: '127.0.0.1', port, path: '/api/catalog?' + query, headers}, resolve).on('error', reject);
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-encoding'], 'gzip');
  assert.match(response.headers['cache-control'], /no-store/);
  if (compact) {
    assert.equal(response.headers['preference-applied'], headers.Prefer);
    assert.match(response.headers.vary, /\bPrefer\b/i);
  }
  const chunks = [];
  for await (const chunk of response) chunks.push(chunk);
  const wire = Buffer.concat(chunks);
  const raw = gunzipSync(wire);
  return {data: JSON.parse(raw), jsonBytes: raw.length, gzipBytes: wire.length};
}

for (const scope of ['', 'ive']) {
  const full = await catalog(scope, false);
  const compact = await catalog(scope, true);
  const expected = structuredClone(full.data);
  let candidateRows = 0;
  for (const work of expected.works) {
    if (!Array.isArray(work.stage?.candidates)) continue;
    candidateRows += work.stage.candidates.length;
    delete work.stage.candidates;
  }
  delete expected.loadedAt;
  delete compact.data.loadedAt;
  assert.deepEqual(compact.data, expected);
  console.log(JSON.stringify({
    scope: scope || 'all', works: expected.works.length, candidateRows,
    fullJson: full.jsonBytes, compactJson: compact.jsonBytes, fullGzip: full.gzipBytes, compactGzip: compact.gzipBytes,
    savedGzip: full.gzipBytes - compact.gzipBytes,
  }));
}
