import { supabase } from "@/integrations/supabase/client";

export type ClientErrorPayload = {
  message: string;
  stack?: string | null;
  source?: string | null;
  url?: string | null;
  user_agent?: string | null;
  kind?: "error" | "unhandledrejection" | "manual";
  context?: Record<string, unknown> | null;
};

/**
 * Best-effort client error reporter. Never throws.
 */
export async function logClientError(payload: ClientErrorPayload): Promise<void> {
  try {
    const body: ClientErrorPayload = {
      kind: "manual",
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
      ...payload,
    };
    await supabase.functions.invoke("log-client-error", { body });
  } catch {
    // swallow — logging must never break the app
  }
}

let installed = false;

export function installGlobalErrorLogging(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    void logClientError({
      kind: "error",
      message: event.message || "Unknown error",
      stack: event.error?.stack ?? null,
      source: event.filename
        ? `${event.filename}:${event.lineno}:${event.colno}`
        : null,
      url: window.location.href,
      user_agent: navigator.userAgent,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      (reason && (reason.message || String(reason))) || "Unhandled rejection";
    void logClientError({
      kind: "unhandledrejection",
      message,
      stack: reason?.stack ?? null,
      url: window.location.href,
      user_agent: navigator.userAgent,
    });
  });
}
