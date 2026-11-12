# Agent instructions — Kundu Electronics

## Before working

1. Read `START_HERE.md` and `documentation/PROJECT_STATE.md` first.
2. Read `documentation/TASK_TRACKER.md`, `IMPLEMENTATION_PLAN.md`, `DECISIONS.md`, `TEST_REPORT.md` and `ISSUES_AND_LIMITATIONS.md` for current status.
3. Consult `documentation/research/README.md` before using SparkFun reference findings.
4. Inspect current Git branch, `git status` and existing source before editing.
5. Do not assume previous-session claims are still true; verify current files and test outputs.

## Protect business data

- Never invent company details, prices, stock, reviews, warranty, delivery, returns or payment numbers.
- Do not publish product records until selling prices and customer-facing details have been approved.
- Do not expose supplier buying price, cost, margin, supplier name or private stock notes in browser data, APIs, logs or static files.
- Do not place secrets in `NEXT_PUBLIC_*`, committed `.env` files, client components or Git.
- Manual bKash/Nagad transfer references are unverified customer input. Orders stay pending until authorized staff confirm payment.

## Engineering workflow

- Keep `main` stable; use descriptive feature branches.
- Make small, focused commits with clear messages.
- Preserve existing working behavior. Do not delete files without tracing dependencies and documenting why.
- Use server-side validation and authoritative database prices/availability for orders.
- Keep interactive controls accessible by keyboard and touch.
- Do not add a dependency unless its benefit is clear and it is compatible with the selected stack.
- Do not claim tests, browser checks, payment integrations or deployment succeeded unless actually executed.

## Session closeout

Update `PROJECT_STATE.md`, `TASK_TRACKER.md`, `CHANGELOG.md`, `TEST_REPORT.md` and `ISSUES_AND_LIMITATIONS.md` whenever the state changes. Record exact commands and honest outcomes. End with an exact next task another agent can execute without asking the owner to repeat known details.
