import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");

  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;

  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }

  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { courseId, environment, returnUrl } = await req.json();
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";
    if (!courseId || typeof courseId !== "string") throw new Error("Missing courseId");
    if (!returnUrl || typeof returnUrl !== "string") throw new Error("Missing returnUrl");

    // Look up product row for this course
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("stripe_price_lookup_key, amount_cents, currency, course_id, courses(title)")
      .eq("course_id", courseId)
      .eq("active", true)
      .maybeSingle();
    if (prodErr) throw prodErr;
    if (!product) throw new Error("This course is not available for purchase yet.");

    // Prevent duplicate active enrollments
    const { data: existingEnroll } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();
    if (existingEnroll) throw new Error("You are already enrolled in this course.");

    const stripe = createStripeClient(env);

    // Resolve price via lookup_key
    const prices = await stripe.prices.list({
      lookup_keys: [product.stripe_price_lookup_key],
      active: true,
      limit: 1,
    });
    if (!prices.data.length) throw new Error("Price not configured in Stripe.");
    const stripePrice = prices.data[0];

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: user.email ?? undefined,
      userId: user.id,
    });

    const productName =
      (product.courses as any)?.title ?? "Course enrollment";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer: customerId,
      payment_intent_data: { description: productName },
      metadata: {
        userId: user.id,
        courseId,
        managed_payments: "false",
      },
      automatic_tax: { enabled: true },
    } as any);

    // Log a pending order row
    await supabase.from("orders").insert({
      user_id: user.id,
      course_id: courseId,
      stripe_session_id: session.id,
      amount_cents: product.amount_cents,
      currency: product.currency,
      status: "pending",
      environment: env,
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    console.error("create-checkout error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
