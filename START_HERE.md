# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics
- Purpose: electronics-components e-commerce store
- Business location: Khulna, Bangladesh
- Currency: BDT (৳)
- Reference: https://www.sparkfun.com/
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private)
- Active branch: `feat/storefront-foundation`

## Read first

1. `documentation/PROJECT_STATE.md`
2. `documentation/TASK_TRACKER.md`
3. `documentation/TEST_REPORT.md`
4. `documentation/TYPECHECK_LINT_AUDIT_REMEDIATION.md`
5. `documentation/DECISIONS.md`
6. `documentation/IMPLEMENTATION_PLAN.md`
7. `documentation/ISSUES_AND_LIMITATIONS.md`
8. `documentation/PRODUCT_DATA_IMPORT.md`
9. `documentation/research/README.md`

## Current Git state

The connected GitHub identity is `KaranJoyKundu`. The repository is private. The remote branch heads last verified through GitHub were:

- `main`: `d88339395e6a1e34f9da904650efd1421480cf00`
- `feat/storefront-foundation`: `de253ee264ff6af743bb4ca18ae88964b680aa63`

Continue only on `feat/storefront-foundation`. Never merge this work to `main` without explicit approval. Do not force-push. The assistant-side local Git remote is a bundle path; a normal remote push must be done from the owner's Windows clone after importing the new update bundle and fetching GitHub.

## Stack and commands

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Supabase PostgreSQL/Auth/Storage code exists, but no real/staging Supabase project is connected or verified.
- Node.js 22.6+ is required by the current test script; owner environment: Node 24.14.0 and npm 11.21.1.

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

The owner's generated `package-lock.json` is required for `npm ci` and an exact npm audit. It is not present in the current assistant worktree. Attach it or commit it after confirming it contains no secrets. The supplied audit report shows seven moderate indirect alerts, rooted in the nested `minimatch` path; see `documentation/TEST_REPORT.md` before choosing a remediation. Do not run `npm audit fix --force`.

## Current remediation status

- Catalogue/cart/order/search TypeScript and React effect issues have source-level fixes and added tests.
- `npm test`: 38 passed in the assistant runtime.
- Targeted strict TS check: passed.
- Full typecheck, lint and build: **not executed here**, because the runtime has no installed Next/ESLint packages. Run all on Windows after importing the commit.
- No generated `.next` files were committed or edited.
- No master workbook, raw business brief, supplier record, buying price, private financial data or `.env.local` is in the project.

## Business data safety

- Public business details live in `src/config/business.ts`.
- Public Product types expose selling prices only.
- Product candidate import proposal is outside Git; do not publish until owner approves prices, SKU, stock status, specifications and images.
- No product is published. Do not fabricate stock, specs, images, ratings, opening hours, warranty, delivery charges or payment numbers.
- bKash/Nagad and delivery config remain disabled until owner provides approved values.
- Transaction reference submission is not payment verification.
- Never place Supabase secret/service-role keys in `NEXT_PUBLIC_*`, source, browser bundles, Git or chat.

## Next action

1. Review/import the verification-fix Git bundle into the Windows clone, check `git status`, fetch GitHub, confirm the feature branch can fast-forward, then push normally.
2. Provide the current Windows `package-lock.json` and audit dry-run output to finish dependency remediation safely.
3. Run the four checks on Windows and paste any remaining output.
4. Only then move to disposable Supabase migration/RLS tests and browser checkout testing.
