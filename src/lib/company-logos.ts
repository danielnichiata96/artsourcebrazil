/**
 * Company logo utilities using logo.dev service
 * 
 * Logo.dev provides high-quality company logos via simple URL
 * Free tier: 1000 requests/month
 * 
 * @see https://logo.dev/
 */

// Logo.dev API token (free tier)
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || 'pk_X-1ZO13GSgeOoUrIuJ6GMQ';

/**
 * Company domain mapping for job board platforms
 * Maps company slug/name to their domain for logo.dev
 */
export const COMPANY_DOMAINS: Record<string, string> = {
  // Lever companies
  fanatee: 'fanatee.com',
  
  // Greenhouse companies
  automattic: 'automattic.com',
  wildlifestudios: 'wildlifestudios.com',
  gitlab: 'gitlab.com',
  monks: 'monks.com',
  aestudio: 'ae.studio',
  circleso: 'circle.so',
  fortisgames: 'fortisgames.com',
  beffio: 'beffio.com',
  
  // Ashby companies
  deel: 'deel.com',
  ashby: 'ashbyhq.com',
  ramp: 'ramp.com',
  notion: 'notion.so',
  
  // Add more companies as needed
};

/**
 * Get company logo URL from logo.dev service
 * 
 * @param companySlug - Company identifier (e.g., 'fanatee', 'automattic')
 * @param size - Logo size in pixels (default: 64)
 * @returns Logo URL from logo.dev or fallback placeholder
 * 
 * @example
 * getCompanyLogoUrl('fanatee') // https://img.logo.dev/fanatee.com?token=...
 * getCompanyLogoUrl('unknown-company') // /images/company-placeholder.svg
 */
export function getCompanyLogoUrl(companySlug: string, size: number = 64): string {
  const normalizedSlug = companySlug.toLowerCase().replace(/[\s-_]+/g, '');
  const domain = COMPANY_DOMAINS[normalizedSlug];
  
  if (domain) {
    return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}`;
  }
  
  // Fallback to placeholder
  return '/images/company-placeholder.svg';
}

/**
 * Get company logo URL directly from domain
 * 
 * @param domain - Company domain (e.g., 'fanatee.com')
 * @param size - Logo size in pixels (default: 64)
 * @returns Logo URL from logo.dev
 */
export function getLogoFromDomain(domain: string, size: number = 64): string {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}`;
}

/**
 * Add a new company domain mapping
 * 
 * @param slug - Company slug/identifier
 * @param domain - Company domain
 */
export function addCompanyDomain(slug: string, domain: string): void {
  COMPANY_DOMAINS[slug.toLowerCase().replace(/[\s-_]+/g, '')] = domain;
}

