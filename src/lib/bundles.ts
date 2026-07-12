// Bundle definitions used by the client. Keep in sync with
// supabase/functions/_shared/bundles.ts.

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
  priceCents: 19700,
  individualCents: 3 * 7900,
  name: "Complete Path — All Three Courses",
  tagline: "Fluency + Strategy + Action. Save $40 vs. buying separately.",
};

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
