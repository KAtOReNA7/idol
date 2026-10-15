# Idol

Private development repository for the idol website project.

## Development status

This repository contains an isolated core logic and tools package with synthetic tests. It does not contain the complete UI and has not been published or deployed. See docs/CORE-SANDBOX.md for scope, source commits, and the file manifest.

## Development boundaries

- Work in isolated feature branches and submit changes for review.
- Do not modify production data or deploy without an explicit task.
- Never commit credentials, environment secrets, personal ratings or notes, database exports, backups, or private runtime logs.
- Keep licensed photo assets and production media in their existing private storage.
- Use synthetic fixtures for tests. Preserve existing user ratings, notes, viewing status, and record relationships.

## Validation

Use Node.js >=22.13.0. Run `npm ci --ignore-scripts`, then `npm run verify` (TypeScript check and 84 synthetic tests). Run `node scripts/repo-hygiene.mjs` separately to check tracked paths. No production credentials or data are required.
