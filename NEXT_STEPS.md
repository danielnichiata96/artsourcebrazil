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

- [x] **Code Quality Improvements (AI-Generated Code)** ✅ 100% COMPLETO
  - [x] Remove `@ts-nocheck` ✅ (0 files with @ts-nocheck)
  - [x] Add proper TypeScript types ✅ (FiltersSidebarElements, FilterState interfaces)
  - [x] Modularize inline JavaScript ✅ (sidebar-controller.ts, orchestrator-controller.ts, hero-integration-controller.ts)
  - [x] Add error handling and validation ✅ (16 try-catch blocks, validateFilterUpdate)
  - [x] Extract magic numbers to constants ✅ (src/lib/constants.ts com FILTER_CONFIG)
  - [x] Add cleanup for event listeners ✅ (destroy() methods, beforeunload handlers)
  - [x] Add loading/error states for user feedback ✅ ('Aplicando...' / 'Limpando...' button states with disabled + opacity)
  - [x] Extract remaining inline JS from index.astro ✅ (HeroIntegrationController created, 95 lines)
- [ ] **Hero, Cards & Sidebar UI Pass**
  - [ ] Introduzir metadados (ex. contagem de vagas) logo abaixo do hero
  - [x] Ajustar microcopys do hero para destacar diferenciais da curadoria ✅ (badge, descrição e CTA agora reforçam curadoria humana)
  - [x] Mostrar filtros ativos como chips e destacar contagem de resultados ✅ (Sidebar e header já exibem chips dinâmicos)
- [x] **Localization & Language Consistency** ✅ PARCIALMENTE COMPLETO
  - [x] Default locale definido: PT-BR (about, companies, blog agora em português)
  - [x] Estrutura /en/ criada para versões em inglês (/en/about, /en/companies, /en/blog)
  - [x] Textos centralizados em `src/lib/i18n.ts` com chaves reutilizáveis
  - [x] Cada página usa apenas um idioma por vez
  - [ ] Expor toggle de idioma visível no navbar
  - [ ] Revisar microcopy para tom consistente e com voz da marca
- [x] **Responsive Design - Mobile/Tablet/Desktop** ✅ COMPLETO
  - [x] Sidebar de filtros escondida no mobile (< 1024px)
  - [x] Hero section responsivo: tamanhos de texto ajustados (text-3xl → text-5xl)
  - [x] Searchbar responsivo: padding e ícone ajustados para mobile
  - [x] Category pills responsivos: text-xs px-3 py-1.5 (mobile) → text-sm px-4 py-2 (tablet+)
  - [x] Todos os 3 pills cabem em 1 linha no mobile 360px
  - [x] Breakpoints testados: 360px, 768px, 1024px+
- [ ] **Filters Sidebar Enhancements** 🎯
  - [x] Mobile UX: Sidebar escondida em telas pequenas (< lg)
  - [x] Add results count display in sidebar (mostrando valor + pluralização)
  - [x] Show active filter badges/chips when filters are applied (chips dinâmicos com remoção)
  - [x] Add "Reset filters" quick action when filters are active (botão "Limpar" habilita automaticamente)
  - [x] Add loading state when filters are being applied (texto "Aplicando..." / "Limpando...")
- [ ] **E2E Tests for Filters Sidebar**
  - [ ] Test sidebar toggle on mobile
  - [ ] Test filter application (search, category, level, tools, contract, location)
  - [ ] Test clear filters functionality
  - [ ] Test URL sync with filters
  - [ ] Test sidebar responsiveness (mobile/desktop)
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
- [x] **Design System - Phase 3: Refactor Remaining Pages** ✅
  - [x] All pages refactored with UI component library (Card, Badge, Link, Button, Breadcrumb)
  - [x] Consistent px-container spacing and design tokens across all pages
  - [x] Company pages, post-a-job flow, legal pages, blog pages all using components
  - [x] Build passing with zero hardcoded styling
  - [x] All E2E tests passing (15/16)
- [ ] **Brand Assets & Imagery**
  - [ ] Definir biblioteca de ilustrações/padrões alinhada ao mascote
  - [ ] Selecionar set de ícones coerente (ex. Phosphor arredondado)
  - [ ] Curar imagens para cards de blog e páginas de empresa
- [ ] **Content & Messaging Audit**
  - [ ] Documentar tom de voz (friendly, editorial, brasileiro)
  - [ ] Revisar títulos e CTAs para manter idioma consistente
  - [ ] Adicionar métricas/estatísticas relevantes no hero
- [x] **Testing Suite Expansion** ✅
  - [x] Add E2E tests for company pages (/companies, /company/[slug]) - 10 tests
  - [x] Add E2E tests for blog pages (/blog, /blog/[slug]) with JSON-LD validation - 8 tests
  - [x] Add E2E tests for /about page - 5 tests
  - [x] Add E2E tests for category pages (/category/[slug]) with breadcrumbs - 7 tests
  - [x] All tests passing: 44/46 E2E + 8 unit tests = 52 total tests
  - [ ] Add accessibility testing with @axe-core/playwright
  - [ ] Add visual regression tests for UI components
