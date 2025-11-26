import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  FILTER_CATEGORIES,
  CATEGORY_META,
  FALLBACK_CATEGORY,
  categorizeJob,
  type Category,
  type FilterCategory,
} from '../../src/lib/categories';

describe('categories', () => {
  describe('CATEGORIES - 4 Pillars', () => {
    it('contains all 4 main categories', () => {
      expect(CATEGORIES).toContain('Engineering & Code');
      expect(CATEGORIES).toContain('Art & Animation');
      expect(CATEGORIES).toContain('Design & Product');
      expect(CATEGORIES).toContain('Production');
    });

    it('has exactly 4 categories', () => {
      expect(CATEGORIES.length).toBe(4);
    });

    it('does not contain old categories', () => {
      expect(CATEGORIES).not.toContain('Game Dev');
      expect(CATEGORIES).not.toContain('3D');
      expect(CATEGORIES).not.toContain('2D Art');
      expect(CATEGORIES).not.toContain('Animation');
      expect(CATEGORIES).not.toContain('Design');
      expect(CATEGORIES).not.toContain('VFX');
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

    it('is "Engineering & Code"', () => {
      expect(FALLBACK_CATEGORY).toBe('Engineering & Code');
    });
  });

  describe('categorizeJob() - Intelligent Categorization', () => {
    describe('Engineering & Code', () => {
      it('categorizes Unity engineers correctly', () => {
        expect(categorizeJob('Unity Software Engineer', 'Develop games with Unity')).toBe('Engineering & Code');
      });

      it('categorizes QA engineers correctly', () => {
        expect(categorizeJob('QA Engineer', 'Test mobile games')).toBe('Engineering & Code');
      });

      it('categorizes Pipeline TD correctly', () => {
        expect(categorizeJob('Pipeline Technical Director', 'Create tools with Python')).toBe('Engineering & Code');
      });
    });

    describe('Art & Animation', () => {
      it('categorizes 3D artists correctly', () => {
        expect(categorizeJob('3D Character Artist', 'Model characters')).toBe('Art & Animation');
      });

      it('categorizes VFX artists correctly', () => {
        expect(categorizeJob('VFX Artist', 'Create visual effects')).toBe('Art & Animation');
      });

      it('categorizes technical artists correctly', () => {
        expect(categorizeJob('Technical Artist', 'Bridge art and engineering')).toBe('Art & Animation');
      });

      it('categorizes ArchViz artists correctly', () => {
        expect(categorizeJob('ArchViz Artist', 'Create architectural visualizations')).toBe('Art & Animation');
        expect(categorizeJob('3D Architectural Visualizer', 'Render buildings')).toBe('Art & Animation');
      });
    });

    describe('Design & Product', () => {
      it('categorizes game designers correctly', () => {
        expect(categorizeJob('Game Designer', 'Design game mechanics')).toBe('Design & Product');
      });

      it('categorizes level designers correctly', () => {
        expect(categorizeJob('Level Designer', 'Build game levels')).toBe('Design & Product');
      });

      it('categorizes UI/UX designers correctly', () => {
        expect(categorizeJob('UI/UX Designer', 'Design interfaces')).toBe('Design & Product');
      });
    });

    describe('Production', () => {
      it('categorizes producers correctly', () => {
        expect(categorizeJob('Game Producer', 'Manage production')).toBe('Production');
      });

      it('categorizes project managers correctly', () => {
        expect(categorizeJob('Project Manager - VFX', 'Coordinate teams')).toBe('Production');
      });

      it('categorizes product owners correctly', () => {
        expect(categorizeJob('Product Owner', 'Define roadmap')).toBe('Production');
      });
    });

    describe('Rejection - Non-creative industry', () => {
      it('rejects HR roles', () => {
        expect(categorizeJob('HR Manager', 'Manage recruiting')).toBeNull();
      });

      it('rejects finance roles', () => {
        expect(categorizeJob('Finance Manager', 'Manage accounting')).toBeNull();
      });

      it('rejects sales roles', () => {
        expect(categorizeJob('Sales Representative', 'Sell products')).toBeNull();
      });

      it('rejects legal roles', () => {
        expect(categorizeJob('Legal Counsel', 'Provide legal advice')).toBeNull();
      });

      it('rejects pure marketing analytics', () => {
        expect(categorizeJob('Marketing Performance Analyst', 'Analyze metrics')).toBeNull();
      });
    });

    describe('Edge Cases', () => {
      it('handles empty strings', () => {
        expect(categorizeJob('', '')).toBeNull();
      });

      it('handles unknown job titles', () => {
        expect(categorizeJob('Mystery Role', 'Unknown description')).toBeNull();
      });

      it('handles mixed creative/non-creative keywords', () => {
        // "Growth Designer" should be accepted (visual work)
        expect(categorizeJob('Growth Designer', 'Design A/B tests')).toBe('Design & Product');
      });
    });
  });
});

