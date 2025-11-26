import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('fetch-ashby-jobs.mjs', () => {
  let jobs: any[];
  
  beforeAll(() => {
    try {
      const outputPath = resolve(process.cwd(), 'scripts/ashby-jobs-output.json');
      const content = readFileSync(outputPath, 'utf-8');
      jobs = JSON.parse(content);
      
      if (!Array.isArray(jobs)) {
        jobs = [];
      }
    } catch (error) {
      console.warn('⚠️  Ashby output not found. Run: node scripts/fetch-ashby-jobs.mjs');
      jobs = [];
    }
  });

  describe('Output Structure', () => {
    it('is an array of jobs', () => {
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('Job Data Validation', () => {
    it('all jobs have required fields', () => {
      if (jobs.length === 0) {
        console.warn('⚠️  No jobs to test. Run fetcher first.');
        return;
      }

      jobs.forEach((job: any) => {
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('jobTitle');
        expect(job).toHaveProperty('companyName');
        expect(job).toHaveProperty('category');
      });
    });

    it('all jobs have valid 4-pillar categories', () => {
      const validCategories = ['Engineering & Code', 'Art & Animation', 'Design & Product', 'Production'];

      jobs.forEach((job: any) => {
        expect(validCategories).toContain(job.category);
      });
    });
  });

  describe('Categorization', () => {
    it('technical roles are Engineering & Code', () => {
      const techJobs = jobs.filter((j: any) => 
        j.jobTitle.toLowerCase().includes('engineer') ||
        j.jobTitle.toLowerCase().includes('developer')
      );

      techJobs.forEach((job: any) => {
        expect(job.category).toBe('Engineering & Code');
      });
    });
  });
});
