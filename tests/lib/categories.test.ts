import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  FILTER_CATEGORIES,
  CATEGORY_META,
  FALLBACK_CATEGORY,
  type Category,
  type FilterCategory,
} from '../../src/lib/categories';

describe('categories', () => {
  describe('CATEGORIES', () => {
    it('contains all main categories', () => {
      expect(CATEGORIES).toContain('Game Dev');
      expect(CATEGORIES).toContain('3D');
      expect(CATEGORIES).toContain('2D Art');
      expect(CATEGORIES).toContain('Animation');
      expect(CATEGORIES).toContain('Design');
      expect(CATEGORIES).toContain('VFX');
    });

    it('has at least 6 categories', () => {
      expect(CATEGORIES.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('FILTER_CATEGORIES', () => {
    it('includes "all" as first item', () => {
      expect(FILTER_CATEGORIES[0]).toBe('all');
    });

    it('contains all regular categories plus "all"', () => {
      expect(FILTER_CATEGORIES.length).toBe(CATEGORIES.length + 1);
    });
  });

  describe('CATEGORY_META', () => {
    it('has metadata for every category', () => {
      CATEGORIES.forEach((category) => {
        expect(CATEGORY_META[category]).toBeDefined();
        expect(CATEGORY_META[category].slug).toBeTruthy();
        expect(CATEGORY_META[category].color).toBeTruthy();
        expect(CATEGORY_META[category].description).toBeTruthy();
      });
    });

    it('has valid color codes (hex format)', () => {
      CATEGORIES.forEach((category) => {
        const color = CATEGORY_META[category].color;
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('has URL-safe slugs (lowercase, no spaces)', () => {
      CATEGORIES.forEach((category) => {
        const slug = CATEGORY_META[category].slug;
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug).not.toContain(' ');
        expect(slug).not.toContain('_');
      });
    });

    it('has unique slugs for each category', () => {
      const slugs = CATEGORIES.map((cat) => CATEGORY_META[cat].slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has unique colors for each category', () => {
      const colors = CATEGORIES.map((cat) => CATEGORY_META[cat].color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe('FALLBACK_CATEGORY', () => {
    it('is a valid category', () => {
      expect(CATEGORIES).toContain(FALLBACK_CATEGORY);
    });

    it('is "Game Dev"', () => {
      expect(FALLBACK_CATEGORY).toBe('Game Dev');
    });
  });
});

