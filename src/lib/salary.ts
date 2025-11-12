import type { SalaryRange } from './jobs';
import type { Locale } from './i18n';

/**
 * Format salary range for display with proper currency symbols and localization.
 * @param salary - Salary range object with min, max, and currency.
 * @param locale - Desired locale for formatting (defaults to pt-BR).
 * @returns Formatted salary string or undefined if no data.
 */
export function formatSalaryRange(salary: SalaryRange | null | undefined, locale: Locale = 'pt-BR'): string | undefined {
  if (!salary || !salary.currency) return undefined;

  const { min, max, currency } = salary;
  const hasMin = typeof min === 'number' && min > 0;
  const hasMax = typeof max === 'number' && max > 0;

  if (!hasMin && !hasMax) return undefined;

  const currencySymbols: Record<string, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (hasMin && hasMax) {
    return `${symbol} ${formatNumber(min)} - ${formatNumber(max)}`;
  }

  if (hasMin) {
    const label = locale === 'en' ? 'From' : 'A partir de';
    return `${label} ${symbol} ${formatNumber(min)}`;
  }

  if (hasMax) {
    const label = locale === 'en' ? 'Up to' : 'Até';
    return `${label} ${symbol} ${formatNumber(max)}`;
  }

  return undefined;
}

/**
 * Get contract type label in the specified locale.
 * @param contractType - Contract type identifier.
 * @param locale - Desired locale for the label.
 * @returns Localized contract type label.
 */
export function getContractTypeLabel(contractType: string | null | undefined, locale: Locale = 'pt-BR'): string | undefined {
  if (!contractType) return undefined;

  const labels: Record<Locale, Record<string, string>> = {
    'pt-BR': {
      'CLT': 'CLT',
      'PJ': 'PJ',
      'B2B': 'B2B',
      'Freelance': 'Freelance',
      'Estágio': 'Estágio',
    },
    'en': {
      'CLT': 'Full-time (CLT)',
      'PJ': 'Contractor (PJ)',
      'B2B': 'B2B Contract',
      'Freelance': 'Freelance',
      'Estágio': 'Internship',
    },
  };

  return labels[locale]?.[contractType] || contractType;
}

