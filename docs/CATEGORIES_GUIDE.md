# 📋 Categories Guide

This document is the **single source of truth** for job categories in Art Source Brazil.

## 🎯 Canonical Categories

These are the **6 canonical categories** used throughout the application:

| Category | Icon | Description | Examples |
|----------|------|-------------|----------|
| **Game Dev** | 🎮 | Game development & programming | Game Engineer, Unity Developer, Gameplay Programmer, QA Engineer |
| **3D** | 🎨 | 3D art, modeling, texturing | 3D Artist, Character Artist, Technical Artist, 3D Modeler |
| **2D Art** | 🖼️ | 2D art & illustration | 2D Game Artist, Concept Artist, Illustrator, Game Artist |
| **Animation** | 🎬 | Animation & rigging | Character Animator, 2D Animator, 3D Animator, Rigging Artist |
| **Design** | 🎯 | UI/UX, Brand, and Visual Design | UI/UX Designer, Product Designer, Brand Designer, Growth Designer |
| **VFX** | ✨ | Visual effects & real-time VFX | VFX Artist, Real-Time VFX Artist, Particle Artist |

## 🗺️ External Source Category Mapping

When syncing jobs from external sources (Greenhouse, etc.), the following category names are automatically mapped to canonical categories:

```javascript
// Defined in: src/lib/categories.ts (EXTERNAL_CATEGORY_MAP)
// Used by: scripts/sync-greenhouse-to-supabase.mjs

'VFX' → 'VFX'
'Arte 3D' → '3D'
'3D' → '3D'
'2D Art' → '2D Art'
'2D Animation' → 'Animation'
'UX/UI' → 'Design'
'Design' → 'Design'
'Design (UI/UX)' → 'Design'
'Game Dev' → 'Game Dev'
'Programação' → 'Game Dev'
'QA' → 'Game Dev'  // QA engineers work in game development
```

### ⚠️ Important Notes:

1. **QA Mapping**: QA (Quality Assurance) is mapped to "Game Dev" because:
   - Most QA roles in this job board are game-related (QA Engineer for Unity SDKs, etc.)
   - QA is a technical role closely tied to game development
   - Keeps category count manageable (4 categories)

2. **"Arte 3D" vs "3D"**: Both map to "3D & Animation" for consistency

3. **Design Variants**: All design-related categories map to "Design" regardless of specialization

## 🔧 Implementation Files

### Central Source of Truth
- **`src/lib/categories.ts`** - All category definitions, types, and mappings

### Usage Across Codebase
- **`scripts/validate-jobs.mjs`** - Validates job categories against enum
- **`scripts/sync-greenhouse-to-supabase.mjs`** - Maps external categories to canonical
- **`src/lib/validation/filter-schema.ts`** - Zod schema for filter validation
- **`src/components/CategoryButtons.astro`** - Category filter UI
- **`src/components/CategoryFilter.astro`** - Category selection UI
- **`src/pages/category/[slug].astro`** - Category pages (SEO)

## ✅ Validation Rules

### In Zod Schema (validate-jobs.mjs)
```javascript
const Categories = z.enum([
  'Game Dev',
  '3D & Animation',
  'Design',
  'VFX',
]);
```

### In TypeScript (categories.ts)
```typescript
export const CATEGORIES = [
  'Game Dev',
  '3D & Animation',
  'Design',
  'VFX',
] as const;

export type Category = (typeof CATEGORIES)[number];
```

## 🚀 Adding a New Category

If you need to add a new category:

1. **Update** `src/lib/categories.ts`:
   ```typescript
   export const CATEGORIES = [
     'Game Dev',
     '3D & Animation',
     'Design',
     'VFX',
     'Your New Category', // Add here
   ] as const;
   
   export const CATEGORY_ICONS: Record<string, string> = {
     // ...
     'Your New Category': '🆕',
   };
   ```

2. **Update** `scripts/validate-jobs.mjs`:
   ```javascript
   const Categories = z.enum([
     'Game Dev',
     '3D & Animation',
     'Design',
     'VFX',
     'Your New Category', // Add here
   ]);
   ```

3. **Update** external source mapping (if needed):
   ```typescript
   // In src/lib/categories.ts
   export const EXTERNAL_CATEGORY_MAP: Record<string, Category> = {
     // ...
     'External Source Name': 'Your New Category',
   };
   ```

4. **Run validation**: `npm run validate:jobs`

5. **Update tests**: Add new category to E2E tests if needed

## 🔍 Debugging Category Issues

### Check for Inconsistencies
```bash
# Search for hardcoded category strings
grep -r "Game Dev\|3D & Animation\|Design\|VFX" src/

# Check if external source mapping is up to date
diff scripts/sync-greenhouse-to-supabase.mjs src/lib/categories.ts
```

### Validate All Jobs
```bash
npm run validate:jobs
```

### Common Issues

1. **"Category not found" error**:
   - Check if job uses old category name (e.g., "Design (UI/UX)")
   - Update `EXTERNAL_CATEGORY_MAP` in `categories.ts`

2. **Category not showing in UI**:
   - Verify `CATEGORIES` array includes the category
   - Check `CATEGORY_ICONS` has an entry
   - Clear build cache: `rm -rf dist .astro`

3. **Supabase sync fails**:
   - Verify `categoryMap` in `sync-greenhouse-to-supabase.mjs` matches `EXTERNAL_CATEGORY_MAP`
   - Check for typos in category names

## 📊 Category Statistics

Current distribution (as of Nov 2025):
- **Game Dev**: 2 jobs (25%)
- **3D & Animation**: 2 jobs (25%)
- **Design**: 3 jobs (37.5%)
- **VFX**: 1 job (12.5%)

**Total**: 8 active jobs across 4 categories

---

**Last Updated**: November 16, 2025  
**Maintained By**: Development Team  
**Status**: ✅ All categories unified and validated
