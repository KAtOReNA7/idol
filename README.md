# Idol UI sandbox

Code-only development copy reconstructed from verified Sites v74 source plus the v75 patch. The production site is unchanged.

## Run
Node >=22.13. npm ci --ignore-scripts, npm run verify, npm run dev.

This sandbox contains the six released artist page components and shared UI logic, not the full production backend. Its catalog route returns a clearly labelled synthetic fixture of six groups, twelve fictional members and eighteen fictional works; add typed synthetic fixtures for UI testing, never export real user scores or notes. Official image files are excluded and image references replaced with a neutral SVG. Public researched editorial facts remain in artist content JSON; they are historical data, not fresh verification.

The /api/save route always returns HTTP 403; it never persists data. No production credentials, database snapshots, backup archives, management API, deployment workflow, or production write API are included. Do not deploy this sandbox over production. Work on independent branches and submit patches for integration into the maintained production source.

Bundled webfonts are excluded; system font fallback is expected. Member birthday values are omitted from the sandbox. No credentials or production environment variables are required.
