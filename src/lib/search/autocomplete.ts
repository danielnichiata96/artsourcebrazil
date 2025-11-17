/**
 * Search autocomplete functionality
 * Provides suggestions for job titles, companies, and skills
 */

import type { Job } from '../jobs';
import { slugify as jobSlugify } from '../jobs';

export interface SearchSuggestion {
  type: 'job' | 'company' | 'skill';
  label: string;
  value: string;
  subtitle?: string;
  href?: string;
}

/**
 * Generate search suggestions based on user query
 * @param query - User's search input
 * @param jobs - Array of all jobs
 * @param maxResults - Maximum number of suggestions to return
 * @returns Array of search suggestions
 */
export function getSearchSuggestions(
  query: string,
  jobs: Job[],
  maxResults = 5
): SearchSuggestion[] {
  if (query.length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const suggestions: SearchSuggestion[] = [];

  // Track unique values to avoid duplicates
  const seen = new Set<string>();

  // Match job titles (highest priority)
  for (const job of jobs) {
    const jobTitle = job.jobTitle.toLowerCase();
    const matchKey = `job:${job.id}`;

    if (jobTitle.includes(lowerQuery) && !seen.has(matchKey)) {
      suggestions.push({
        type: 'job',
        label: job.jobTitle,
        value: job.id,
        subtitle: job.companyName,
        href: `/jobs/${job.id}-${jobSlugify(job.jobTitle)}`,
      });
      seen.add(matchKey);

      if (suggestions.length >= maxResults) break;
    }
  }

  // Match company names
  if (suggestions.length < maxResults) {
    const companies = new Map<string, string>();

    for (const job of jobs) {
      const companyName = job.companyName.toLowerCase();
      const companySlug = jobSlugify(job.companyName);
      const matchKey = `company:${job.companyName}`;

      if (
        companyName.includes(lowerQuery) &&
        !seen.has(matchKey) &&
        !companies.has(job.companyName)
      ) {
        companies.set(job.companyName, companySlug);
        suggestions.push({
          type: 'company',
          label: job.companyName,
          value: companySlug,
          subtitle: `Ver todas as vagas`,
          href: `/company/${companySlug}`,
        });
        seen.add(matchKey);

        if (suggestions.length >= maxResults) break;
      }
    }
  }

  return suggestions.slice(0, maxResults);
}

/**
 * Highlight matching portion of text
 * @param text - Full text
 * @param query - Search query to highlight
 * @returns HTML string with <mark> tags around matches
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || query.length < 2) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-accent-light font-bold">$1</mark>');
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
