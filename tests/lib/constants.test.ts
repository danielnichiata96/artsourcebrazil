import { describe, it, expect } from 'vitest';
import {
  FILTER_CONFIG,
  SITE_CONFIG,
  FILTER_DEFAULTS,
  FALLBACK_NAVBAR_HEIGHT,
} from '../../src/lib/constants';

describe('constants', () => {
  describe('FILTER_CONFIG', () => {
    it('has reasonable debounce timing', () => {
      expect(FILTER_CONFIG.DEBOUNCE_MS).toBeGreaterThan(0);
      expect(FILTER_CONFIG.DEBOUNCE_MS).toBeLessThan(1000);
    });

    it('has desktop breakpoint at Tailwind lg (1024px)', () => {
      expect(FILTER_CONFIG.BREAKPOINTS.DESKTOP).toBe(1024);
    });
  });

  describe('SITE_CONFIG', () => {
    it('has valid site URL', () => {
      expect(SITE_CONFIG.SITE_URL).toMatch(/^https?:\/\//);
    });

    it('has site name defined', () => {
      expect(SITE_CONFIG.SITE_NAME).toBeTruthy();
      expect(SITE_CONFIG.SITE_NAME.length).toBeGreaterThan(0);
    });

    it('has default metadata', () => {
      expect(SITE_CONFIG.META.TITLE).toBeTruthy();
      expect(SITE_CONFIG.META.DESCRIPTION).toBeTruthy();
    });
  });

  describe('FILTER_DEFAULTS', () => {
    it('has default category as "all"', () => {
      expect(FILTER_DEFAULTS.CATEGORY).toBe('all');
    });

    it('has empty search by default', () => {
      expect(FILTER_DEFAULTS.SEARCH).toBe('');
    });

    it('has empty array defaults for advanced filters', () => {
      expect(Array.isArray(FILTER_DEFAULTS.LEVEL)).toBe(true);
      expect(Array.isArray(FILTER_DEFAULTS.TOOLS)).toBe(true);
      expect(Array.isArray(FILTER_DEFAULTS.CONTRACT)).toBe(true);
      expect(Array.isArray(FILTER_DEFAULTS.LOCATION)).toBe(true);
    });
  });
});
