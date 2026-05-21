import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-export-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const expectedKey = Deno.env.get("COURSE_EXPORT_KEY");
    if (!expectedKey) {
      return new Response(
        JSON.stringify({ error: "Export key not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const providedKey =
      req.headers.get("x-export-key") ?? url.searchParams.get("key");

    if (providedKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slug = url.searchParams.get("slug");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let coursesQuery = supabase
      .from("courses")
      .select("id, title, slug, description, path_type, tags, estimated_hours, is_published, featured");

    if (slug && slug !== "all") {
      coursesQuery = coursesQuery.eq("slug", slug);
    }

    const { data: courses, error: coursesError } = await coursesQuery;
    if (coursesError) throw coursesError;
    if (!courses || courses.length === 0) {
      return new Response(
        JSON.stringify({ courses: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    console.error("export-course error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
