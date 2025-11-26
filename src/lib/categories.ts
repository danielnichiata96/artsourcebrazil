/**
 * Unified category definitions
 * Single source of truth for all job categories across the application
 */

/**
 * Valid job categories that can be displayed
 * These are the canonical category names used throughout the app
 * 
 * 4 Pillars of the Creative Industry:
 * 1. Engineering & Code - Game dev, pipeline TD, creative coders, QA
 * 2. Art & Animation - 3D, 2D, VFX, motion, rigging, concept
 * 3. Design & Product - Game design, level design, UI/UX
 * 4. Production - Producers, PMs, product owners
 */
export const CATEGORIES = [
  'Engineering & Code',
  'Art & Animation',
  'Design & Product',
  'Production',
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
  'Engineering & Code': {
    name: 'Engineering & Code',
    slug: 'engineering-code',
    color: '#9C27B0', // Purple - Tech/Engineering
    description: 'Game dev, Unity, Unreal, Pipeline TD, QA, Creative Coders'
  },
  'Art & Animation': {
    name: 'Art & Animation',
    slug: 'art-animation',
    color: '#FF5722', // Deep Orange - Art/Creative
    description: '3D, 2D, VFX, Motion Graphics, Rigging, Concept Art'
  },
  'Design & Product': {
    name: 'Design & Product',
    slug: 'design-product',
    color: '#00BCD4', // Cyan - Design
    description: 'Game Design, Level Design, UI/UX, Product Design'
  },
  'Production': {
    name: 'Production',
    slug: 'production',
    color: '#4CAF50', // Green - Production/Management
    description: 'Producers, Project Managers, Product Owners, Scrum Masters'
  },
} as const;

/**
 * Fallback category for unmapped jobs
 */
export const FALLBACK_CATEGORY: Category = 'Engineering & Code';

/**
 * Category mapping for external sources
 * Maps various category names from external sources to the 4 canonical categories
 * Based on the Creative Industry framework
 */
