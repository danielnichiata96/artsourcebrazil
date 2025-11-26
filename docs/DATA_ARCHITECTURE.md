# Data Architecture - Job Board

> **TL;DR**: Supabase é a fonte da verdade. Fetchers → Supabase → Frontend (build time).

---

## 📊 Overview

```mermaid
graph LR
    A[External APIs] -->|fetch-*.mjs| B[JSON Output Files]
    B -->|sync-*-to-supabase.mjs| C[Supabase Database]
    C -->|getJobs at build| D[Astro Frontend]
    
    style C fill:#00e5ff,stroke:#000,stroke-width:3px
    style A fill:#ff99cc
    style B fill:#F7DD00
    style D fill:#b388ff
```

---

## 🏗️ Architecture Layers

### **Layer 1: External APIs (Data Sources)**

**Location**: Greenhouse, Ashby, Lever APIs  
**Scripts**: `scripts/fetch-*.mjs`  
**Output**: `scripts/*-jobs-output.json` (temporary files)

```bash
npm run fetch:greenhouse  # Greenhouse API → greenhouse-jobs-output.json
npm run fetch:ashby       # Ashby API → ashby-jobs-output.json
npm run fetch:lever       # Lever API → lever-jobs-output.json
npm run fetch:all         # All sources (sequential)
```

**What they do:**
- Query external job APIs
- Transform to our internal Job format
- Apply intelligent categorization (`categorizeJob()`)
- Extract tags, parse locations, format salaries
- Write to temporary JSON files

**When to run:**
- Every 6-12 hours via cron
- Manually when adding new companies
- After updating categorization logic

---

### **Layer 2: Supabase Database (Source of Truth)**

**Location**: Supabase PostgreSQL  
**Scripts**: `scripts/sync-*-to-supabase.mjs`  
**Tables**: `jobs`, `companies`, `categories`, `tags`, `job_tags`

```bash
npm run sync:greenhouse   # greenhouse-jobs-output.json → Supabase
npm run sync:all          # All sources (orchestrated)
```

**What they do:**
- Read JSON output from fetchers
- **Upsert** jobs (insert new, update existing based on `external_id`)
- Create/update related entities (companies, categories, tags)
- Apply AI enhancement to descriptions (via Gemini/OpenAI)
- Set `status: 'active'` for valid jobs
- Mark missing jobs as `'inactive'`

**Database Schema:**
```sql
jobs
├── id (UUID)
├── external_id (TEXT, unique) -- "GH-123", "ASH-456"
├── company_id (FK)
├── category_id (FK)
├── title, description, apply_link
├── location_scope, location_note
├── salary (JSONB)
├── status ('active', 'inactive', 'draft')
├── posted_date, created_at, updated_at

companies (id, name, logo_url, slug)
categories (id, name, slug, color)
tags (id, name, slug)
job_tags (job_id, tag_id) -- Many-to-many
```

**Why Supabase?**
- **Single source of truth**: No data duplication
- **Relational integrity**: Proper foreign keys
- **Real-time**: Admin dashboard can approve/reject jobs
- **Scalable**: Handles thousands of jobs easily
- **Backup**: Automatic backups by Supabase

---

### **Layer 3: Astro Frontend (Build Time)**

**Location**: `src/pages/*.astro`  
**Data fetching**: `src/lib/getJobs.ts`

```javascript
// src/pages/index.astro
const jobs = await getJobs(); // Queries Supabase at build time
```

**What it does:**
- Queries Supabase during `astro build`
- Generates static HTML pages
- **No runtime database queries** (SSG = Static Site Generation)
- Deployed to Vercel

**Build triggers:**
1. Manual: `git push origin main` → Vercel auto-deploys
2. **Automatic (Recommended)**: `sync:all` script triggers Vercel rebuild via webhook
3. Cron: GitHub Actions runs sync + rebuild every 6h
4. Webhook: Supabase can notify Vercel of data changes (future)

---

## 🗑️ Deprecated Files

