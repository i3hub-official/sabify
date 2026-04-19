/**
 * Lezie — Allowed Regions Configuration
 *
 * Add or remove country codes (ISO 3166-1 alpha-2) to control access.
 * The region check in RegionBlockedPage reads from this list.
 *
 * Full list of codes: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 */

export interface AllowedCountry {
  /** ISO 3166-1 alpha-2 code e.g. "NG" */
  code: string;
  /** Human-readable name shown in error messages */
  name: string;
}

export const ALLOWED_COUNTRIES: AllowedCountry[] = [
  { code: 'NG', name: 'Nigeria' },

  // ── Add more countries here when expanding ──────────────────────────────
  // { code: 'GH', name: 'Ghana' },
  // { code: 'KE', name: 'Kenya' },
  // { code: 'ZA', name: 'South Africa' },
];

/** Derived set of codes for fast lookup */
export const ALLOWED_CODES = new Set(ALLOWED_COUNTRIES.map(c => c.code.toUpperCase()));

/** Human-readable list for display e.g. "Nigeria" or "Nigeria, Ghana" */
export const ALLOWED_NAMES = ALLOWED_COUNTRIES.map(c => c.name).join(', ');