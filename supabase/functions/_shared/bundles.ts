// Bundle definitions shared between the create-checkout edge function
// and the payments-webhook. Keep in sync with src/lib/bundles.ts.

export interface BundleConfig {
  key: string;
  lookupKey: string;
  courseSlugs: string[];
  priceCents: number;
  currency: string;
  name: string;
}

export const BUNDLES: Record<string, BundleConfig> = {
  complete_path: {
    key: "complete_path",
    lookupKey: "course_bundle_onetime",
    courseSlugs: ["fluency", "strategy", "action"],
    priceCents: 19700,
    currency: "usd",
    name: "Complete Path — All Three Courses",
  },
};

export function getBundle(key: string): BundleConfig | null {
  return BUNDLES[key] ?? null;
}
