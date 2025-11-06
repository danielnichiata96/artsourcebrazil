# Next Steps & Roadmap (Living Doc)

This file is the single source of truth for what to do next. Coding agents and humans should update it as work progresses.

> Conventions: Use the anchors below so agents know where to append updates. Keep items concise and actionable. Prefer small PRs.

## How to use

- Add/Update tasks under the appropriate section with checkboxes.
- When completing a task, check it off and add a short note in the Changelog.
- Agents: Insert updates between the named anchors and keep history intact.

---

## Immediate Next Steps (1–3 days)

<!-- AI-ANCHOR:IMMEDIATE-TASKS-START -->

- [x] Deploy to Vercel or Netlify
  - Connect repo, set build command `astro build`, output dir `dist`
  - Configure preview deployments for PRs
  - Update `astro.config.mjs` `site` to the real domain
  - Verify `robots.txt` sitemap URL resolves
- [x] Configure production env vars
  - `PUBLIC_STRIPE_PAYMENT_LINK`
  - `PUBLIC_JOB_FORM_URL`
- [x] Post-a-Job flow polish
  - Ensure payment success redirects to `/post-a-job/success` (Stripe success URL fixed)
  - Verify fallback link works when env is missing (page de sucesso segura)
- [ ] Minimal tests
  - Add Vitest with 2–3 unit tests for utilities (e.g., date sorting, unique tags)
  - Optional: Playwright smoke test (render home, toggle one filter)
- [ ] ESLint setup (optional but recommended)
  - Add Astro ESLint plugin and CI check
  <!-- AI-ANCHOR:IMMEDIATE-TASKS-END -->

---

## Short-Term Backlog (This week)

<!-- AI-ANCHOR:SHORT-TERM-BACKLOG-START -->

- [ ] A11y deeper audit (heading order, landmarks, labels)
- [ ] Analytics (Plausible) with opt-out
- [ ] Social share polish (OG image per page)
- [ ] 404 page and basic error content
- [ ] Job feeds: RSS/JSON export
- [ ] Simple contribution guide for adding jobs via PR
<!-- AI-ANCHOR:SHORT-TERM-BACKLOG-END -->

---

## Future Ideas (Nice to have)

<!-- AI-ANCHOR:FUTURE-IDEAS-START -->

- [ ] Auto-generate OG images (Satori/og-image)
- [ ] Category pages (static) for SEO
- [ ] Basic admin script to lint/normalize job entries
- [ ] Scheduled data validation in CI (nightly)
- [ ] Tag popularity insights
<!-- AI-ANCHOR:FUTURE-IDEAS-END -->

---

## Quality Gates (Definition of Done)

- Build passes (`astro build`)
- Formatting passes (`npm run format:check`)
- Data validation passes (Zod validator)
- Lint/tests (if configured) pass in CI
- A11y: interactive elements keyboard-accessible with visible focus

---

## Current Status Snapshot

- Build: PASS
- Formatting (Prettier): PASS
- Data validation: PASS
- CI: Build + format running on push/PR
- Tests: Not configured yet (planned)

---

## Changelog (high level)

<!-- AI-ANCHOR:CHANGELOG-START -->

- 2025-11-06: Corrigido sucesso do Stripe para URL de produção, botão da página de sucesso simplificado e link Tally confirmado; `astro.config.mjs` atualizado com `site` de produção.
- 2025-11-05: Added Zod validator (prebuild), improved a11y (focus, buttons), fixed Astro frontmatter issues, cleaned sitemap warning.
<!-- AI-ANCHOR:CHANGELOG-END -->

---

## Agent Update Template

Copy and fill this block when updating:

```md
### Update (YYYY-MM-DD)

- Section: Immediate | Short-Term | Future | Changelog
- Change:
  - Added/updated/removed task: <brief>
  - Status: not-started | in-progress | completed | deferred
  - Notes: <context/links>
```
