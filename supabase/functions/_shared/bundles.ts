// Bundle definitions shared between the create-checkout edge function
// and the payments-webhook. Keep in sync with src/lib/bundles.ts.

import { getBundleLookupKey, getBundlePriceCents } from "./founderDiscount.ts";

export interface BundleConfig {
  key: string;
  lookupKey: string;
  courseSlugs: string[];
  priceCents: number;
  currency: string;
  name: string;
}

export function getBundle(key: string): BundleConfig | null {
  if (key !== "complete_path") return null;
  return {
    key: "complete_path",
    lookupKey: getBundleLookupKey(),
    courseSlugs: ["fluency", "strategy", "action"],
    priceCents: getBundlePriceCents(),
    currency: "usd",
    name: "Complete Path — All Three Courses",
  };
}

export const BUNDLES: Record<string, () => BundleConfig> = {
  complete_path: () => getBundle("complete_path")!,
};
