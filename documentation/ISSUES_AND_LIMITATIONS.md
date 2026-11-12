# ISSUES_AND_LIMITATIONS

## Active blockers

1. **GitHub remote unavailable:** The connected GitHub integration does not expose repository creation. The local Git repository is initialized but has no `origin`. Owner action or repository-create permission is needed to create a private `kundu-electronics` repository.
2. **Dependencies not installed:** npm registry request timed out in this environment. The project source/config exists, but typecheck/lint/tests/build remain unverified.
3. **No original Kundu project source:** No original source ZIP or accessible owner repository was found in the current connected GitHub scope. If later supplied, compare/merge carefully; do not overwrite it.
4. **No product data:** The public product/category arrays are empty. Product display and live search results remain empty by design.
5. **No Supabase project:** SQL migration is only proposed; no live DB, RLS or auth has been configured.
6. **No payment settings:** bKash/Nagad are disabled; receiving numbers are null. Do not enable without confirmed details.
7. **No operational business details:** phone, email, street address, opening hours, delivery charges, delivery promises, return policy and warranty are unset.
8. **Visual QA pending:** Responsive CSS is authored, but no screenshot/viewport run has been performed here.

## Research limitations retained from SparkFun report

- SparkFun research package contains 77 URL records, but 0 full responsive visual inspections, 0 screenshots and 0 live interaction executions.
- Exact SparkFun typography, CSS colors, spacing, dimensions and breakpoints remain unmeasured.
- Some routes failed via retrieval tools (including News/Learn and sitemap endpoints); see `research/ISSUES_AND_LIMITATIONS.md`.
- Research observations must be revalidated against a real browser before claiming pixel fidelity.

## Security / integrity notes

- Do not store credentials in Git or client code.
- Do not send Supabase secret/service-role keys to the browser.
- Keep internal purchase cost and supplier information out of public catalogue types, product payloads, HTML and API responses.
- Recompute order prices and stock server-side when checkout is implemented.
- Submitted transaction references are not proof of payment. Orders remain pending until manual verification.
- No customer/order storage exists yet; do not claim production checkout is live.
