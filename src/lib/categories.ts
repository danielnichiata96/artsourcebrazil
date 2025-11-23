/**
 * Unified category definitions
 * Single source of truth for all job categories across the application
 */

/**
 * Valid job categories that can be displayed
 * These are the canonical category names used throughout the app
 */
export const CATEGORIES = [
  'Game Dev',
  '3D',
  '2D Art',
  'Animation',
  'Design',
  'VFX',
] as const;

/**
 * TypeScript type for valid categories
 */
export type Category = (typeof CATEGORIES)[number];

/**
 * All valid categories including 'all' for filter purposes
 */
export const FILTER_CATEGORIES = ['all', ...CATEGORIES] as const;

/**
 * TypeScript type for filter categories (includes 'all')
 */
export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

/**
 * Category metadata interface
 */
export interface CategoryMeta {
  name: Category;
  slug: string;
  color: string;
  description: string;
}

/**
 * Category metadata with slugs, colors, and descriptions
 * Colors follow Canvas design system principles
 */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  'Game Dev': {
    name: 'Game Dev',
    slug: 'game-dev',
    color: '#9C27B0', // Purple - Tech/Engineering
    description: 'Programação, engenharia, QA'
  },
  '3D': {
    name: '3D',
    slug: '3d',
    color: '#FF5722', // Deep Orange - 3D/Modeling
    description: 'Modelagem 3D, texturização'
  },
  '2D Art': {
    name: '2D Art',
    slug: '2d-art',
    color: '#2196F3', // Blue - 2D Art
    description: 'Arte 2D, ilustração, concept'
  },
  'Animation': {
    name: 'Animation',
    slug: 'animation',
    color: '#4CAF50', // Green - Animation/Motion
    description: 'Animação 2D/3D, rigging'
  },
  'Design': {
    name: 'Design',
    slug: 'design',
    color: '#00BCD4', // Cyan - UI/UX Design
    description: 'UI/UX, Product Design'
  },
  'VFX': {
    name: 'VFX',
    slug: 'vfx',
    color: '#FFC107', // Amber - VFX/Effects
    description: 'Efeitos visuais, partículas'
  },
} as const;

/**
 * Fallback category for unmapped jobs
 */
export const FALLBACK_CATEGORY: Category = 'Game Dev';

/**
 * Category mapping for external sources (legacy compatibility)
 * Maps various category names from external sources to canonical categories
 * Used for backward compatibility and data migration
 */
export const EXTERNAL_CATEGORY_MAP: Record<string, Category> = {
  'VFX': 'VFX',
  'Arte 3D': '3D',
  '3D': '3D',
  '2D Art': '2D Art',
  '2D Animation': 'Animation',
  'Animation': 'Animation',
  'UX/UI': 'Design',
  'Design': 'Design',
  'Design (UI/UX)': 'Design',
  'Game Dev': 'Game Dev',
  'Programação': 'Game Dev',
  'QA': 'Game Dev', // Map QA to Game Dev as it's game-related
} as const;

/**
 * Check if a value is a valid category
 */
export function isValidCategory(value: unknown): value is Category {
  return typeof value === 'string' && CATEGORIES.includes(value as Category);
}

/**
 * Check if a value is a valid filter category (includes 'all')
 */
export function isValidFilterCategory(value: unknown): value is FilterCategory {
  return typeof value === 'string' && FILTER_CATEGORIES.includes(value as FilterCategory);
}

/**
 * Map an external category name to a canonical category
 * Returns the mapped category or null if invalid
 * @deprecated Use direct category mapping in sync scripts
 */
export function mapExternalCategory(externalCategory: string): Category | null {
  const mapped = EXTERNAL_CATEGORY_MAP[externalCategory];
  return mapped || null;
}

/**
 * Get category metadata
 * Returns metadata for a category or null if not found
 */
export function getCategoryMeta(category: string): CategoryMeta | null {
  return CATEGORY_META[category as Category] || null;
}

/**
 * Get category slug for URL
 */
export function getCategorySlug(category: string): string {
  return CATEGORY_META[category as Category]?.slug || 'all';
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_META[category as Category]?.color || '#757575';
}
