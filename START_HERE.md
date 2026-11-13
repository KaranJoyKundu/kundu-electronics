# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components e-commerce store
- Location/currency: Khulna, Bangladesh · BDT (৳)
- Reference: https://www.sparkfun.com/
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private)
- Active branch: `feat/storefront-foundation`
- Main must remain unchanged; do not merge without explicit owner approval.

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

## Current remote state before this verification follow-up

- Connected GitHub identity: `KaranJoyKundu`.
- Repository visibility: private.
- Remote `feat/storefront-foundation`: `5949f4cd3152aa595dd6433aaac27a7b85f3a87a`.
- Remote `main`: `d88339395e6a1e34f9da904650efd1421480cf00`.
- Continue only on `feat/storefront-foundation`. Never force-push or update `main`.

## Stack and commands

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Supabase PostgreSQL/Auth/Storage integration is implemented but no real/staging project has been connected or verified.
- Owner Windows environment: Node 24.14.0, npm 11.21.1, PowerShell 5.1.

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
```

## Latest verification follow-up

- Payment method parsing now validates and narrows untrusted runtime values to exactly `"bkash" | "nagad"`; malformed/unsupported configuration is discarded.
- Order status loading uses a pure async request plus an order-id-keyed result state. The effect does not synchronously set state; async completions are guarded by `AbortController` and a monotonically increasing request sequence. Refresh after payment uses the same stale-response guard.
- Cart product lookup no longer memoizes against a freshly-created empty array; the bounded cart product map is built directly.
- The immutability test fixture uses `const` for its unchanging stored value.
- Base `tsconfig.json` includes both Next 16 generated type directories. `tsconfig.typecheck.json` deliberately checks `.next/types` and source while excluding `.next/dev/types`. Production build uses Next's TypeScript API checker (`experimental.useTypeScriptCli: false`) so stale isolated-dev route validators are filtered on the build path.
- `npm test`: **42 passed, 0 failed** in this assistant runtime (Node 22.16.0 / npm 10.9.2).
- Targeted strict TypeScript check of the new dependency-free parser modules passed (global TypeScript 5.8.3).
- Full `npm run typecheck`, `npm run lint`, and `npm run build` could not run here: `next` and `eslint` are not installed, and npm registry DNS returned `EAI_AGAIN`.
- `npm audit` could not run here (`ENOLOCK`). No `package-lock.json` exists in the downloaded branch, GitHub tree, or uploaded files. The only Library `npm-audit.json` is dated 12 November 2026 and reports seven moderate indirect findings; it is not a fresh audit for the current dependency graph. No dependency changes were made.

## Privacy and publication rules

- Public business settings are centralized in `src/config/business.ts`.
- Public Product types expose selling prices only. Never add purchase prices, supplier identity or margins to public records.
- Never commit the raw business brief, master workbook, supplier documents, credentials or `.env.local`.
- Candidate products remain unapproved; do not invent stock, specifications, photographs, reviews, hours, warranty, delivery charges or payment numbers.
- bKash/Nagad and delivery configuration stay disabled until owner-approved values are configured.
- A submitted transaction reference is not payment verification.
- Never expose Supabase secret/service-role keys in `NEXT_PUBLIC_*`, browser code, Git or chat.

## Exact next action

1. On the owner's Windows clone, import the latest feature-branch Git bundle or pull the committed update, then verify the branch and working tree.
2. Provide the actual Windows-generated `package-lock.json` and the fresh `npm audit --json` output. They are not available in this worktree and must be inspected before any dependency remediation.
3. Run the full five-command verification set above on Node 24/npm 11, then share the output if any command fails.
4. Only after app verification, proceed with local/staging Supabase migrations, RLS/pgTAP and browser checkout testing.
