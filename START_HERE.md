# START HERE — Kundu Electronics

## Project identity

- Project: Kundu Electronics — electronics-components e-commerce store
- Location/currency: Khulna, Bangladesh · BDT (৳)
- Reference: https://www.sparkfun.com/
- GitHub: https://github.com/KaranJoyKundu/kundu-electronics (private)
- Default branch: `main`
- Current launch work: `feat/launch-prep`
- Do not force-push. Do not put secrets or owner-only business data in Git.

## Read first

1. `documentation/LAUNCH_STATUS.md` — current verified launch and hosting state
2. `documentation/PROJECT_STATE.md`
3. `documentation/TASK_TRACKER.md`
4. `documentation/TEST_REPORT.md`
5. `documentation/DEPENDENCY_SECURITY_REMEDIATION.md`
6. `documentation/DECISIONS.md`
7. `documentation/PRODUCT_DATA_IMPORT.md`
8. `documentation/research/README.md`

## Stack and local commands

- Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Tailwind CSS 4.3.3.
- Node.js 24 and npm 11 are used for Windows CI.

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
```

## Privacy and publication rules

- Public business settings are centralized in `src/config/business.ts`.
- Public Product types expose selling prices only. Never add purchase prices, supplier identity, internal stock notes or margins to public records.
- Never commit the raw business brief, master workbook, supplier documents, credentials or `.env.local`.
- Product photos in the owner-provided set may be shown as enquiry previews; they are not a stock list or price list.
- No product is purchasable until its selling price and availability are confirmed.
- bKash/Nagad and checkout remain disabled until owner-approved receiving numbers, instructions, delivery zones/charges and server secrets are configured and verified.
- A submitted transaction reference is not payment verification.
- Never expose Supabase secret/service-role keys in `NEXT_PUBLIC_*`, browser code, Git or chat.
