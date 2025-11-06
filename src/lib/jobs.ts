export type Job = {
  id: string;
  companyName: string;
  companyLogo: string;
  jobTitle: string;
  applyLink: string;
  postedDate: string; // ISO 8601 or invalid
  category: string;
  tags: string[];
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
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
