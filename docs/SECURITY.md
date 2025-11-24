# 🔐 Security Documentation

This document outlines the security measures implemented in Art Source Brazil.

## ✅ Implemented Security Features

### 1. XSS Protection (Cross-Site Scripting)

**Status: ✅ Protected**

#### SearchWithAutocomplete.astro
- **Library**: DOMPurify 3.3.0 (`dompurify` + `@types/dompurify`)
- **Protection**: All user input from search queries is sanitized before rendering
- **Implementation**:
  ```javascript
  const sanitizedHTML = DOMPurify.sanitize(highlightedLabel, {
    ALLOWED_TAGS: ['div', 'span', 'mark', 'svg', 'path'],
    ALLOWED_ATTR: ['class', 'stroke-linecap', 'stroke-linejoin', 'stroke-width', 'd', 'fill', 'viewBox']
  });
  li.innerHTML = sanitizedHTML;
  ```
- **Scope**: Sanitizes highlighted search matches and suggestion labels
- **Risk Mitigated**: Prevents malicious scripts in job titles, company names, or skills

#### ShareButtons.astro
- **Status**: ✅ Safe (no user input)
- **Analysis**: Only uses `innerHTML` for emoji icons (hardcoded strings)
- **Note**: Clipboard API fallback uses `alert()` with template literal (safe)

### 2. Content Security Policy (CSP)

**Status: ✅ Strict Policy Enforced**

**Location**: `astro.config.mjs`

#### Script Security
```javascript
'script-src': ["'self'", 'https://plausible.io', 'https://*.vercel-insights.com']
```
- ✅ **NO** `'unsafe-inline'` - All scripts are external modules
- ✅ Astro compiles `<script>` tags as ES modules served from `/_astro/*.js`
- ✅ JSON-LD schema uses `type="application/ld+json"` (non-executable)
- ✅ Only trusted external scripts: Plausible Analytics, Vercel Insights

#### Style Security
```javascript
'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
```
- ⚠️ `'unsafe-inline'` required for Tailwind utility classes and Astro scoped styles
- **Future**: Consider migrating to `style-src-attr` + `style-src-elem` for stricter policy

#### Other Directives
- `'default-src'`: `"'self'"` - Restrict all resources to same origin
- `'img-src'`: `"'self'"`, `'data:'`, `'https:'` - Allow external images (company logos from CDNs)
- `'font-src'`: `"'self'"`, `'data:'`, `'https://fonts.gstatic.com'` - Google Fonts support
- `'connect-src'`: `"'self'"`, analytics domains - Restrict XHR/fetch requests
- `'frame-ancestors'`: `"'self'"` - Prevent clickjacking
- `'object-src'`: `"'none'"` - Block Flash/plugins
- `'base-uri'`: `"'self'"` - Prevent base tag hijacking
- `'form-action'`: `"'self'"`, `'https://buttondown.email'` - Newsletter signup only

### 3. Environment Variables Security

**Status: ✅ Protected**

**File**: `.env.example` (comprehensive documentation)

#### Server-Side Only (Build Time)
```bash
# 🔒 Never exposed to browser
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
PUBLIC_SUPABASE_ANON_KEY=""
```
- Used in: Supabase client and sync scripts (Node.js only)
- Not accessible from client-side code

#### Public Variables (Browser-Exposed)
```bash
# 🌐 Safe to expose (public URLs)
PUBLIC_STRIPE_PAYMENT_LINK=""
PUBLIC_JOB_FORM_URL=""
PUBLIC_PLAUSIBLE_DOMAIN=""
PUBLIC_NEWSLETTER_SUBSCRIBE_URL=""
```
- Prefix: `PUBLIC_` indicates browser-exposed variables
- Used in: Astro components via `import.meta.env.PUBLIC_*`
- Contains only public URLs (no secrets)

#### Git Protection
- `.gitignore` blocks `.env` and `.env.*` (except `.env.example`)
- Real credentials never committed to repository

### 4. Input Validation

**Status: ✅ Implemented**

#### Job Data Validation
- **Tool**: Zod schema validation
- **Location**: `scripts/validate-jobs.mjs`
- **Scope**: Validates all job data before build
- **Schema**: See `src/lib/validation/*` for type definitions

#### URL Validation
- External links use `rel="noopener noreferrer"` to prevent `window.opener` attacks
- Apply links validated via Supabase sync process

### 5. Markdown Sanitization

**Status: ✅ Protected**

**Library**: sanitize-html 2.13.0

**Location**: `src/lib/helpers/markdown.ts`

```javascript
import sanitizeHtml from 'sanitize-html';

const sanitizedHtml = sanitizeHtml(rawHtml, {
  allowedTags: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
  allowedAttributes: { a: ['href', 'target', 'rel'] }
});
```

**Scope**: Sanitizes job descriptions and blog content from Markdown

### 6. Admin Dashboard Hardening