### ❌ `src/data/jobs.json`

**Status**: OBSOLETE (will be removed)  
**Why it exists**: Legacy from pre-Supabase era  
**Current problem**: Causes confusion about data flow

**Should I delete it?**
- **Keep for now**: As a backup/fallback
- **Use case**: Local development if Supabase is down
- **Long-term**: Remove once confident in Supabase stability

**Alternative**: Create `sync:supabase → jobs.json` script for emergencies

---

## ⚙️ Cron Job Setup (Recommended)

### **Option 1: GitHub Actions (Recommended)**

Create `.github/workflows/sync-jobs.yml`:

```yaml
name: Sync Jobs from External APIs

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:        # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - name: Sync all jobs to Supabase
        run: npm run sync:all
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GOOGLE_GEMINI_API_KEY: ${{ secrets.GOOGLE_GEMINI_API_KEY }}
      
      - name: Trigger Vercel rebuild
        run: curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

**Pros:**
- Free (GitHub Actions)
- Easy to monitor (GitHub UI)
- Integrated with repo
- Can trigger Vercel rebuilds

---

### **Option 2: Vercel Cron Jobs**

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync-jobs",
    "schedule": "0 */6 * * *"
  }]
}
```

Create `src/pages/api/cron/sync-jobs.ts`:

```typescript
import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';

export const GET: APIRoute = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    execSync('npm run sync:all', { stdio: 'inherit' });
    return new Response('Jobs synced successfully', { status: 200 });
  } catch (error) {
    return new Response('Sync failed', { status: 500 });
  }
};
```

**Pros:**
- Integrated with Vercel
- Can trigger rebuilds automatically
- No GitHub Actions needed

**Cons:**
- Requires Pro plan for cron jobs
- Less flexible than GitHub Actions

---

## 📋 Complete Workflow

### **Development (Local)**

```bash
# 1. Fetch jobs from APIs
npm run fetch:all

# 2. Sync to Supabase
npm run sync:all

# 3. Start dev server (reads from Supabase)
npm run dev
```

---

### **Production (Automated)**

```
Every 6 hours:
├─> GitHub Action runs
├─> npm run sync:all
│   ├─> fetch:greenhouse → sync:greenhouse ✅
│   ├─> fetch:ashby → sync:ashby ✅
│   └─> fetch:lever → sync:lever ✅
├─> Jobs updated in Supabase
├─> 🆕 Auto-trigger Vercel rebuild (VERCEL_DEPLOY_HOOK)
│   └─> Astro queries Supabase
│       └─> Generates fresh static pages
│           └─> Deploys to Vercel
└─> ✅ Site updated with latest jobs!
```

**🚨 CRITICAL**: Without the Vercel rebuild webhook, your site will show stale data!
Set `VERCEL_DEPLOY_HOOK` in your environment to enable auto-rebuilds.

---

## 🔧 Scripts Reference

### **Fetchers** (External APIs → JSON)

| Script | Source | Output |
|--------|--------|--------|
| `fetch:greenhouse` | Greenhouse API | `greenhouse-jobs-output.json` |
| `fetch:ashby` | Ashby API | `ashby-jobs-output.json` |
| `fetch:lever` | Lever API | `lever-jobs-output.json` |
| `fetch:all` | All sources | All JSON files |

### **Sync** (JSON → Supabase)

| Script | Input | Output |
|--------|-------|--------|
| `sync:greenhouse` | `greenhouse-jobs-output.json` | Supabase jobs table |
| `sync:all` | All JSON files | Supabase (all sources) |
| `sync:supabase` | Supabase | `src/data/jobs.json` (reverse sync) |

### **Combined** (One-liner)

| Script | What it does |
|--------|-------------|
| `sync:greenhouse:supabase:full` | Fetch Greenhouse + Sync to Supabase |
| `sync:all` | **Fetch ALL + Sync ALL** (master script) |

---

## ⚠️ The "Stale Site" Problem & Solution

### **🔴 The Problem:**

