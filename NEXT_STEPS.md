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
- [x] Configure production env vars
- [x] Post-a-Job flow polish
- [x] Smoke tests (Playwright)
- [x] SEO & Community (Milestone)
  - [x] Static Category pages at `/category/{slug}` with JobPosting JSON-LD
  - [x] Wire homepage category chips to the new routes
  - [x] Add Category routes to sitemap (auto via @astrojs/sitemap)
  - [x] JSON-LD Organization in `Layout.astro` and JobPosting for each job (home + category)
  - [x] Mark `/post-a-job/success` as `noindex`
  - [x] Jobs Feed (RSS + JSON) at `/jobs.xml` and `/jobs.json`
  - [x] Blog RSS feed at `/blog.xml`
  - [x] Newsletter capture in footer (Buttondown/ConvertKit form)
  - [x] Blog setup (content collections, /blog, /blog/[slug], BlogPosting JSON-LD)
  - [x] About page (/about) for E-E-A-T
- [x] Monitoring & basics
  - [x] Enable Vercel Analytics (script added; enable in Vercel Dashboard)
- [ ] Minimal tests
  - Add Vitest with 2–3 unit tests for utilities (e.g., date sorting, unique tags)
- [ ] ESLint setup (optional but recommended)
  - Add Astro ESLint plugin and CI check
  <!-- AI-ANCHOR:IMMEDIATE-TASKS-END -->

---

## Short-Term Backlog (This week)

<!-- AI-ANCHOR:SHORT-TERM-BACKLOG-START -->

- [x] 404 page
  - Custom 404.astro with links back to home and categories
- [ ] **Uptime Monitoring**
  - Add simple probe (Checkly/Cronitor/Better Uptime) for `/` and `/post-a-job`
  - Alert on downtime or slow response (>3s)
- [ ] **Blog content expansion**
  - Write 2–3 more posts: "Salary Guide for Artists in Brazil", "How to Build a Portfolio for Game Studios"
  - Share on LinkedIn/X to drive organic traffic
- [ ] **Social share for blog posts**
  - Add Twitter/LinkedIn share buttons on individual blog posts
- [ ] **OG images per page**
  - Generate unique OG images for category pages and blog posts (Satori/og-image or manual)
- [ ] **Discord/Slack community**
  - Set up Discord server or Slack workspace for community
  - Update /about page with real invite link
- [ ] **Contribution guide**
  - Simple CONTRIBUTING.md for adding jobs via PR
  - Template for job JSON format
- [ ] **A11y deeper audit**
  - Verify heading order, landmarks, ARIA labels
  - Test with screen reader (NVDA/VoiceOver)
- [ ] **Image optimization**
  - Add width/height to all logos
  - Compress/optimize static images
  - Lazy load images below fold
- [ ] **Validate Rich Results**
  - Test all JSON-LD (Organization, JobPosting, BlogPosting) with Google Rich Results Test
  - Fix any warnings/errors
<!-- AI-ANCHOR:SHORT-TERM-BACKLOG-END -->

---

## Future Ideas (Nice to have)

<!-- AI-ANCHOR:FUTURE-IDEAS-START -->

- [ ] Auto-generate OG images (Satori/og-image)
- [ ] Basic admin script to lint/normalize job entries
- [ ] Scheduled data validation in CI (nightly)
- [ ] Tag popularity insights
- [ ] Intake automation (no backend): Tally → GitHub Issue/PR via Zapier/Make
  - Each new submission becomes an Issue or PR with a filled job JSON stub
- [ ] i18n (PT → EN) minimal
  - Static alternate homepage in PT-BR and `/post-a-job` page copy for BR companies
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

- 2025-11-06: **Custom 404 page**: Created `src/pages/404.astro` for a better user experience on missing pages.
- 2025-11-06: **SEO/Community milestone COMPLETED**: Category pages, JSON-LD (Organization, JobPosting, BlogPosting), feeds (jobs RSS/JSON, blog RSS), newsletter footer, About page, Blog setup. Homepage refactored to use global Layout.
- 2025-11-06: Adicionados smoke tests E2E (Playwright): success page e homepage filters; CI atualizado para rodar testes automaticamente.
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
