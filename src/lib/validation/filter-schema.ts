import { z } from 'zod';

/**
 * Schema for validating filter state
 * Ensures all filter values are valid before applying
 */
export const FilterStateSchema = z.object({
  search: z.string().max(200).default(''),
  category: z.string().max(100).default('all'),
  level: z.array(z.string().max(50)).default([]),
  tools: z.array(z.string().max(50)).default([]),
  contract: z.array(z.string().max(50)).default([]),
  location: z.array(z.string().max(100)).default([]),
});

/**
 * Infer TypeScript type from Zod schema
 */
export type FilterState = z.infer<typeof FilterStateSchema>;

/**
 * Schema for validating partial filter updates
 * All fields are optional for incremental updates
 */
export const PartialFilterStateSchema = FilterStateSchema.partial();

export type PartialFilterState = z.infer<typeof PartialFilterStateSchema>;

/**
 * Valid job categories
 */
export const VALID_CATEGORIES = [
  'all',
  'Game Dev',
  '3D & Animation',
  'Design (UI/UX)',
] as const;

/**
 * Schema for validating category
 */
export const CategorySchema = z.enum(['all', 'Game Dev', '3D & Animation', 'Design (UI/UX)']);

/**
 * Parse and validate URL search params safely
 * @param searchParams - URLSearchParams from location.search
 * @returns Validated FilterState or default values
 */
export function parseURLParams(searchParams: URLSearchParams): FilterState {
  try {
    const parseCsv = (key: string): string[] => {
      const value = searchParams.get(key);
      if (!value) return [];
      return value
        .split(',')
        .filter(Boolean)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 50); // Validate length
    };

    const rawData = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || 'all',
      level: parseCsv('level'),
      tools: parseCsv('tools'),
      contract: parseCsv('contract'),
      location: parseCsv('location'),
    };

    // Validate with Zod
    const result = FilterStateSchema.safeParse(rawData);

    if (result.success) {
      return result.data;
    } else {
      console.warn('[parseURLParams] Invalid URL params:', result.error.issues);
      // Return safe defaults
      return FilterStateSchema.parse({});
    }
  } catch (error) {
    console.error('[parseURLParams] Error parsing URL params:', error);
    // Return safe defaults
    return FilterStateSchema.parse({});
  }
}

/**
 * Validate a partial filter state update
 * @param data - Partial filter state to validate
 * @returns Validated data or null if invalid
 */
export function validateFilterUpdate(data: unknown): PartialFilterState | null {
  try {
    const result = PartialFilterStateSchema.safeParse(data);
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('[validateFilterUpdate] Invalid filter data:', result.error.issues);
      return null;
    }
  } catch (error) {
    console.error('[validateFilterUpdate] Validation error:', error);
    return null;
  }
}

/**
 * Validate category value
 * @param category - Category string to validate
 * @returns Valid category or 'all' as fallback
 */
export function validateCategory(category: unknown): string {
  try {
    const result = CategorySchema.safeParse(category);
    return result.success ? result.data : 'all';
  } catch {
    return 'all';
  }
}

/**
 * Sanitize array of strings (for tags, tools, etc.)
 * Removes empty, too long, or suspicious values
 */
export function sanitizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter((item): item is string => typeof item === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 50)
    .slice(0, 20); // Max 20 items to prevent abuse
}
