import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, corsPreflight } from "../_shared/cors.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { ClientError, newRequestId, safeErrorResponse } from "../_shared/validation.ts";

const BodySchema = z.object({ userId: z.string().uuid() });

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return corsPreflight(req);
  const requestId = newRequestId();

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new ClientError("Unauthorized", 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } =
      await supabaseAdmin.auth.getUser(token);
    if (authError || !callingUser) throw new ClientError("Invalid or expired token", 401);

    // Rate limit: 3/min/user.
    const rl = rateLimit(`delete-user:${callingUser.id}`, { limit: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          },
        },
      );
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      throw new ClientError("Invalid request");
    }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) throw new ClientError("Invalid request");
    const { userId } = parsed.data;

    if (callingUser.id !== userId) {
      throw new ClientError("You can only delete your own account", 403);
    }

    console.log(`[req ${requestId}] Deleting user account: ${userId}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return safeErrorResponse(error, requestId, corsHeaders);
  }
});