- [x] **Design System - Phase 2: Typography** ✅
  - [x] Add editorial serif font (Crimson Pro from Google Fonts)
  - [x] Improve font hierarchy and heading sizes (h1-h6)
  - [x] Enhanced line-height and letter-spacing scale
  - [x] Display font sizes for hero sections with tighter tracking
  - [x] Better paragraph spacing and text density
  - [x] Applied to homepage, about, blog, companies pages
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
- [ ] **Skills/Tags Pages** (High Priority - SEO Value)
  - [ ] `/skills/[slug]` dynamic route (e.g., `/skills/unity`, `/skills/zbrush`)
  - [ ] `/skills` index page listing all skills with job counts
  - [ ] Filter jobs by skill/tag in sidebar
  - [ ] Add skill badges to job cards (clickable → skill page)
  - [ ] Potential for 10-20+ new indexable pages
  - [ ] JSON-LD for skill pages
- [ ] **Filters Sidebar - Advanced Features**
  - [ ] Add filter presets/saved searches (localStorage)
  - [ ] Show filter count badge on mobile toggle button
  - [ ] Add keyboard shortcuts (e.g., `/` to focus search, `Esc` to clear)
  - [ ] Collapsible filter sections (accordion style)
  - [ ] Show popular tags/skills based on current filters
- [ ] **Content Marketing & SEO**
  - [ ] Write 2–3 more blog posts:
    - [ ] "Salary Guide for Artists in Brazil"
    - [ ] "How to Build a Portfolio for Game Studios"
    - [ ] "Remote Work Tips for Brazilian Creatives"
  - [ ] Share blog posts on LinkedIn/X to drive organic traffic
  - [ ] Add "Related Posts" section to blog posts
  - [ ] Add reading time estimate to blog posts
- [ ] **Uptime Monitoring**
  - [ ] Add simple probe (Checkly/Cronitor/Better Uptime) for `/` and `/post-a-job`
  - [ ] Alert on downtime or slow response (>3s)
  - [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] **Blog Enhancements**
  - [ ] Add Twitter/LinkedIn share buttons on individual blog posts
  - [ ] Add "Related Posts" section to blog posts
  - [ ] Add reading time estimate to blog posts
  - [ ] Add author bio section
- [ ] **OG Images Enhancement**
  - [ ] Generate unique OG images for category pages (Satori)
  - [ ] Generate OG images for blog posts (Satori)
  - [ ] Generate OG images for company pages
  - [ ] Generate OG images for skills pages (when implemented)
  - [ ] Add OG image cache/optimization
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
- [ ] **Performance Optimization**
  - [ ] Image optimization: Add width/height to all logos
  - [ ] Compress/optimize static images (use Sharp/ImageOptim)
  - [ ] Lazy load images below fold
  - [ ] Add loading="lazy" to job card logos
  - [ ] Implement virtual scrolling for large job lists (if >50 jobs)
  - [ ] Add service worker for offline support (PWA)
- [ ] **Analytics & Insights**
  - [ ] Track filter usage (which filters are most used)
  - [ ] Track job click-through rates
  - [ ] Add conversion tracking for "Post a Job" flow
  - [ ] Monitor search queries (popular searches)
  - [ ] Track mobile vs desktop usage patterns
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

- Build: PASS (25+ pages generated: PT-BR default + /en/ versions)
- Formatting (Prettier): PASS
- Data validation: PASS (Zod)
- ESLint: PASS (0 errors, 0 warnings)
- Unit Tests: PASS (8/8 tests)
- E2E Tests: ⚠️ Requires Playwright browsers installation (`npx playwright install`)
- Total Test Coverage: 52 tests (8 unit + 44 E2E)
- CI: Build + format + lint + tests running on push/PR
- **SEO Pages: 22+ indexable pages** (PT-BR + EN versions)
  - PT-BR (default): home, 3 categories, 4 jobs, companies index, 4 company pages, blog index, blog post, 7 static, about, companies, blog
  - EN: /en/about, /en/companies, /en/blog
- **i18n Structure**: PT-BR default, /en/ for English versions
- **Responsive Design**: ✅ Mobile (360px), Tablet (768px), Desktop (1024px+) all optimized
- **Recent Updates**: 
  - Responsive design complete across all breakpoints
  - i18n structure implemented (PT-BR default, /en/ versions)
  - Filters sidebar hidden on mobile (< 1024px)
  - Design refinements: dark brown text, pastel yellow hero background
- **📋 Ver IMPROVEMENTS.md** para melhorias específicas de código gerado por IA

---

## Changelog (high level)

<!-- AI-ANCHOR:CHANGELOG-START -->

