import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, corsPreflight } from "../_shared/cors.ts";
import { rateLimit, clientIp } from "../_shared/rateLimit.ts";
import { ClientError, newRequestId, safeErrorResponse } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req, {
    extraAllowHeaders: "x-export-key",
    methods: "GET, OPTIONS",
  });
  if (req.method === "OPTIONS") {
    return corsPreflight(req, { extraAllowHeaders: "x-export-key", methods: "GET, OPTIONS" });
  }
  const requestId = newRequestId();

  try {
    const expectedKey = Deno.env.get("COURSE_EXPORT_KEY");
    if (!expectedKey) throw new Error("Export key not configured on server");

    const providedKey = req.headers.get("x-export-key");
    if (providedKey !== expectedKey) throw new ClientError("Unauthorized", 401);

    // Rate limit: 20/min/IP.
    const rl = rateLimit(`export:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests." }),
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

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (slug && !/^[a-z0-9-]{1,100}$/i.test(slug) && slug !== "all") {
      throw new ClientError("Invalid slug");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    let coursesQuery = supabase
      .from("courses")
      .select("id, title, slug, description, path_type, tags, estimated_hours, is_published, featured");
    if (slug && slug !== "all") coursesQuery = coursesQuery.eq("slug", slug);

    const { data: courses, error: coursesError } = await coursesQuery;
    if (coursesError) throw coursesError;
    if (!courses || courses.length === 0) {
      return new Response(JSON.stringify({ courses: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const courseIds = courses.map((c) => c.id);
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, course_id, title, sequence_order, description, deliverable_name, path_type, estimated_minutes")
      .in("course_id", courseIds)
      .order("sequence_order", { ascending: true });
    if (modulesError) throw modulesError;

    const moduleIds = (modules ?? []).map((m) => m.id);
    const lessonsResult = moduleIds.length
      ? await supabase
          .from("lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("sequence_order", { ascending: true })
      : { data: [] as any[], error: null };
    if (lessonsResult.error) throw lessonsResult.error;
    const lessons = lessonsResult.data ?? [];

    const lessonsByModule = new Map<string, any[]>();
    for (const l of lessons) {
      const arr = lessonsByModule.get(l.module_id) ?? [];
      arr.push(l);
      lessonsByModule.set(l.module_id, arr);
    }
    const modulesByCourse = new Map<string, any[]>();
    for (const m of modules ?? []) {
      const arr = modulesByCourse.get(m.course_id) ?? [];
      arr.push({ ...m, lessons: lessonsByModule.get(m.id) ?? [] });
      modulesByCourse.set(m.course_id, arr);
    }

    const payload = {
      exported_at: new Date().toISOString(),
      courses: courses.map((c) => ({ ...c, modules: modulesByCourse.get(c.id) ?? [] })),
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return safeErrorResponse(err, requestId, corsHeaders);
  }
});
