import { supabase } from "@/integrations/supabase/client";

export type RoutingEventType =
  | "door_selected"
  | "course_purchased"
  | "course_completed"
  | "ladder_followed"
  | "ladder_skipped";

export type RoutingEventSource = "self_selected" | "audit";

interface LogRoutingEventArgs {
  eventType: RoutingEventType;
  courseKey?: string | null;
  source?: RoutingEventSource | null;
}

/**
 * Fire-and-forget analytics logger for routing events.
 * Never throws — failures only surface as a console.warn in dev.
 */
export async function logRoutingEvent({
  eventType,
  courseKey = null,
  source = null,
}: LogRoutingEventArgs): Promise<void> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return;

    const { error } = await supabase.from("routing_events").insert({
      user_id: userId,
      event_type: eventType,
      course_key: courseKey,
      source,
    });

    if (error && import.meta.env.DEV) {
      console.warn("[routing_events] insert failed", error);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[routing_events] threw", err);
    }
  }
}