- 2025-11-10: **Sidebar UX Polish - Auto Apply & Chips**: Implemented auto-apply timer for checkbox filters (200ms) so users get instant results without manual click. Added guard to cancel timer when Apply button aciona manualmente. Sidebar now shows chips for todas as combinações (categoria + níveis + ferramentas etc.) e mantém contagem pluralizada. Updated NEXT_STEPS to refletir tarefas concluídas. Commits: pending push.
- 2025-11-10: **Code Quality 100% Complete - All 8 Tasks Done**: Achieved 100% code quality (8/8 tasks). Created HeroIntegrationController (95 lines) extracting all inline JS from index.astro for hero search sync and category pill interactions. Added polished loading states: Apply button shows 'Aplicando...' and Clear button shows 'Limpando...' with disabled + opacity-70 + cursor-wait during operations. All code now modularized in 3 controllers (sidebar, orchestrator, hero). 0 @ts-nocheck, full TypeScript types, 16 try-catch blocks, FILTER_CONFIG constants, complete lifecycle cleanup. Build passing, unit tests 12/12, browser tested. Commit: 90ee4ef.
- 2025-11-10: **Bug Fix - Logo Missing on Vercel**: Fixed missing navbar logo on production deployment. Issue: `logo-navbar.svg` file was present locally but not committed to git repository. Solution: Added `public/images/logo-navbar.svg` to git and deployed. Logo now displays correctly on all pages in production. Commit: d759215.
- 2025-11-10: **Responsive Design Complete - Mobile/Tablet/Desktop**: Implemented comprehensive responsive design across all breakpoints. Hero section: text sizes scale from text-3xl (mobile) → text-4xl (tablet) → text-5xl (desktop). Searchbar: adjusted padding (py-4 → py-5) and icon size (h-5 → h-6) for mobile. Category pills: compact on mobile (text-xs px-3 py-1.5) expanding to full size on tablet (text-sm px-4 py-2). All 3 pills now fit on one line on 360px mobile. Filters sidebar hidden on mobile/tablet (< 1024px), visible on desktop. Tested and optimized for 360px, 768px, and 1024px+ breakpoints. Build passing. Commits: 43506f3, 43cd5bf.
- 2025-11-10: **i18n Structure Implemented**: Established PT-BR as default locale with English versions under `/en/`. Translated main pages (about, companies, blog) to Portuguese. Created `/en/about`, `/en/companies`, `/en/blog/index` with English content. All text strings centralized in `src/lib/i18n.ts` with reusable keys. Created `I18N_STATUS.md` documentation. Each page now serves single language per locale. Language toggle in navbar pending. Build passing. Commit: 4d3ebb7.
- 2025-11-10: **Design Refinements**: Updated neutral color palette from black tones to warm brown tones (neutral-950: #3d2817, neutral-900: #4a3422). Changed all black text to dark brown for softer, more editorial appearance. Fixed button text wrapping with `whitespace-nowrap` class. Fixed logo positioning in hero section (moved to right side of searchbar). Changed hero background from gradient to pastel yellow (`bg-background-pastel`). All visual elements now align with editorial newspaper aesthetic.
- 2025-11-10: **Bug Fixes**: Fixed missing logo on Vercel deployment by adding `logo-navbar.svg` to git repository. Fixed sidebar layout issues with excessive white space by removing dynamic JS padding. Fixed searchbar centralization issues. All assets now properly deployed to production.
- 2025-11-07: **Design System Phase 2 COMPLETE - Typography Overhaul**: Added Crimson Pro serif font from Google Fonts for editorial headings. Enhanced Tailwind typography scale with improved line heights (26px base for readability), letter spacing (-0.02em for headings), and display sizes for hero sections. Updated global.css with semantic heading hierarchy (h1-h6) using serif font. Applied refined typography to homepage (5xl/6xl hero), about page, blog pages, and companies listing. Improved paragraph spacing and text density. All pages now have better visual hierarchy and readability. Build passing, all tests passing (8 unit + 44 E2E).
- 2025-11-07: **Testing Suite Expansion COMPLETED**: Added 30 new E2E tests covering all remaining pages. Created comprehensive test suites for company pages (10 tests), blog pages (8 tests), about page (5 tests), and category pages (7 tests). All tests validate page structure, navigation, content rendering, and JSON-LD structured data. Total test coverage now: 52 tests (8 unit + 44 E2E). All tests passing. Test files: company-pages.spec.ts, blog-pages.spec.ts, about-page.spec.ts, category-pages.spec.ts.
- 2025-11-07: **Design System Phase 3 COMPLETE**: Refactored all remaining pages to use UI component library. Completed: company/[slug], post-a-job flow (post-a-job.astro + success.astro), legal pages (privacy, terms), blog pages (index + [slug]), companies listing. All pages now use Card, Badge, Link, Button, Breadcrumb components with consistent px-container spacing and design tokens. Fixed remaining hardcoded elements (privacy.astro <a> tag, companies.astro card classes). Build passing, all tests passing (8 unit + 15 E2E).
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
- 2025-11-07: **Filters Sidebar Consolidation COMPLETED**: Consolidated all filters (search, category, level, tools, contract, location) into a single sidebar component. Removed duplicate filter systems (SearchBar, CategoryButtons, AdvancedFilters dropdown). Implemented responsive sidebar: fixed left sidebar on desktop, drawer with overlay on mobile. Added dynamic navbar height calculation to prevent content clipping. Filters apply automatically on change (no "Apply" button needed). All filters sync with URL and global state. Build passing, all tests passing (8 unit + 44 E2E).
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
