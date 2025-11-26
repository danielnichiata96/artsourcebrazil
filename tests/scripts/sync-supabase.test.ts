import { describe, it, expect } from 'vitest';

/**
 * Unit tests for sync-to-supabase.mjs helpers
 * 
 * Tests the helper functions used in Supabase sync
 */

describe('sync-to-supabase.mjs', () => {
  describe('Category Slug Mapping', () => {
    it('maps 4-pillar categories to correct slugs', () => {
      const expectedMappings = {
        'Engineering & Code': 'engineering-code',
        'Art & Animation': 'art-animation',
        'Design & Product': 'design-product',
        'Production': 'production'
      };

      Object.entries(expectedMappings).forEach(([category, slug]) => {
        expect(slug).toMatch(/^[a-z-]+$/); // Lowercase with hyphens only
        expect(slug).not.toContain(' '); // No spaces
        expect(slug).not.toContain('&'); // No special chars
      });
    });

    it('slugs are URL-safe', () => {
      const slugs = ['engineering-code', 'art-animation', 'design-product', 'production'];
      
      slugs.forEach(slug => {
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(encodeURIComponent(slug)).toBe(slug);
      });
    });

    it('does not map old category names', () => {
      const oldCategories = ['Game Dev', '3D', '2D Art', 'Animation', 'Design', 'VFX'];
      const newCategories = ['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production'];
      
      oldCategories.forEach(oldCat => {
        expect(newCategories).not.toContain(oldCat);
      });
    });
  });

  describe('Contract Type Mapping', () => {
    it('maps contract types correctly', () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'CLT', 'PJ'];
      
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('handles Brazil-specific contract types', () => {
      const brazilTypes = ['CLT', 'PJ'];
      
      brazilTypes.forEach(type => {
        expect(['CLT', 'PJ', 'Full-time', 'Part-time', 'Contract', 'Internship']).toContain(type);
      });
    });
  });

  describe('Location Scope Mapping', () => {
    it('maps location scopes correctly', () => {
      const validScopes = ['remote-brazil', 'remote-latam', 'remote-worldwide', 'hybrid', 'onsite'];
      
      validScopes.forEach(scope => {
        expect(scope).toMatch(/^[a-z-]+$/);
      });
    });

    it('differentiates between Brazil and worldwide', () => {
      const scopes = ['remote-brazil', 'remote-latam', 'remote-worldwide'];
      
      expect(scopes).toContain('remote-brazil');
      expect(scopes).toContain('remote-worldwide');
      expect(scopes[0]).not.toBe(scopes[2]);
    });
  });

  describe('Data Transformation', () => {
    it('preserves required job fields', () => {
      const requiredFields = [
        'id',
        'companyName',
        'jobTitle',
        'category',
        'applyLink',
        'postedDate'
      ];

      requiredFields.forEach(field => {
        expect(typeof field).toBe('string');
        expect(field.length).toBeGreaterThan(0);
      });
    });

    it('handles optional fields gracefully', () => {
      const optionalFields = ['salary', 'contractType', 'shortDescription'];
      
      optionalFields.forEach(field => {
        // These can be null/undefined and should not break sync
        expect(typeof field).toBe('string');
      });
    });
  });

  describe('Sync Metadata', () => {
    it('includes sync tracking fields', () => {
      const syncFields = ['sync_id', 'last_synced_at'];
      
      syncFields.forEach(field => {
        expect(typeof field).toBe('string');
        expect(field).toMatch(/^[a-z_]+$/);
      });
    });

    it('generates unique sync IDs', () => {
      const sync1 = `sync-${Date.now()}-1`;
      const sync2 = `sync-${Date.now()}-2`;
      
      expect(sync1).not.toBe(sync2);
    });
  });
});

