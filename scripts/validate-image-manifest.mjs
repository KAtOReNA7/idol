/**
 * Validate image manifest structure without I/O or input mutation.
 * This does not verify images, identities, evidence truth, or file hashes.
 * Empty arrays are valid and explicitly reported with empty: true.
 * Errors identify the zero-based entry index (null for a manifest error).
 */
export function validateImageManifest(manifest) {
  const errors = [];
  if (!Array.isArray(manifest)) {
    return {
      valid: false,
      empty: false,
      recordCount: 0,
      errors: [{ index: null, field: 'manifest', message: 'Must be an array.' }],
    };
  }

  const recordIds = new Set();
  const nonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;
  for (let index = 0; index < manifest.length; index += 1) {
    const record = manifest[index];
    const error = (field, message) => errors.push({ index, field, message });
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      error('record', 'Must be an object.');
      continue;
    }

    for (const field of ['recordId', 'memberId', 'nameEvidence']) {
      if (!nonEmptyText(record[field])) {
        error(field, 'Must be non-empty text.');
      }
    }
    if (nonEmptyText(record.recordId)) {
      if (recordIds.has(record.recordId)) {
        error('recordId', 'Duplicate recordId.');
      }
      recordIds.add(record.recordId);
    }

    if (typeof record.videoId !== 'string' || record.videoId.length !== 11 ||
        !/^[A-Za-z0-9_-]+$/.test(record.videoId)) {
      error('videoId', 'Must be exactly 11 YouTube video ID characters.');
    }

    let httpsUrl = false;
    if (typeof record.sourceUrl === 'string' && /^https:\/\/[^/]/i.test(record.sourceUrl) &&
        !/[\s\\]/u.test(record.sourceUrl)) {
      try {
        const url = new URL(record.sourceUrl);
        httpsUrl = url.protocol === 'https:' && url.hostname.length > 0;
      } catch {
        // Invalid URLs are reported as structural errors below.
      }
    }
    if (!httpsUrl) error('sourceUrl', 'Must be an absolute HTTPS URL.');

    if (typeof record.sha256 !== 'string' || record.sha256.length !== 64 ||
        !/^[a-fA-F0-9]+$/.test(record.sha256)) {
      error('sha256', 'Must be 64 hexadecimal characters.');
    }
    for (const field of ['width', 'height']) {
      if (!Number.isSafeInteger(record[field]) || record[field] <= 0) {
        error(field, 'Must be a positive safe integer.');
      }
    }
  }

  return {
    valid: errors.length === 0,
    empty: manifest.length === 0,
    recordCount: manifest.length,
    errors,
  };
}
