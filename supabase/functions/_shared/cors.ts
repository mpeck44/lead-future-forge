// Shared CORS allow-list for edge functions.
// Requests from origins not in the allow-list receive no ACAO header,
// which the browser blocks. Server-to-server callers (webhooks, curl)
// are unaffected.

const ALLOWED_ORIGINS = new Set([
  "https://edleaderforge.com",
  "https://www.edleaderforge.com",
  "https://lead-future-forge.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

// Allow any *.lovable.app preview subdomain.
const LOVABLE_PREVIEW = /^https:\/\/[a-z0-9-]+\.lovable\.app$/i;

function allowOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (LOVABLE_PREVIEW.test(origin)) return origin;
  return null;
}

export function buildCorsHeaders(
  req: Request,
  opts: { extraAllowHeaders?: string; methods?: string } = {},
): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowed = allowOrigin(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type" +
      (opts.extraAllowHeaders ? `, ${opts.extraAllowHeaders}` : ""),
    "Access-Control-Allow-Methods": opts.methods ?? "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (allowed) headers["Access-Control-Allow-Origin"] = allowed;
  return headers;
}

export function corsPreflight(req: Request, opts?: { extraAllowHeaders?: string; methods?: string }): Response {
  return new Response("ok", { headers: buildCorsHeaders(req, opts) });
}
