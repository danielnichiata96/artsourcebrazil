import { describe, it, expect } from 'vitest';
import {
  FILTER_CONFIG,
  SITE_CONFIG,
  FILTER_DEFAULTS,
  CATEGORY_ICONS,
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

  describe('CATEGORY_ICONS', () => {
    it('has icons for all main categories', () => {
      expect(CATEGORY_ICONS['Game Dev']).toBeDefined();
      expect(CATEGORY_ICONS['3D']).toBeDefined();
      expect(CATEGORY_ICONS['2D Art']).toBeDefined();
      expect(CATEGORY_ICONS['Animation']).toBeDefined();
      expect(CATEGORY_ICONS['Design']).toBeDefined();
      expect(CATEGORY_ICONS['VFX']).toBeDefined();
    });

    it('has correct emoji mapping', () => {
      expect(CATEGORY_ICONS['Game Dev']).toBe('🎮');
      expect(CATEGORY_ICONS['3D']).toBe('🎨');
      expect(CATEGORY_ICONS['2D Art']).toBe('🖼️');
      expect(CATEGORY_ICONS['Animation']).toBe('🎬');
      expect(CATEGORY_ICONS['Design']).toBe('🎯');
      expect(CATEGORY_ICONS['VFX']).toBe('✨');
    });
  });
});
