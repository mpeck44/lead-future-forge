// Founder cohort bundle discount — active through end of day
// Monday, September 7, 2026 (America/New_York = 11:59:59pm ET).
// Mirror of supabase/functions/_shared/founderDiscount.ts — keep in sync.

export const FOUNDER_CUTOFF_ISO = "2026-09-08T03:59:59Z";
export const FOUNDER_BUNDLE_CENTS = 15800;
export const REGULAR_BUNDLE_CENTS = 19700;
export const INDIVIDUAL_SUM_CENTS = 3 * 7900; // 23700

export function isFounderActive(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(FOUNDER_CUTOFF_ISO).getTime();
}

export function getBundlePriceCents(now: Date = new Date()): number {
  return isFounderActive(now) ? FOUNDER_BUNDLE_CENTS : REGULAR_BUNDLE_CENTS;
}

export function getBundleLookupKey(now: Date = new Date()): string {
  return isFounderActive(now) ? "course_bundle_founder" : "course_bundle_onetime";
}

export function getBundleSavingsCents(now: Date = new Date()): number {
  return INDIVIDUAL_SUM_CENTS - getBundlePriceCents(now);
}

export const FOUNDER_CUTOFF_LABEL = "Monday, Sept 7";
