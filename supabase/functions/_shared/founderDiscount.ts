// Founder cohort bundle discount — server mirror of src/lib/founderDiscount.ts.
// Active through 11:59:59pm ET on Monday, September 7, 2026.

export const FOUNDER_CUTOFF_ISO = "2026-09-08T03:59:59Z";
export const FOUNDER_BUNDLE_CENTS = 15800;
export const REGULAR_BUNDLE_CENTS = 19700;

export function isFounderActive(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(FOUNDER_CUTOFF_ISO).getTime();
}

export function getBundlePriceCents(now: Date = new Date()): number {
  return isFounderActive(now) ? FOUNDER_BUNDLE_CENTS : REGULAR_BUNDLE_CENTS;
}

export function getBundleLookupKey(now: Date = new Date()): string {
  return isFounderActive(now) ? "course_bundle_founder" : "course_bundle_onetime";
}
