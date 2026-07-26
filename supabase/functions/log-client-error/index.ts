import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, corsPreflight } from "../_shared/cors.ts";
import { rateLimit, clientIp } from "../_shared/rateLimit.ts";
import {
  ClientError,
  newRequestId,
  safeErrorResponse,
  scrubSecrets,
} from "../_shared/validation.ts";

const BodySchema = z.object({
  message: z.string().min(1).max(4000),
  stack: z.string().max(8000).nullable().optional(),
  source: z.string().max(500).nullable().optional(),
  url: z.string().max(1000).nullable().optional(),
  user_agent: z.string().max(500).nullable().optional(),
  kind: z.enum(["error", "unhandledrejection", "manual"]).optional(),
  context: z.record(z.unknown()).nullable().optional(),
});

function clip(v: string | null | undefined, max: number): string | null {
  if (v == null) return null;
  const scrubbed = scrubSecrets(String(v));
  return scrubbed.length > max ? scrubbed.slice(0, max) : scrubbed;
}

function sanitizeContext(ctx: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!ctx) return null;
  try {
    const s = JSON.stringify(ctx);
    // Cap serialized size at 4KB.
    const capped = s.length > 4096 ? s.slice(0, 4096) : s;
    return JSON.parse(scrubSecrets(capped));
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return corsPreflight(req);
  const requestId = newRequestId();

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip = clientIp(req);
    const rl = rateLimit(`log-err:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      });
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      throw new ClientError("Invalid JSON");
    }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) throw new ClientError("Invalid request");
    const body = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const anon = createClient(
          supabaseUrl,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await anon.auth.getClaims(token);
        userId = (data?.claims?.sub as string | undefined) ?? null;
      } catch {
        // ignore
      }
    }

    const row = {
      user_id: userId,
      message: clip(body.message, 4000)!,
      stack: clip(body.stack, 8000),
      source: clip(body.source, 500),
      url: clip(body.url, 1000),
      user_agent: clip(body.user_agent ?? req.headers.get("user-agent"), 500),
      kind: body.kind ?? "error",
      context: sanitizeContext(body.context),
    };

    const { error } = await admin.from("client_error_logs").insert(row);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return safeErrorResponse(err, requestId, corsHeaders);
  }
});
