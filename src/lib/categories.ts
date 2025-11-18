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
 * Category emoji icons mapping
 */
export const CATEGORY_ICONS: Record<string, string> = {
  'Game Dev': '🎮',
  '3D': '🎨',
  '2D Art': '🖼️',
  'Animation': '🎬',
  'Design': '🎯',
  'VFX': '✨',
} as const;

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
 * @deprecated Use mapExternalCategory instead
 */
export function mapAirtableCategory(airtableCategory: string): Category | null {
  return mapExternalCategory(airtableCategory);
}

/**
 * Get category icon
 * Returns the icon for a category or a default icon if not found
 */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📋';
}
