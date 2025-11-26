# 📋 Categories Guide - Art Source Brazil

**Last Updated**: November 26, 2025  
**Status**: ✅ Updated to 4-Pillar Structure

---

## 🎯 Canonical Categories

These are the **4 canonical categories** representing the complete Creative Industry ecosystem:

| Category | Icon | Description | Example Roles |
|----------|------|-------------|---------------|
| **💻 Engineering & Code** | 💻 | Game development, pipeline engineering, creative coding, QA | Unity Developer, Unreal Engineer, Pipeline TD, QA Engineer, Graphics Engineer, Creative Coder |
| **🎨 Art & Animation** | 🎨 | 3D, 2D, VFX, Motion Graphics, Rigging, Concept Art | 3D Artist, Character Artist, Animator, VFX Artist, Motion Designer, Rigger, Concept Artist, Technical Artist |
| **🎯 Design & Product** | 🎯 | Game design, level design, UI/UX, product design | Game Designer, Level Designer, UI/UX Designer, Product Designer, System Designer, Narrative Designer |
| **📊 Production** | 📊 | Producers, project managers, product owners | Producer, Project Manager, Product Owner, Scrum Master, Production Coordinator |

---

## 🏗️ Strategic Framework

### Why 4 Categories?

**The Old Problem:**
- ❌ "Unity Software Engineer" was tagged as "Design" (wrong!)
- ❌ 6 categories were too granular and confusing
- ❌ No clear boundary between "creative" and "tech"

**The New Solution:**
- ✅ **Function-based** categories (not tool-based)
- ✅ Covers entire **Creative Industry** ecosystem
- ✅ Clear **curatorship** rules
- ✅ Supports **bundled job postings** (studio can post dev + artist)

---

## 🚧 The Curation Rules

### ✅ **ACCEPT - Creative Industry Core**

#### 💻 Engineering & Code
- Game Engineers (Unity, Unreal, Godot)
- Graphics/Rendering Engineers
- Pipeline Technical Directors
- QA Engineers (games/creative apps)
- Creative Coders (WebGL, Processing, Three.js)
- Mobile Engineers (for creative apps)

#### 🎨 Art & Animation
- ALL 2D/3D/VFX Artists
- Animators (games, film, advertising)
- Technical Artists
- Motion Designers
- Riggers
- Concept Artists

#### 🎯 Design & Product
- Game Designers
- Level Designers
- UI/UX Designers (creative products)
- Product Designers (creative products)
- System/Narrative Designers

#### 📊 Production
- Game Producers
- VFX Producers
- Project Managers (creative projects)
- Product Owners (creative products)
- Scrum Masters (creative teams)

---

### ⚠️ **CURATE - Case by Case**

**Marketing Roles:**
- ✅ Growth Designer (visual/creative) → Accept
- ✅ Brand Designer → Accept
- ❌ Marketing Performance Analyst → Reject (pure business)
- ❌ Content Marketing → Reject (generic copywriting)

**Rule**: If role requires **visual portfolio** or **creative skill**, accept. If it's only spreadsheets/metrics, reject.

---

### ❌ **REJECT - Dilutes Brand**

Even if from Epic/Ubisoft/Wildlife:
- ❌ HR / Recruitment (unless "Creative Recruiter")
- ❌ Accounting / Finance
- ❌ Legal / Lawyers
- ❌ Facilities / Operations
- ❌ Customer Support (generic)
- ❌ Pure Sales / Business Development

---

## 🗺️ External Source Category Mapping

When syncing jobs from external sources (Greenhouse, Ashby, Lever), the following mappings are automatically applied:

```typescript
// Defined in: src/lib/categories.ts (EXTERNAL_CATEGORY_MAP)

// 💻 Engineering & Code
'Unity' → 'Engineering & Code'
'Unreal' → 'Engineering & Code'
'Game Engineer' → 'Engineering & Code'
'Software Engineer' → 'Engineering & Code'
'QA' → 'Engineering & Code'
'Pipeline TD' → 'Engineering & Code'
'Graphics Engineer' → 'Engineering & Code'

// 🎨 Art & Animation
'3D' → 'Art & Animation'
'2D Art' → 'Art & Animation'
'3D Artist' → 'Art & Animation'
'Animator' → 'Art & Animation'
'VFX' → 'Art & Animation'
'Motion Graphics' → 'Art & Animation'
'Technical Artist' → 'Art & Animation'
'Rigger' → 'Art & Animation'
'Concept Artist' → 'Art & Animation'

// 🎯 Design & Product
'Game Design' → 'Design & Product'
'Level Design' → 'Design & Product'
'UI/UX' → 'Design & Product'
'Product Designer' → 'Design & Product'
'System Designer' → 'Design & Product'

// 📊 Production
'Producer' → 'Production'
'Project Manager' → 'Production'
'Product Owner' → 'Production'
'Scrum Master' → 'Production'
```

---

## 🤖 Intelligent Categorization

### `categorizeJob()` Function

The system uses an intelligent categorization function that:
1. **Rejects first** - Non-creative industry roles
2. **Matches keywords** - In title and description
3. **Logs uncertain** - For manual review

