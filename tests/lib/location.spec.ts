import { describe, expect, it } from 'vitest';
import {
  getApplicantLocationRequirement,
  getJobLocationCountryCode,
  getJobLocationType,
  getLocationLabel,
  type JobLocation,
} from '../../src/lib/location';

describe('location helpers', () => {
  it('returns localized labels with bullet separator', () => {
    expect(getLocationLabel('remote-brazil')).toBe('Remoto • Brasil');
    expect(getLocationLabel('remote-worldwide', 'en')).toBe('Remote • Worldwide');
  });

  it('maps scopes to jobLocationType values', () => {
    expect(getJobLocationType('remote-brazil')).toBe('TELECOMMUTE');
    expect(getJobLocationType('hybrid')).toBe('MIXED');
    expect(getJobLocationType('onsite')).toBe('ON_SITE');
  });

  it('derives applicant location requirements', () => {
    const remoteRequirement = getApplicantLocationRequirement({ scope: 'remote-brazil' });
    expect(remoteRequirement).toEqual({ '@type': 'Country', name: 'Brazil' });

    const onsiteRequirement = getApplicantLocationRequirement({ scope: 'onsite', countryCode: 'pt' });
    expect(onsiteRequirement).toEqual({ '@type': 'Country', name: 'PT' });

    expect(getApplicantLocationRequirement({ scope: 'remote-worldwide' })).toBeUndefined();
  });

  it('normalizes country codes when available', () => {
    const hybrid: JobLocation = { scope: 'hybrid', countryCode: 'br' };
    expect(getJobLocationCountryCode(hybrid)).toBe('BR');

    const fallback: JobLocation = { scope: 'onsite' };
    expect(getJobLocationCountryCode(fallback)).toBe('BR');
  });
});
