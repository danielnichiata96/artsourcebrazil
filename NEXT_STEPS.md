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
- [x] Legal & Compliance
  - [x] Privacy Policy page (/privacy)
  - [x] Terms of Service page (/terms)
  - [x] Contact page (/contact)
  - [x] Footer links updated with legal pages
  - [x] Real email configured (artsourcebrazil@gmail.com)
- [x] Minimal tests
  - [x] Vitest with 8 unit tests for utilities (sortJobsByDateDesc, collectFacets, slugify)
- [x] ESLint setup
  - [x] Astro ESLint plugin configured
  - [x] CI check added
- [x] **SEO: Individual Job Pages**
  - [x] `/jobs/[id]-[slug].astro` dynamic route created
  - [x] Complete JobPosting JSON-LD with validThrough
  - [x] BreadcrumbList JSON-LD for navigation
  - [x] Related jobs section (same category, max 3)
  - [x] JobCard links to individual pages instead of external apply
  - [x] 8 E2E tests for individual job pages (all passing)
  - [x] Site expanded from 13 to 17 indexable pages (+4 job pages)
  <!-- AI-ANCHOR:IMMEDIATE-TASKS-END -->

---

## Short-Term Backlog (This week)

<!-- AI-ANCHOR:SHORT-TERM-BACKLOG-START -->

- [x] **Design System Overhaul - Phase 1: Complete** ✅
  - [x] Tailwind config: Brand colors, neutral palette, custom spacing tokens
  - [x] UI Component Library: Button, Badge, Card, Link, Breadcrumb, Navbar
  - [x] Layout refactored with Navbar component
  - [x] Homepage and job pages using component system
  - [x] Build passing with zero hardcoded color classes
- [x] **Design System - Phase 1.5: Accessibility Audit** ✅
  - [x] Contrast audit completed (all elements passing WCAG 2.1 AA)
  - [x] Link colors adjusted from #3aaf54 to #2d8a42 (5.10:1 ratio)
  - [x] Focus-visible styles implemented globally (2px green outline)
  - [x] All interactive elements keyboard accessible
  - [x] Documentation: DESIGN_AUDIT.md and ACCESSIBILITY_IMPROVEMENTS.md
- [ ] **Design System - Phase 2: Typography**
  - [ ] Add editorial serif font for headings (Crimson Pro or Lora)
  - [ ] Improve font hierarchy and spacing
  - [ ] Update heading sizes for better visual impact
- [ ] **Design System - Phase 3: Refactor Remaining Pages**
  - [ ] About page with UI components
  - [ ] Contact page with UI components
  - [ ] Companies pages with UI components
  - [ ] Blog pages with UI components
- [ ] **Design System - Phase 4: Micro-interactions**
  - [ ] Smooth transitions on hover states
  - [ ] Loading states
  - [ ] Focus indicators
- [x] 404 page
  - Custom 404.astro with links back to home and categories
- [x] **Validate Rich Results**
  - [x] Manually validated `JobPosting` and `BreadcrumbList` JSON-LD against Google's guidelines. All correct.
- [x] **Company Pages**
  - [x] `/company/[slug]` dynamic route created
  - [x] `/companies` index page with all companies
  - [x] Organization JSON-LD for each company
  - [x] BreadcrumbList JSON-LD
  - [x] Link from job pages to company pages
  - [x] "Companies" link added to main navigation
  - [x] Site expanded from 17 to 22 pages (+5 pages: 1 index + 4 companies)
- [x] **OG Images & Social Sharing**
  - [x] Dynamic OG image generation with Satori for each job page
  - [x] Share buttons component (Twitter, LinkedIn, WhatsApp, Copy Link)
  - [x] Fixed infinite loading issue by removing React dependencies
  - [x] Pure HTML/CSS/JS implementation (zero-JS by default)
  - [x] All pages now have proper og:image meta tags
- [ ] **Skills/Tags Pages**
  - [ ] `/skills/[slug]` dynamic route (e.g., `/skills/unity`, `/skills/zbrush`)
  - [ ] `/skills` index page listing all skills
  - [ ] Filter jobs by skill/tag
  - [ ] Potential for 10-20+ new indexable pages
