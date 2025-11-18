import { describe, it, expect } from 'vitest';
import { sortJobsByDateDesc, collectFacets, slugify, type Job } from '../src/lib/jobs';

describe('sortJobsByDateDesc', () => {
  const base: Job[] = [
    {
      id: '1',
      companyName: 'A',
      companyLogo: '/images/a.svg',
      jobTitle: 'Old',
      description: 'Legacy role maintaining engine features.',
      applyLink: 'https://example.com/1',
      postedDate: '2024-01-01T00:00:00Z',
      category: 'Game Dev',
      tags: ['Unity'],
      location: { scope: 'remote-brazil' },
    },
    {
      id: '2',
      companyName: 'B',
      companyLogo: '/images/b.svg',
      jobTitle: 'New',
      description: 'Cutting edge design role for future experiences.',
      applyLink: 'https://example.com/2',
      postedDate: '2025-11-04T09:00:00Z',
      category: 'Design',
      tags: ['Figma'],
      location: { scope: 'remote-worldwide' },
    },
    {
      id: '3',
      companyName: 'C',
      companyLogo: '/images/c.svg',
      jobTitle: 'Invalid date',
      description: 'Incomplete data should push this job to the end.',
      applyLink: 'https://example.com/3',
      postedDate: 'not-a-date',
      category: '3D',
      tags: ['Blender'],
      location: { scope: 'remote-latam' },
    },
  ];

  it('orders newest to oldest and pushes invalid dates to the end', () => {
    const result = sortJobsByDateDesc(base);
    expect(result.map((j) => j.id)).toEqual(['2', '1', '3']);
  });

  it('is stable for equal timestamps/invalids', () => {
    const withTie: Job[] = [
      { ...base[2], id: '3a' },
      { ...base[2], id: '3b' },
    ];
    const result = sortJobsByDateDesc(withTie);
    expect(result.map((j) => j.id)).toEqual(['3a', '3b']);
  });
});

describe('collectFacets', () => {
  const jobs: Job[] = [
    {
      id: '1',
      companyName: 'A',
      companyLogo: '/images/a.svg',
      jobTitle: 'One',
      description: 'Job description A',
      applyLink: 'https://example.com/1',
      postedDate: '2024-01-01T00:00:00Z',
      category: 'Game Dev',
      tags: ['Unity', 'C#'],
      location: { scope: 'remote-brazil' },
    },
    {
      id: '2',
      companyName: 'B',
      companyLogo: '/images/b.svg',
      jobTitle: 'Two',
      description: 'Job description B',
      applyLink: 'https://example.com/2',
      postedDate: '2024-02-01T00:00:00Z',
      category: 'Design',
      tags: ['Figma', 'unity'],
      location: { scope: 'remote-worldwide' },
    },
  ];

  it('returns unique sorted categories and tags (tags case-insensitive unique)', () => {
    const { categories, tags } = collectFacets(jobs);
    expect(categories).toEqual(['Design', 'Game Dev']);
    // Expect only one Unity, preserving first casing, and overall A→Z
    expect(tags).toEqual(['C#', 'Figma', 'Unity']);
  });
});

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    expect(slugify('Game Dev')).toBe('game-dev');
    expect(slugify('UI/UX Designer')).toBe('ui-ux-designer');
  });

  it('handles special characters and ampersand', () => {
    expect(slugify('2D Art')).toBe('2d-art');
    expect(slugify('3D')).toBe('3d');
    expect(slugify('Animation')).toBe('animation');
    expect(slugify('Design')).toBe('design');
  });

  it('removes trailing and leading hyphens', () => {
    expect(slugify('---test---')).toBe('test');
    expect(slugify('  spaces  ')).toBe('spaces');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('replaces multiple special chars with single hyphen', () => {
    expect(slugify('Hello!!!World')).toBe('hello-world');
    expect(slugify('Test   Multiple   Spaces')).toBe('test-multiple-spaces');
  });
});