Astro uses **Static Site Generation (SSG)** by default. This means:

1. `npm run build` → Queries Supabase → Generates HTML → Deploys
2. Cron runs at 08:00 → Updates Supabase with 10 new jobs
3. **Site still shows old build from 02:00** ❌

**Result**: Site is 6 hours out of date, even though database has fresh jobs!

### **✅ The Solution (Implemented):**

After syncing jobs to Supabase, automatically trigger a Vercel rebuild:

```javascript
// sync-all-jobs.mjs (lines 40-55)
if (VERCEL_DEPLOY_HOOK) {
  await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
  // ✅ Vercel rebuilds site with fresh Supabase data
}
```

**Flow:**
```
Cron (08:00) → Sync Jobs → Supabase Updated
    ↓
Trigger VERCEL_DEPLOY_HOOK
    ↓
Vercel rebuilds site (08:01)
    ↓
✅ Fresh jobs appear on site (08:02)
```

### **🔧 Setup Instructions:**

1. **Get Deploy Hook from Vercel:**
   - Go to: Project Settings → Git → Deploy Hooks
   - Create hook: Name it "Cron Job Sync"
   - Copy URL (e.g., `https://api.vercel.com/v1/integrations/...`)

2. **Set Environment Variable:**
   ```bash
   # Local (.env)
   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/...

   # GitHub Actions (Repository Secrets)
   VERCEL_DEPLOY_HOOK → Add as secret

   # Vercel (if using Vercel Cron)
   VERCEL_DEPLOY_HOOK → Add in Environment Variables
   ```

3. **Test:**
   ```bash
   npm run sync:all
   # Should see: "✅ Vercel rebuild triggered successfully!"
   ```

### **🎯 Alternative: Hybrid Rendering (Future)**

If rebuild times become too slow (>2 minutes), consider:

```javascript
// astro.config.mjs
export default {
  output: 'hybrid',  // Mix static + server
  adapter: vercel()
}

// src/pages/index.astro
export const prerender = false;  // Force SSR for this page
```

**Pros**: Instant updates (no rebuild needed)  
**Cons**: Slightly slower page loads, higher Vercel costs

**Recommendation**: Start with SSG + Webhooks (current approach). Only switch to Hybrid if you need real-time updates (<1 minute).

---

## 🚨 Troubleshooting

### **Jobs not appearing on site**

1. Check Supabase has jobs:
   ```bash
   npm run test:supabase
   ```

2. Check jobs are `active`:
   ```sql
   SELECT status, COUNT(*) FROM jobs GROUP BY status;
   ```

3. Rebuild site:
   ```bash
   npm run build
   ```

### **Fetchers failing**

- Check API keys in `.env`
- Check rate limits (Greenhouse: 50 req/min)
- Check company slugs are correct

### **Categorization wrong**

- Update `src/lib/categories.ts` → `categorizeJob()`
- Re-run fetchers + sync
- Check unit tests: `npm run test tests/lib/categories.test.ts`

---

## 📝 TODO

- [x] Create `sync-ashby-to-supabase.mjs` ✅
- [x] Create `sync-lever-to-supabase.mjs` ✅
- [x] Add Vercel deploy webhook to sync:all ✅
- [ ] **CRITICAL**: Set `VERCEL_DEPLOY_HOOK` env var (get from Vercel dashboard)
- [ ] Implement GitHub Actions cron workflow
- [ ] Monitor: Set up alerts for failed syncs
- [ ] Optimize: Add `last_synced_at` field to track unchanged jobs
- [ ] Decide: Keep or remove `src/data/jobs.json`

---

## 📚 Related Docs

- [CATEGORIES_GUIDE.md](./CATEGORIES_GUIDE.md) - Categorization logic
- [FETCHERS_GUIDE.md](./FETCHERS_GUIDE.md) - How to add new job sources
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database schema and setup
- [ENHANCEMENT_SYSTEM.md](./ENHANCEMENT_SYSTEM.md) - AI description enhancement