**Status: ✅ Implemented**

- `/admin/drafts` é protegido por senha única (`ADMIN_TOKEN`) + cookie HTTP-only
- Rate limit de 5 tentativas/IP/hora para evitar brute force
- Todas as ações sensíveis (aprovar, rejeitar, editar) registradas em `admin_activity_log`
- Histórico guarda `draft_id`, `job_id`, detalhes da ação e timestamp
- Última edição manual registrada em `job_drafts.last_admin_edit_at`

## 🔍 Security Audit Checklist

### Completed ✅
- [x] XSS protection via DOMPurify in search autocomplete
- [x] CSP without `'unsafe-inline'` for scripts
- [x] Environment variables properly documented and separated (public vs private)
- [x] `.gitignore` blocks `.env` files
- [x] Input validation with Zod
- [x] Markdown sanitization with sanitize-html
- [x] External links use `rel="noopener noreferrer"`
- [x] No `eval()` or `Function()` constructors in codebase
- [x] JSON-LD schema properly escaped via `JSON.stringify()`

### Recommended Future Improvements 📋
- [x] ~~Add rate limiting for "Post a Job" flow~~ ✅ *Implemented via Turnstile + IP rate limiting*
- [ ] Consider migrating to stricter CSP with `style-src-attr` + `style-src-elem` *(deprioritized for MVP)*
- [x] ~~Add security headers via middleware~~ ✅ *Added in `netlify.toml`*
- [x] ~~Add dependency scanning in CI~~ ✅ *Dependabot + npm audit in CI*

## 🚨 MVP Security Priorities

### 1. ✅ Cloudflare Turnstile on Public Forms (IMPLEMENTED)

**Status: Ready for activation**

Turnstile is integrated into:
- `/post-a-job/preview` - Job posting checkout flow
- `ReportJobButton.astro` - Job reporting modal

**Files:**
- `src/lib/turnstile.ts` - Server-side token verification
- `src/components/TurnstileWidget.astro` - Client-side widget component

**To Activate:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. Create a new site widget (choose "Invisible" mode)
3. Copy keys to your `.env`:
   ```bash
   PUBLIC_TURNSTILE_SITE_KEY="0x..."   # Public (client-side)
   TURNSTILE_SECRET_KEY="0x..."         # Secret (server-side only)
   ```
4. Add to Netlify environment variables

**How it works:**
- Widget loads invisibly on form pages
- On submit, client sends `cf-turnstile-response` token
- Server validates token via Cloudflare API before processing

### 2. ✅ Dependency Scanning (IMPLEMENTED)

**Status: Active**

**Dependabot** configured in `.github/dependabot.yml`:
- Weekly scans for npm vulnerabilities
- Weekly scans for GitHub Actions updates
- Auto-creates PRs for security patches
- Groups minor/patch updates to reduce PR noise

**CI/CD Security Step** in `.github/workflows/ci.yml`:
```yaml
- name: Security audit
  run: npm audit --audit-level=moderate

- name: Check for high/critical vulnerabilities
  run: npm audit --audit-level=high
```
- Warns on moderate vulnerabilities
- **Fails build** on high/critical vulnerabilities

**To Enable Dependabot Alerts:**
1. Go to GitHub repo → Settings → Code security and analysis
2. Enable "Dependabot alerts" and "Dependabot security updates"

### 3. ✅ Security Headers (IMPLEMENTED)

**Status: Active**

Configured in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-DNS-Prefetch-Control = "on"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

**What these do:**
- `X-Frame-Options: DENY` → Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` → Prevents MIME-type sniffing
- `Referrer-Policy` → Controls referrer information in requests
- `Permissions-Policy` → Disables unnecessary browser APIs

## 🗑️ Deprioritized for MVP (Do NOT spend time now)

- **Strict CSP / `style-src-elem`**: breaks icons/Stripe scripts; revisit post-launch.
- **CSP Reporting Endpoint**: no security team to read reports yet.
- **Subresource Integrity (SRI)**: very low risk vs. current priorities.
- **CSRF tokens**: no authenticated user actions right now; Turnstile already blocks spam.
- **Advanced auth (OAuth/2FA)**: plan for future admin multi-user support after launch.

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please email: **artsourcebrazil@gmail.com**

**DO NOT** create a public GitHub issue for security vulnerabilities.

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Best Practices](https://content-security-policy.com/)
- [Astro Security](https://docs.astro.build/en/guides/security/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

**Last Updated**: November 24, 2025  
**Security Audit**: Passed ✅  
**Next Review**: Before production launch

 Próximos Passos
Ativar Dependabot no GitHub:
Repo → Settings → Code security and analysis → Enable Dependabot
Criar site Turnstile no Cloudflare:
https://dash.cloudflare.com/ → Turnstile → Create
Copiar keys para variáveis de ambiente
Deploy - As configurações serão aplicadas automaticamente