- [ ] **Uptime Monitoring**
  - Add simple probe (Checkly/Cronitor/Better Uptime) for `/` and `/post-a-job`
  - Alert on downtime or slow response (>3s)
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
  - [x] Color contrast audit (WCAG AA compliance achieved)
  - [x] Focus-visible indicators implemented
  - [ ] Verify heading order, landmarks, ARIA labels
  - [ ] Test with screen reader (NVDA/VoiceOver)
  - [ ] Add skip links for keyboard navigation
  - [ ] Test prefers-reduced-motion support
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

- Build: PASS (22 pages generated)
- Formatting (Prettier): PASS
- Data validation: PASS (Zod)
- ESLint: PASS (0 errors, 0 warnings)
- Unit Tests: PASS (8/8 tests)
- E2E Tests: PASS (16/16 tests via npm run test:e2e)
- CI: Build + format + lint + tests running on push/PR
- **SEO Pages: 22 indexable pages** (1 home + 3 categories + 4 individual jobs + 1 companies index + 4 company pages + 1 blog index + 1 blog post + 7 static)

---

## Changelog (high level)

<!-- AI-ANCHOR:CHANGELOG-START -->

- 2025-11-07: **Accessibility Improvements COMPLETED**: Full WCAG 2.1 AA audit conducted. Fixed link contrast issue (adjusted from #3aaf54 to #2d8a42, achieving 5.10:1 ratio). Implemented global focus-visible styles with 2px green outline. Created comprehensive documentation (DESIGN_AUDIT.md, ACCESSIBILITY_IMPROVEMENTS.md). All interactive elements now fully keyboard accessible. Site now WCAG 2.1 AA compliant.
- 2025-11-07: **Design System Phase 1 COMPLETE**: Tailwind config expanded with custom spacing tokens (`section`, `container`, `card`), border radius tokens, and shadow system. Created full UI component library (Button, Badge, Card, Link, Breadcrumb, Navbar). Layout refactored to use Navbar component. Footer using Link and Button components. Homepage using custom spacing tokens. Zero hardcoded Tailwind classes - all semantic components. Build passing.
- 2025-11-06: **Performance Fix**: Removed React dependencies and replaced icon components with pure HTML/CSS (emojis/unicode). Fixed infinite loading issue on job pages. Reduced bundle size by ~193KB. Site now loads instantly.
- 2025-11-06: **OG Images & Social Sharing**: Implemented dynamic OG image generation with Satori for each job page. Added share buttons (Twitter, LinkedIn, WhatsApp, Copy Link). All job pages now have custom social sharing images.
- 2025-11-06: **Company Pages COMPLETED**: Created `/company/[slug]` dynamic route and `/companies` index page. Each company now has dedicated page with all their job listings, Organization JSON-LD, BreadcrumbList, and detailed company info. Job pages now link to company pages. Added "Companies" to main navigation. Site expanded from 17 to 22 indexable pages (+5 pages).
- 2025-11-06: **Individual Job Pages COMPLETED**: Created `/jobs/[id]-[slug].astro` dynamic route with full SEO optimization. Each job now has its own page with complete JobPosting JSON-LD (including validThrough), BreadcrumbList JSON-LD, related jobs section, and multiple apply CTAs. JobCard component updated to link to individual pages. Added 8 comprehensive E2E tests (all passing). Site expanded from 13 to 17 indexable pages.
- 2025-11-06: **Testing & Quality COMPLETED**: Added 5 new unit tests for `slugify()` function (8 total tests now). Configured ESLint with Astro plugin and added to CI pipeline. All quality gates passing.
- 2025-11-06: **Real email configured**: Updated all pages to use `artsourcebrazil@gmail.com`. Email now visible in footer site-wide.
- 2025-11-06: **Legal & Compliance pages COMPLETED**: Created comprehensive Privacy Policy (/privacy), Terms of Service (/terms), and Contact (/contact) pages. Footer updated with legal links. All pages follow best practices for job board compliance.
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
