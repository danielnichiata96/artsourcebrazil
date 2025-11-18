import { describe, expect, it } from 'vitest';
import {
  parseURLParams,
  validateFilterUpdate,
  sanitizeStringArray,
  type FilterState,
} from '../../../src/lib/validation/filter-schema';

function buildSearchParams(entries: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(entries).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params;
}

describe('filter-schema validation', () => {
  it('parses valid URL parameters into a FilterState', () => {
    const params = buildSearchParams({
      q: 'Designer',
      category: 'Game Dev',
      level: 'Senior,Lead',
      tools: 'Figma,Unreal Engine',
    });

    const parsed = parseURLParams(params);

    expect(parsed.search).toBe('Designer');
    expect(parsed.category).toBe('Game Dev');
    expect(parsed.level).toEqual(['Senior', 'Lead']);
    expect(parsed.tools).toEqual(['Figma', 'Unreal Engine']);
  });

  it('rejects invalid filter updates and returns null', () => {
    const invalidUpdate = {
      level: 'not-an-array',
      tools: 42,
      search: 123,
    };

    const result = validateFilterUpdate(invalidUpdate);
    expect(result).toBeNull();
  });

  it('sanitizes oversized arrays and trims values', () => {
    const dirtyValues = ['  Lead  ', '', 'a'.repeat(60), 'Senior'];
    const sanitized = sanitizeStringArray(dirtyValues);

    expect(sanitized).toEqual(['Lead', 'Senior']);
  });

  it('falls back to defaults when URL parameters are invalid', () => {
    const params = buildSearchParams({
      q: 'x'.repeat(500),
      category: 'Invalid Category',
      level: 'Senior,' + 'a'.repeat(70),
    });

    const parsed = parseURLParams(params);

    const defaults: FilterState = {
      search: '',
      category: 'all',
      skills: [],
      level: [],
      tools: [],
      contract: [],
      location: [],
    };

    expect(parsed).toEqual(defaults);
  });
});