export const EXTERNAL_CATEGORY_MAP: Record<string, Category> = {
  // Engineering & Code
  'Unity': 'Engineering & Code',
  'Unreal': 'Engineering & Code',
  'Game Engineer': 'Engineering & Code',
  'Software Engineer': 'Engineering & Code',
  'Engineer': 'Engineering & Code',
  'Developer': 'Engineering & Code',
  'Programmer': 'Engineering & Code',
  'Pipeline TD': 'Engineering & Code',
  'Technical Director': 'Engineering & Code',
  'QA': 'Engineering & Code',
  'Quality Assurance': 'Engineering & Code',
  'Graphics Engineer': 'Engineering & Code',
  'Rendering Engineer': 'Engineering & Code',
  'Game Dev': 'Engineering & Code',
  'Programação': 'Engineering & Code',
  
  // Art & Animation
  '3D': 'Art & Animation',
  '2D': 'Art & Animation',
  '3D Artist': 'Art & Animation',
  '2D Artist': 'Art & Animation',
  'Arte 3D': 'Art & Animation',
  '2D Art': 'Art & Animation',
  'Character Artist': 'Art & Animation',
  'Environment Artist': 'Art & Animation',
  'Animator': 'Art & Animation',
  'Animation': 'Art & Animation',
  '2D Animation': 'Art & Animation',
  'VFX': 'Art & Animation',
  'VFX Artist': 'Art & Animation',
  'Motion Graphics': 'Art & Animation',
  'Motion Designer': 'Art & Animation',
  'Technical Artist': 'Art & Animation',
  'Rigger': 'Art & Animation',
  'Concept Artist': 'Art & Animation',
  
  // Design & Product
  'Game Design': 'Design & Product',
  'Level Design': 'Design & Product',
  'UI/UX': 'Design & Product',
  'UX/UI': 'Design & Product',
  'UX Designer': 'Design & Product',
  'UI Designer': 'Design & Product',
  'Product Designer': 'Design & Product',
  'Design': 'Design & Product',
  'Design (UI/UX)': 'Design & Product',
  'System Designer': 'Design & Product',
  'Narrative Designer': 'Design & Product',
  
  // Production
  'Producer': 'Production',
  'Project Manager': 'Production',
  'Product Owner': 'Production',
  'Scrum Master': 'Production',
  'Production Coordinator': 'Production',
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

/**
 * Intelligently categorize a job based on title and description
 * Returns category or null if job should be rejected (not creative industry)
 * 
 * @param title - Job title
 * @param description - Job description (optional but recommended)
 * @returns Category or null if job doesn't fit
 */
export function categorizeJob(title: string, description: string = ''): Category | null {
  const text = `${title} ${description}`.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // REJECT FIRST - Jobs that dilute the brand
  const rejectKeywords = [
    'human resources', 'hr manager', 'hr specialist',
    'recruiter', 'talent acquisition', // Unless "Creative Recruiter"
    'accountant', 'accounting', 'finance manager',
    'lawyer', 'legal counsel', 'attorney',
    'facilities', 'office manager',
    'customer support', 'customer service', // Unless creative tool support
    'sales representative', 'account executive', // Pure sales
    'business development', 'bd manager',
  ];
  
  if (rejectKeywords.some(kw => text.includes(kw))) {
    // Exception: Creative-specific roles
    if (text.includes('creative recruiter') || text.includes('art recruiter')) {
      return 'Production';
    }
    return null; // Reject
  }
  
  // SPECIAL CASE: Technical Director (TD) is Engineering (before checking "technical artist")
  if (titleLower.includes('technical director') || titleLower.includes(' td ') || titleLower.includes('pipeline td')) {
    return 'Engineering & Code';
  }
  
  // PRIORITY 1: Art & Animation (Check BEFORE Engineering to catch "Technical Artist")
  // Must come first because "technical artist" contains "technical" which could match engineering
  const artKeywords = [
    'vfx artist', 'visual effects artist', // VFX first (most specific)
    'motion graphics', 'motion designer',
    'technical artist', // Before general "artist"
    '3d artist', '2d artist', 'character artist', 'environment artist',
    'concept artist', 'illustrator',
    'animator', 'animation',
    'rigger', 'rigging',
    'modeler', 'modeling',
    'texture', 'texturing',
    // ArchViz (Architectural Visualization)
    'archviz', 'architectural visualization', 'architectural visualizer',
    '3d visualizer', 'visualization artist',
  ];
  
  // Special check: if title contains "artist", it's likely art (not engineering)
  if (titleLower.includes('artist')) {
    return 'Art & Animation';
  }
  
  if (artKeywords.some(kw => text.includes(kw))) {
    return 'Art & Animation';
  }
  
  // PRIORITY 2: Design & Product (Check BEFORE Engineering to catch "Level Designer", "Growth Designer")
  // Must check "designer" roles before "engineer" to avoid false matches
  const designKeywords = [
    'game designer', 'level designer', 'system designer',
    'narrative designer', 'quest designer',
    'ui designer', 'ux designer', 'ui/ux',
    'product designer', 'growth designer',
    'visual designer', 'design lead',
  ];
  
  // Special check: if title contains "designer" (but not "design engineer"), it's likely design
  if (titleLower.includes('designer') && !titleLower.includes('design engineer')) {
    return 'Design & Product';
  }
  
  if (designKeywords.some(kw => text.includes(kw))) {
    return 'Design & Product';
  }
  
  // PRIORITY 3: Production (Check BEFORE Engineering to catch "Project Manager")
  const productionKeywords = [
    'producer', 'production',
    'project manager', 'product manager',
    'product owner', 'scrum master',
    'production coordinator',
  ];
  
  // Special check: "manager" in creative context is production (not engineering)
  if (titleLower.includes('manager') && (text.includes('project') || text.includes('product') || text.includes('vfx'))) {
    return 'Production';
  }
  
  if (productionKeywords.some(kw => text.includes(kw))) {
    return 'Production';
  }
  
  // PRIORITY 4: Engineering & Code (Last, because keywords are broad)
  // Check last because "engineer", "developer" are very broad terms
  const engineeringKeywords = [
    'unity', 'unreal', 'godot', 'game engine',
    'c++', 'c#', 'python', 'javascript',
    'pipeline', 'technical director', 'td',
    'qa', 'quality assurance', 'test',
    'shader', 'hlsl', 'glsl',
    'graphics', 'rendering',
    'webgl', 'three.js', 'creative cod',
    'software engineer', 'software developer',
    'backend', 'frontend',
    'game engineer', 'game developer',
  ];
  
  // Check for engineering keywords (but not "design engineer" which is design)
  if (engineeringKeywords.some(kw => text.includes(kw))) {
    return 'Engineering & Code';
  }
  
  // Final catch: generic "engineer", "developer", "programmer"
  // Only if not caught by more specific checks above
  if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('programmer')) {
    return 'Engineering & Code';
  }
  
  // Uncertain - log for manual review
  console.warn(`⚠️  Categoria incerta: "${title}" - Needs manual review`);
  return null;
}
