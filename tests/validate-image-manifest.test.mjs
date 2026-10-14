import assert from 'node:assert/strict';
import test from 'node:test';
import { validateImageManifest } from '../scripts/validate-image-manifest.mjs';

// Entirely synthetic metadata; no photos or real member data are used.
const makeRecord = (overrides = {}) => ({
  recordId: 'synthetic-record-1',
  memberId: 'synthetic-member-1',
  videoId: 'Abc_123-XYZ',
  sourceUrl: 'https://example.invalid/synthetic-image.png',
  nameEvidence: 'Synthetic caption names Synthetic Member One.',
  sha256: 'a1'.repeat(32),
  width: 640,
  height: 480,
  ...overrides,
});

function assertFieldError(record, field) {
  const result = validateImageManifest([record]);
  assert.equal(result.valid, false);
  assert.equal(result.empty, false);
  assert.equal(result.recordCount, 1);
  assert.deepEqual(result.errors.map(({ index, field }) => ({ index, field })),
    [{ index: 0, field }]);
}

test('valid synthetic records, including repeated member/video IDs, pass', () => {
  const manifest = [makeRecord(), makeRecord({ recordId: 'synthetic-record-2', sha256: 'AB'.repeat(32) })];
  assert.deepEqual(validateImageManifest(manifest), {
    valid: true, empty: false, recordCount: 2, errors: [],
  });
});

test('empty array explicitly succeeds as empty', () => {
  assert.deepEqual(validateImageManifest([]), {
    valid: true, empty: true, recordCount: 0, errors: [],
  });
});

for (const value of [null, undefined, {}, '[]', 1]) {
  test(`non-array manifest is rejected: ${String(value)}`, () => {
    const result = validateImageManifest(value);
    assert.equal(result.valid, false);
    assert.equal(result.empty, false);
    assert.equal(result.errors[0].field, 'manifest');
  });
}

for (const value of [null, undefined, [], 'record', 1]) {
  test(`non-object record is rejected: ${String(value)}`, () => {
    assertFieldError(value, 'record');
  });
}

test('sparse arrays cannot skip record validation', () => {
  const result = validateImageManifest(new Array(1));
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].field, 'record');
});

for (const field of Object.keys(makeRecord())) {
  test(`missing ${field} is rejected`, () => {
    const record = makeRecord();
    delete record[field];
    assertFieldError(record, field);
  });
}

for (const field of ['recordId', 'memberId', 'nameEvidence']) {
  test(`${field} requires non-empty text`, () => {
    for (const value of ['', ' \n\t', null, 42, {}, []]) {
      assertFieldError(makeRecord({ [field]: value }), field);
    }
  });
}

test('duplicate recordId is rejected even with different member IDs', () => {
  const result = validateImageManifest([makeRecord(), makeRecord({ memberId: 'synthetic-member-2' })]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [{ index: 1, field: 'recordId', message: 'Duplicate recordId.' }]);
});

test('invalid and non-HTTPS URLs are rejected', () => {
  for (const sourceUrl of [
    'http://example.invalid/a.png', 'ftp://example.invalid/a.png',
    'javascript:alert(1)', 'data:image/png;base64,AA', '/image.png',
    'https:', 'https://', 'https:example.invalid', 'https:///example.invalid',
    'https://bad host/a.png', ' https://example.invalid/a.png',
    'https://example.invalid/a.png\n', 'https://example.invalid\\a.png',
    'https://[invalid]/a.png', null, 42,
  ]) {
    assertFieldError(makeRecord({ sourceUrl }), 'sourceUrl');
  }
});

test('YouTube videoId must have exactly 11 allowed characters', () => {
  for (const videoId of ['', 'a'.repeat(10), 'a'.repeat(12), 'a'.repeat(10) + '!',
    'a'.repeat(10) + '\n', ' '.repeat(11), '界'.repeat(11), 12345678901, null]) {
    assertFieldError(makeRecord({ videoId }), 'videoId');
  }
});

test('sha256 must be exactly 64 hexadecimal characters', () => {
  for (const sha256 of ['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64),
    'a'.repeat(63) + '\n', 'sha256:' + 'a'.repeat(64), 42, null]) {
    assertFieldError(makeRecord({ sha256 }), 'sha256');
  }
});

for (const field of ['width', 'height']) {
  test(`${field} must be a positive safe integer`, () => {
    for (const value of [0, -1, 1.5, '640', null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assertFieldError(makeRecord({ [field]: value }), field);
    }
    assert.equal(validateImageManifest([makeRecord({ [field]: 1 })]).valid, true);
  });
}

test('all structural errors are collected without changing the input', () => {
  const record = Object.freeze(makeRecord({ width: 0, height: -1, nameEvidence: '' }));
  const manifest = Object.freeze([record]);
  const before = structuredClone(manifest);
  const first = validateImageManifest(manifest);
  assert.deepEqual(first.errors.map(({ field }) => field), ['nameEvidence', 'width', 'height']);
  assert.deepEqual(validateImageManifest(manifest), first);
  assert.deepEqual(manifest, before);
});
