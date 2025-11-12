import { defaultLocale, type Locale } from './i18n';

export const LOCATION_SCOPES = [
  'remote-brazil',
  'remote-latam',
  'remote-worldwide',
  'hybrid',
  'onsite',
] as const;

export type LocationScope = (typeof LOCATION_SCOPES)[number];

export interface JobLocation {
  scope: LocationScope;
  note?: string | null;
  countryCode?: string | null;
}

const scopeLabels: Record<Locale, Record<LocationScope, string>> = {
  'pt-BR': {
    'remote-brazil': 'Remoto • Brasil',
    'remote-latam': 'Remoto • América Latina',
    'remote-worldwide': 'Remoto • Global',
    hybrid: 'Híbrido',
    onsite: 'Presencial',
  },
  en: {
    'remote-brazil': 'Remote • Brazil',
    'remote-latam': 'Remote • Latin America',
    'remote-worldwide': 'Remote • Worldwide',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  },
};

const jobLocationType: Record<LocationScope, 'TELECOMMUTE' | 'MIXED' | 'ON_SITE'> = {
  'remote-brazil': 'TELECOMMUTE',
  'remote-latam': 'TELECOMMUTE',
  'remote-worldwide': 'TELECOMMUTE',
  hybrid: 'MIXED',
  onsite: 'ON_SITE',
};

/**
 * Return a localized label to represent the job location scope in the UI.
 * @param scope - Location scope identifier.
 * @param locale - Desired locale for the label (defaults to pt-BR).
 * @returns Human-readable label (falls back to pt-BR when locale missing).
 */
export function getLocationLabel(scope: LocationScope, locale: Locale = defaultLocale): string {
  const localeLabels = scopeLabels[locale] ?? scopeLabels[defaultLocale];
  return localeLabels[scope] ?? scopeLabels[defaultLocale][scope];
}

/**
 * Return the structured data for applicant location restrictions.
 * @param scope - Location scope identifier.
 * @returns Schema.org applicantLocationRequirements or undefined.
 */
export function getApplicantLocationRequirement(location: JobLocation):
  | Record<string, string>
  | undefined {
  switch (location.scope) {
    case 'remote-brazil':
      return {
        '@type': 'Country',
        name: 'Brazil',
      };
    case 'remote-latam':
      return {
        '@type': 'AdministrativeArea',
        name: 'Latin America',
      };
    case 'remote-worldwide':
      return undefined;
    case 'hybrid':
    case 'onsite': {
      const code = getJobLocationCountryCode(location);
      if (!code) return undefined;
      return {
        '@type': 'Country',
        name: code,
      };
    }
    default:
      return undefined;
  }
}

/**
 * Determine the country code to use in structured data.
 * Prefers explicit countryCode; falls back to defaults per scope.
 * @param location - Job location data.
 * @returns ISO 3166-1 alpha-2 country code or undefined.
 */
export function getJobLocationCountryCode(location: JobLocation): string | undefined {
  const explicit = location.countryCode?.trim().toUpperCase();
  if (explicit && /^[A-Z]{2}$/.test(explicit)) return explicit;

  switch (location.scope) {
    case 'remote-brazil':
      return 'BR';
    case 'hybrid':
    case 'onsite':
      return 'BR';
    default:
      return undefined;
  }
}

/**
 * Map location scope to the JobPosting.jobLocationType value.
 * @param scope - Location scope identifier.
 * @returns JobPosting jobLocationType string.
 */
export function getJobLocationType(scope: LocationScope): 'TELECOMMUTE' | 'MIXED' | 'ON_SITE' {
  return jobLocationType[scope] ?? 'TELECOMMUTE';
}

