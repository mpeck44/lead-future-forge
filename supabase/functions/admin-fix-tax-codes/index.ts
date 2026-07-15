import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

// One-off admin tool: patches tax_code on the course + bundle products
// away from txcd_10502000 (Gift Card) to txcd_10000000
// (General — Electronically Supplied Services). Delete after running
// against sandbox and live.

const TARGET_TAX_CODE = "txcd_10000000";
const NAME_MATCHES = ["Fluency", "Strategy", "Action", "Complete Path"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // One-off admin tool — no auth check on purpose. Delete this function
    // (and this file) after both sandbox and live have been fixed.

    const { environment } = await req.json().catch(() => ({}));
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";
    const stripe = createStripeClient(env);

    const results: Array<{ id: string; name: string; before?: string; after: string; skipped?: boolean }> = [];

    // Walk products (paginated). Small catalog, single page is fine.
    const list = await stripe.products.list({ limit: 100, active: true });
    for (const product of list.data) {
      const name = product.name ?? "";
      const isTarget = NAME_MATCHES.some((needle) => name.includes(needle));
      if (!isTarget) continue;

      const before = (product as { tax_code?: string | { id: string } }).tax_code;
      const beforeId = typeof before === "string" ? before : before?.id;

      if (beforeId === TARGET_TAX_CODE) {
        results.push({ id: product.id, name, before: beforeId, after: TARGET_TAX_CODE, skipped: true });
        continue;
      }

      const updated = await stripe.products.update(product.id, { tax_code: TARGET_TAX_CODE });
      const afterRaw = (updated as { tax_code?: string | { id: string } }).tax_code;
      const afterId = typeof afterRaw === "string" ? afterRaw : afterRaw?.id ?? TARGET_TAX_CODE;
      results.push({ id: product.id, name, before: beforeId, after: afterId });
    }

    return new Response(JSON.stringify({ environment: env, count: results.length, results }, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    console.error("admin-fix-tax-codes error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
