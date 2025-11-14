/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers and strings
 */

export const FILTER_CONFIG = {
  /** Debounce time for search input in milliseconds */
  DEBOUNCE_MS: 150,

  /** Delay before auto-applying checkbox filters in milliseconds */
  AUTO_APPLY_DELAY_MS: 200,
  
  /** Breakpoint for desktop view in pixels */
  BREAKPOINTS: {
    DESKTOP: 1024, // Tailwind 'lg' breakpoint
  },
  
  /** Z-index layers for UI components */
  Z_INDEX: {
    NAVBAR: 50,
    SIDEBAR: 40,
    OVERLAY: 30,
    DROPDOWN: 20,
  },
} as const;

export const SITE_CONFIG = {
  /** Production site URL */
  SITE_URL: 'https://artsourcebrazil.vercel.app',
  
  /** Site name */
  SITE_NAME: 'Art Source Brazil',
  
  /** Default metadata */
  META: {
    TITLE: 'Art Source Brazil — Job Board',
    DESCRIPTION: 'Find creative jobs in Brazil',
  },
} as const;

export const FILTER_DEFAULTS = {
  /** Default category filter */
  CATEGORY: 'all',
  
  /** Default search query */
  SEARCH: '',
  
  /** Default advanced filters */
  LEVEL: [] as string[],
  TOOLS: [] as string[],
  CONTRACT: [] as string[],
  LOCATION: [] as string[],
} as const;

/** Category emoji icons mapping */
export const CATEGORY_ICONS: Record<string, string> = {
  'Game Dev': '🎮',
  '3D & Animation': '🎨',
  'Design': '🎯',
} as const;

/** Fallback navbar height in pixels when unable to calculate */
export const FALLBACK_NAVBAR_HEIGHT = 80;
