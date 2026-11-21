// Run against the anonymous journey-server fixture. Prints aggregate sizes and no record contents.
const assert = require('node:assert/strict');
const load = require('../helpers/public-artist-loader.cjs');
const {publicCreditForWork} = load('lib/idol/public-work-credits.ts');
const {workCatalogHeaders} = load('lib/idol/work-catalog-request.ts');

async function main() {
  const origin = new URL(process.argv[2] || 'http://127.0.0.1:8873');
  assert.equal(origin.protocol, 'http:');
  assert.equal(origin.hostname, '127.0.0.1');
  const endpoint = new URL('/api/catalog?shape=display-v1', origin);
  async function read(workId) {
    const response = await fetch(endpoint, {headers: workCatalogHeaders(workId)});
    assert.equal(response.status, 200);
    const body = await response.arrayBuffer();
    return {size: body.byteLength, data: JSON.parse(Buffer.from(body))};
  }

  const {size: fullBytes, data: full} = await read(null);
  assert.equal(full.scope, undefined);
  const sizes = [];
  for (const work of full.works) {
    const {size, data} = await read(work.id);
    assert.deepEqual(data.scope, {type: 'work', workId: work.id});
    const workIds = new Set([work.id, ...(work.versionDisplay?.links.map(link => link.workId) || [])]);
    assert.deepEqual(data.works, full.works.filter(item => workIds.has(item.id)));
    const ratings = full.ratings.filter(row => row.workIds.includes(work.id));
    assert.deepEqual(data.ratings, ratings);
    const members = new Set([...(publicCreditForWork(work)?.memberIds || []), ...ratings.flatMap(row => row.memberIds)]);
    assert.deepEqual(data.members, full.members.filter(row => members.has(row.id) ||
      [...row.groupIds, ...(row.formerGroupIds || [])].some(group => work.groupIds.includes(group))));
    const groups = new Set([...data.works.flatMap(row => row.groupIds),
      ...data.members.flatMap(row => [...row.groupIds, ...(row.formerGroupIds || [])])]);
    assert.deepEqual(data.groups, full.groups.filter(row => groups.has(row.id)));
    assert.equal(data.personalMvRatings, undefined);
    sizes.push(size);
  }
  sizes.sort((a, b) => a - b);
  const half = Math.floor(sizes.length / 2);
  console.log(JSON.stringify({groups: full.groups.length, works: sizes.length, fullBytes,
    medianDetailBytes: (sizes[half] + sizes[Math.floor((sizes.length - 1) / 2)]) / 2,
    minDetailBytes: sizes[0], maxDetailBytes: sizes.at(-1), totalDetailBytes: sizes.reduce((a,b) => a+b, 0)}));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
