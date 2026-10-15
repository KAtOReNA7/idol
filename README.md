# Idol UI sandbox

Code-only development copy reconstructed from verified Sites v74 source plus the v75 patch. The production site is unchanged.

## Run
Node >=22.13. npm ci --ignore-scripts, npm run verify, npm run dev.

This sandbox contains the six released artist page components and shared UI logic, not the full production backend. Its catalog route returns a clearly labelled synthetic fixture of six groups, twelve fictional members and eighteen fictional works; add typed synthetic fixtures for UI testing, never export real user scores or notes. Official image files are excluded and image references replaced with a neutral SVG. Public researched editorial facts remain in artist content JSON; they are historical data, not fresh verification.

The /api/save route always returns HTTP 403; it never persists data. No production credentials, database snapshots, backup archives, management API, deployment workflow, or production write API are included. Do not deploy this sandbox over production. Work on independent branches and submit patches for integration into the maintained production source.

Bundled webfonts are excluded; system font fallback is expected. Member birthday values are omitted from the sandbox. No credentials or production environment variables are required.

## Member MV image preview

Member MV cards share a 4:5 frame, display the complete image with `object-fit: contain`, and open an accessible lightbox with Escape, close-button and backdrop dismissal. The close button receives focus; closing restores focus and page scrolling. Mobile cards stack without horizontal overflow.

The fixture has generated portrait (400×600), landscape (900×500), and missing-image cases. `/api/media` serves SVG drawings only for exact registered synthetic photo references; unknown records return 404. It performs no upstream image requests or production storage access. The fixture stays in snapshot mode and `/api/save` still returns 403.

Local validation: `npm run verify` (12 tests and typecheck), `npm run build`, and Playwright checks of the shared member page plus all six artist pages at desktop and mobile widths. Bundled fonts remain intentionally excluded as above; font and favicon 404s are baseline asset omissions, not image-interaction failures.
