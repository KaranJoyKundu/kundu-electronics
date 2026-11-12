# CHANGELOG

## 2026-11-13 — Initial project and storefront foundation

### Created

- Local project `kundu-electronics` and Git branches `main`, `feat/storefront-foundation`.
- Root onboarding: `START_HERE.md`, `README.md`, `.env.example`, `.gitignore`, `.nvmrc`.
- Next.js/React/TypeScript/Tailwind configuration.
- Responsive global header/search/footer and homepage illustration/layout.
- Optional ৳0–৳200 quick price preset (no price filtering by default) and relevance-ranked partial search.
- Preserved the previous roadmap snapshot as `APPROVED_ROADMAP_SNAPSHOT.md`.
- Shop listing empty state and functional client-side search/filter/sort pipeline against supplied catalogue records.
- Empty cart, About, Support, Contact, Shipping & Returns and Product-not-found route shells.
- Central public-safe business configuration and public catalogue types/data.
- Catalogue search/filter unit tests using test-only Breadboard/LED fixtures (6 pass).
- `AGENTS.md` and `CLAUDE.md` project instructions.
- Proposed Supabase core schema migration.
- Project continuity documents and copied reference research.

### Changed

- None of the original local Kundu source files were available to change. All code is in the new project.

### Tests

- ZIP integrity: passed (`unzip -t`).
- Node/npm/git availability checked: Node v22.16.0, npm 10.9.2, Git 2.47.3.
- npm registry metadata request timed out; dependencies not installed. Typecheck/lint/unit tests/build not executed successfully yet.
- No browser screenshot or interaction test executed.

### Git history

- `d883393` — initial documentation/architecture baseline on `main`.
- `5e59330` — responsive storefront foundation on `feat/storefront-foundation`.
- `12e94d6` — catalogue filter refinements and project handoff updates on `feat/storefront-foundation`.

### Important outcomes

- GitHub private remote is not created; connected GitHub API has no create-repository action.
- No product/business/payment values are fabricated; public catalogue is empty.
