// Post-auth intent stash — carries a logged-out user's CTA click through
// signup/login and (via email confirm) back into the app.

export type Intent =
  | { type: "bundle" }
  | { type: "course"; slug: string }
  | { type: "enroll"; slug: string }
  | { type: "browse" };

const KEY = "post_auth_intent_v1";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface Wrapper {
  intent: Intent;
  ts: number;
}

export function stashIntent(intent: Intent): void {
  try {
    const wrapper: Wrapper = { intent, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(wrapper));
  } catch {
    // ignore
  }
}

function readWrapper(): Wrapper | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Wrapper;
    if (!parsed?.ts || Date.now() - parsed.ts > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function peekIntent(): Intent | null {
  return readWrapper()?.intent ?? null;
}

export function consumeIntent(): Intent | null {
  const w = readWrapper();
  if (!w) return null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return w.intent;
}

export function clearIntent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
