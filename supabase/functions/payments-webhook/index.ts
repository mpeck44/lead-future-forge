import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";
import { getBundle } from "../_shared/bundles.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function fetchReceiptUrl(session: any, env: StripeEnv): Promise<string | null> {
  try {
    if (!session.payment_intent) return null;
    const stripe = createStripeClient(env);
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
      expand: ["latest_charge"],
    });
    const charge = (pi as any).latest_charge;
    if (charge && typeof charge === "object") return charge.receipt_url ?? null;
  } catch (e) {
    console.warn("Could not retrieve receipt url:", e);
  }
  return null;
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  const bundleKey = session.metadata?.bundleKey;
  if (!userId || (!courseId && !bundleKey)) {
    console.error("checkout.session.completed missing metadata", session.id);
    return;
  }

  const sb = getSupabase();
  const receiptUrl = await fetchReceiptUrl(session, env);

  // Mark order paid regardless of course/bundle type.
  const { error: orderErr } = await sb
    .from("orders")
    .update({
      status: "paid",
      receipt_url: receiptUrl,
      stripe_payment_intent_id: session.payment_intent ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", session.id);
  if (orderErr) console.error("Order update failed:", orderErr);

  if (bundleKey) {
    const bundle = getBundle(bundleKey);
    if (!bundle) {
      console.error("Unknown bundle in webhook:", bundleKey);
      return;
    }
    const { data: bundleCourses, error: courseErr } = await sb
      .from("courses")
      .select("id")
      .in("slug", bundle.courseSlugs);
    if (courseErr || !bundleCourses?.length) {
      console.error("Failed to resolve bundle courses:", courseErr);
      return;
    }
    const total = session.amount_total ?? bundle.priceCents;
    const perCourse = Math.floor(total / bundleCourses.length);

    for (const c of bundleCourses) {
      const { error: enrollErr } = await sb.from("enrollments").upsert(
        {
          user_id: userId,
          course_id: c.id,
          status: "active",
          amount_paid: perCourse,
        },
        { onConflict: "user_id,course_id" },
      );
      if (enrollErr) console.error("Bundle enrollment upsert failed:", enrollErr);
    }
    return;
  }

  // Single course
  const { error: enrollErr } = await sb.from("enrollments").upsert(
    {
      user_id: userId,
      course_id: courseId,
      status: "active",
      amount_paid: session.amount_total ?? 0,
    },
    { onConflict: "user_id,course_id" },
  );
  if (enrollErr) console.error("Enrollment upsert failed:", enrollErr);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook received with invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const s: any = event.data.object;
        await getSupabase()
          .from("orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("stripe_session_id", s.id);
        break;
      }
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