```typescript
// Usage
import { categorizeJob } from './lib/categories';

const category = categorizeJob(
  'Unity Software Engineer',
  'Develop gameplay systems for mobile games...'
);
// Returns: 'Engineering & Code'

const rejected = categorizeJob(
  'HR Manager',
  'Manage recruiting and employee relations...'
);
// Returns: null (rejected)
```

---

## 🔧 Implementation Files

### Core Files
- **`src/lib/categories.ts`** - ALL category logic, types, and mappings
- **`src/lib/i18n.ts`** - Category labels (PT-BR and EN)

### Scripts Using Categories
- **`scripts/fetch-ashby-jobs.mjs`** - Ashby ATS integration
- **`scripts/fetch-greenhouse-jobs.mjs`** - Greenhouse ATS integration
- **`scripts/fetch-lever-jobs.mjs`** - Lever ATS integration
- **`scripts/sync-to-supabase.mjs`** - Supabase sync
- **`scripts/validate-jobs.mjs`** - Job validation

### UI Components
- **`src/pages/index.astro`** - Homepage category filters
- **`src/pages/vagas.astro`** - Full job listing page
- **`src/components/JobCard.astro`** - Job card with category badge
- **`src/pages/category/[slug].astro`** - Category-specific pages

---

## ✅ Validation Rules

### TypeScript Type
```typescript
export const CATEGORIES = [
  'Engineering & Code',
  'Art & Animation',
  'Design & Product',
  'Production',
] as const;

export type Category = (typeof CATEGORIES)[number];
```

### Zod Schema (in scripts)
```javascript
const Categories = z.enum([
  'Engineering & Code',
  'Art & Animation',
  'Design & Product',
  'Production',
]);
```

---

## 🚀 Adding a New Category

If you need to add a 5th category:

### 1. Update `src/lib/categories.ts`
```typescript
export const CATEGORIES = [
  'Engineering & Code',
  'Art & Animation',
  'Design & Product',
  'Production',
  'Your New Category', // Add here
] as const;
```

### 2. Add Metadata
```typescript
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  // ... existing
  'Your New Category': {
    name: 'Your New Category',
    slug: 'your-new-category',
    color: '#HEXCODE',
    description: 'Description here'
  },
};
```

### 3. Update External Mapping
```typescript
export const EXTERNAL_CATEGORY_MAP: Record<string, Category> = {
  // ... existing
  'External Name': 'Your New Category',
};
```

### 4. Update i18n Labels
In `src/lib/i18n.ts`:
```typescript
categories: {
  'Your New Category': 'Sua Nova Categoria',
}
```

### 5. Test
```bash
npm run validate:jobs
npm run dev
```

---

## 🔍 Debugging Category Issues

### Common Commands
```bash
# Validate all jobs against new schema
npm run validate:jobs

# Search for hardcoded old categories
grep -r "Game Dev\|3D\|2D Art\|Animation\|Design\|VFX" src/

# Re-sync jobs from external sources
node scripts/sync-to-supabase.mjs
```

### Common Issues

**1. "Category not found" error**
- Old category name in database
- Solution: Re-sync jobs or update `EXTERNAL_CATEGORY_MAP`

**2. Jobs showing wrong category**
- Keywords not matching correctly
- Solution: Update `categorizeJob()` function with better keywords

**3. UI not showing new categories**
- Build cache issue
- Solution: `rm -rf dist .astro && npm run dev`

---

## 📊 Migration from Old Structure

### Old Categories (6) → New Categories (4)

| Old Category | New Category | Notes |
|--------------|--------------|-------|
| Game Dev | Engineering & Code | More inclusive of all eng roles |
| 3D | Art & Animation | Merged with animation/VFX |
| 2D Art | Art & Animation | Merged into broader art category |
| Animation | Art & Animation | Merged with 3D/2D/VFX |
| Design | Design & Product | Clarified as product/game design |
| VFX | Art & Animation | Part of broader art category |

### Migration Script

```sql
-- Run in Supabase SQL Editor
UPDATE jobs
SET category = CASE
  WHEN category = 'Game Dev' THEN 'Engineering & Code'
  WHEN category IN ('3D', '2D Art', 'Animation', 'VFX') THEN 'Art & Animation'
  WHEN category = 'Design' THEN 'Design & Product'
  ELSE category
END
WHERE category IN ('Game Dev', '3D', '2D Art', 'Animation', 'Design', 'VFX');
```

---

## 📈 Category Statistics

After implementation (to be updated):
- **Engineering & Code**: X jobs (XX%)
- **Art & Animation**: X jobs (XX%)
- **Design & Product**: X jobs (XX%)
- **Production**: X jobs (XX%)

**Total**: X active jobs across 4 categories

---

## 📚 References

### Job Boards Analyzed
- LinkedIn Jobs
- Indeed
- WeWorkRemotely
- Remote.co
- Hired
- Stack Overflow Jobs

### Design Decisions
- **Function over Tools**: "Engineer" not "Unity Dev"
- **Ecosystem over Silos**: Include dev + artist + designer
- **Clear Boundaries**: Documented rejection criteria
- **Portfolio Test**: If needs visual portfolio, it's creative

---

**Maintained By**: Development Team  
**Next Review**: December 2025  
**Version**: 2.0 (4-Pillar Structure)
