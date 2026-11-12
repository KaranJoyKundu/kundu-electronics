# TASK_TRACKER

Status key: Not started · In progress · Blocked · Completed · Needs verification

| Task ID | Priority | Task | Status | Dependencies | Acceptance criteria |
|---|---|---|---|---|---|
| KE-001 | P0 | Final connected-repository recovery and replacement authorization | Completed | Owner approval | Search performed; no accessible existing project found; replacement authorized |
| KE-002 | P0 | Create local project skeleton and preserve research package | Completed | KE-001 | All research docs copied and readable; app/docs structure exists |
| KE-003 | P0 | Create Git main baseline and feature branch | Completed | KE-002 | Initial commit on main; working branch created; no remote falsely claimed |
| KE-004 | P0 | Establish Next/React/TS/Tailwind architecture | Completed | KE-002 | package/config/app-router foundation written and architecture decision documented |
| KE-005 | P0 | Create central business config and safe catalogue model | Completed | KE-004 | No fake values; empty published catalogue; public Product excludes buying cost |
| KE-006 | P0 | Implement responsive global shell and initial homepage | In progress | KE-004 | Header/footer/home routes authored; requires browser QA after install |
| KE-007 | P0 | Implement search and filter core utilities | Completed | KE-005 | Six Node tests pass for partial `b` matching, case-insensitive matching, draft exclusion, combined inclusive filters, sort and empty query; catalogue integration remains pending real inventory |
| KE-008 | P0 | Install dependencies and run initial checks | Blocked | Network/npm registry | npm install, typecheck, lint, test, build all executed and failures fixed |
| KE-009 | P0 | Obtain verified selling-price/inventory document | Blocked | Owner supplies file | Import mapping separates selling price from purchase cost; no private cost exposed |
| KE-010 | P1 | Validate category taxonomy and import catalogue | Not started | KE-009 | Only owner-confirmed categories/products are published |
| KE-011 | P1 | Implement product detail variants and image gallery | Not started | KE-010 | SKU, price, availability and real specs match source data |
| KE-012 | P1 | Implement persistent cart | Not started | KE-010 | Add/remove/change qty/persist/recalculate totals pass tests |
| KE-013 | P1 | Create Supabase project and apply reviewed schema | Blocked | Owner creates Supabase project | RLS reviewed; secret keys remain server-only |
| KE-014 | P1 | Implement secure server-side order creation | Not started | KE-013 | Server recalculates amounts; no client-trusted price or stock |
| KE-015 | P1 | Configure manual bKash/Nagad and pending verification | Blocked | Owner provides receiving numbers and instructions | Orders remain pending until manual admin verification |
| KE-016 | P1 | Add protected order/admin management | Not started | KE-013, KE-014 | Only authorized admin can view/update private orders |
| KE-017 | P2 | Complete shipping/returns/FAQ pages with confirmed policies | Blocked | Owner policy details | No unsupported delivery/warranty promises |
| KE-018 | P1 | Visual and responsive QA at required viewport sizes | Blocked | Dependencies installed + browser available | Screenshots and issues recorded at 1440, 1366, 768, 390 widths |
| KE-019 | P2 | Create private GitHub remote and push branches | Blocked | Repo-create permission or owner creates remote | `origin` points to private `kundu-electronics`; both branches pushed |
| KE-020 | P2 | Deploy preview and production release | Not started | Backend/config/data QA | Checkout tested in dry-run; no placeholders on production |

## Session handoff update

13 November 2026: local foundation and research preservation completed. Package install/build/test results remain unverified because npm registry access timed out. No business data or credentials were fabricated.
