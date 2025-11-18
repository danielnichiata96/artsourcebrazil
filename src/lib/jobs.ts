import type { JobLocation } from './location';

export type ContractType = 'CLT' | 'PJ' | 'B2B' | 'Freelance' | 'Estágio' | 'Internship';

export type SalaryRange = {
  min?: number | null;
  max?: number | null;
  currency: string; // ISO 4217 (BRL, USD, EUR)
  unit?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | null;
};

export type Job = {
  id: string;
  companyName: string;
  companyLogo: string;
  companyWebsite?: string | null;
  jobTitle: string;
  description: string;
  shortDescription?: string | null; // For cards/previews
  applyLink: string;
  postedDate: string; // ISO 8601 or invalid
  category: string;
  tags: string[];
  location: JobLocation;
  contractType?: ContractType | null;
  salary?: SalaryRange | null;
};

/**
 * Sort jobs newest → oldest by postedDate.
 * Invalid or missing dates are treated as oldest, and stable order is preserved among ties.
 */
export function sortJobsByDateDesc(jobs: Job[]): Job[] {
  const withMeta = jobs.map((j, i) => {
    const d = new Date(j.postedDate);
    const time = Number.isNaN(d.getTime()) ? Number.NEGATIVE_INFINITY : d.getTime();
    return { j, i, time };
  });
  withMeta.sort((a, b) => {
    if (b.time !== a.time) return b.time - a.time; // newer first
    return a.i - b.i; // stable among equals
  });
  return withMeta.map((x) => x.j);
}

/**
 * Collect unique categories and tags from the dataset.
 * - Categories are unique and sorted A→Z.
 * - Tags are case-insensitive-unique; preserves the first seen casing; sorted A→Z case-insensitively.
 */
export function collectFacets(jobs: Job[]): { categories: string[]; tags: string[] } {
  const catSet = new Set<string>();
  const tagsMap = new Map<string, string>(); // lower -> original case (first occurrence)

  for (const j of jobs) {
    if (j.category) catSet.add(j.category);
    for (const t of j.tags || []) {
      const key = (t || '').toLowerCase();
      if (!key) continue;
      if (!tagsMap.has(key)) tagsMap.set(key, t);
    }
  }

  const categories = Array.from(catSet).sort((a, b) => a.localeCompare(b));
  const tags = Array.from(tagsMap.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
  return { categories, tags };
}

/**
 * Slugify a string for use in a URL.
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes trailing hyphens
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and') // Normalize ampersand to 'and' to match route generation
    .replace(/[^a-z0-9]+/g, '-') // Non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}
