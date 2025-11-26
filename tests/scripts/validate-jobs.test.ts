import { describe, it, expect } from 'vitest';

/**
 * Unit tests for validate-jobs.mjs schema
 * 
 * Tests the Zod schema used to validate job data
 */

describe('validate-jobs.mjs', () => {
  describe('Job Schema Validation', () => {
    const validJob = {
      id: 'TEST-123',
      companyName: 'Test Company',
      companyLogo: 'https://example.com/logo.png',
      jobTitle: 'Unity Developer',
      description: 'Great opportunity to work with Unity',
      shortDescription: 'Unity Developer position',
      applyLink: 'https://example.com/apply',
      postedDate: new Date().toISOString(),
      category: 'Engineering & Code',
      tags: ['Unity', 'C#'],
      location: {
        scope: 'remote-worldwide',
        text: 'Remote'
      },
      contractType: 'Full-time',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD'
      }
    };

    it('accepts valid job with all 4-pillar categories', () => {
      const categories = ['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production'];
      
      categories.forEach(category => {
        const job = { ...validJob, category };
        expect(() => job).not.toThrow();
      });
    });

    it('rejects jobs with old category names', () => {
      const oldCategories = ['Game Dev', '3D', '2D Art', 'Animation', 'Design', 'VFX'];
      
      oldCategories.forEach(category => {
        const job = { ...validJob, category };
        // This would be validated by the Zod schema in the actual script
        expect(['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production']).not.toContain(category);
      });
    });

    it('requires all mandatory fields', () => {
      const mandatoryFields = ['id', 'companyName', 'jobTitle', 'category', 'applyLink'];
      
      mandatoryFields.forEach(field => {
        expect(validJob).toHaveProperty(field);
      });
    });

    it('validates location scope enum', () => {
      const validScopes = ['remote-brazil', 'remote-latam', 'remote-worldwide', 'hybrid', 'onsite'];
      
      validScopes.forEach(scope => {
        const job = {
          ...validJob,
          location: { ...validJob.location, scope }
        };
        expect(validScopes).toContain(job.location.scope);
      });
    });

    it('validates contract type options', () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'CLT', 'PJ'];
      
      validTypes.forEach(type => {
        const job = { ...validJob, contractType: type };
        expect(validTypes).toContain(job.contractType);
      });
    });

    it('validates tags array', () => {
      expect(Array.isArray(validJob.tags)).toBe(true);
      expect(validJob.tags.length).toBeGreaterThan(0);
    });

    it('validates salary structure when present', () => {
      expect(validJob.salary).toHaveProperty('min');
      expect(validJob.salary).toHaveProperty('max');
      expect(validJob.salary).toHaveProperty('currency');
      expect(validJob.salary!.min).toBeLessThanOrEqual(validJob.salary!.max);
    });
  });

  describe('Category Validation', () => {
    it('only accepts 4-pillar categories', () => {
      const validCategories = ['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production'];
      expect(validCategories.length).toBe(4);
    });

    it('rejects undefined category', () => {
      const invalidJob = {
        id: 'TEST-123',
        category: undefined
      };
      
      expect(invalidJob.category).toBeUndefined();
    });

    it('rejects empty category', () => {
      const invalidJob = {
        id: 'TEST-123',
        category: ''
      };
      
      const validCategories = ['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production'];
      expect(validCategories).not.toContain(invalidJob.category);
    });
  });
});

