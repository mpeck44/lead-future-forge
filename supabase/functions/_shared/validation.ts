// Shared validation + safe-error helpers for edge functions.
//
// - `ClientError` is a business/user-facing error whose message is safe
//   to return verbatim (e.g. "You are already enrolled in this course.").
// - Any other thrown error is logged server-side with a request id and
//   returned to the client as a generic message.

export class ClientError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ClientError";
    this.status = status;
  }
}

export function newRequestId(): string {
  // 8-char base36 id — enough for log correlation.
  return Math.random().toString(36).slice(2, 10);
}

export function safeErrorResponse(
  err: unknown,
  requestId: string,
  corsHeaders: Record<string, string>,
): Response {
  const isClient = err instanceof ClientError;
  const status = isClient ? (err as ClientError).status : 500;
  const message = isClient
    ? (err as Error).message
    : "Something went wrong. Please try again.";

  const detail = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  // Full detail stays server-side only.
  console.error(`[req ${requestId}]`, detail, stack ?? "");

  return new Response(
    JSON.stringify({ error: message, request_id: requestId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

// Redact obvious secret patterns from a string. Used before persisting
// client-supplied context.
export function scrubSecrets(input: string): string {
  return input
    .replace(/sk_(live|test)_[A-Za-z0-9]+/g, "[redacted-stripe-sk]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[redacted-jwt]");
}
