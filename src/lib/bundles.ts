// Bundle definitions used by the client. Keep in sync with
// supabase/functions/_shared/bundles.ts.

import {
  getBundlePriceCents,
  isFounderActive,
  INDIVIDUAL_SUM_CENTS,
} from "./founderDiscount";

export interface BundleConfig {
  key: string;
  courseSlugs: string[];
  priceCents: number;
  individualCents: number; // sum of individual course prices
  name: string;
  tagline: string;
}

export const COMPLETE_PATH: BundleConfig = {
  key: "complete_path",
  courseSlugs: ["fluency", "strategy", "action"],
  get priceCents() {
    return getBundlePriceCents();
  },
  individualCents: INDIVIDUAL_SUM_CENTS,
  name: "Complete Path — All Three Courses",
  get tagline() {
    return isFounderActive()
      ? "Founder cohort pricing — save $79 through Sept 7."
      : "Fluency + Strategy + Action. Save $40 vs. buying separately.";
  },
} as BundleConfig;

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
