import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type CoreSlug = "fluency" | "strategy" | "action";

const SITUATION: Record<CoreSlug, string> = {
  fluency:
    "Your teachers are using a dozen AI tools right now. You approved three of them.",
  strategy:
    'If your board asked tonight — "where are we on AI?" — could you point to a plan, or just to activity?',
  action:
    "The policy passed in the spring. It's fall. Nothing in your buildings has changed.",
};

const LADDER: Record<CoreSlug, CoreSlug | "reaudit"> = {
  fluency: "strategy",
  strategy: "action",
  action: "reaudit",
};

const isCore = (s: string | null | undefined): s is CoreSlug =>
  s === "fluency" || s === "strategy" || s === "action";

export interface RecommendationCardProps {
  recommendedSlug: string | null | undefined;
  courseTitles: Record<string, string>;
  enrollmentsBySlug: Record<string, { courseId: string; slug: string }>;
  progressByCourseId: Map<string, { done: number; total: number }>;
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="block font-body text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43,69%,35%)] mb-2">
    {children}
  </span>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 lg:-mt-10 relative z-10">
    <div className="bg-background text-foreground rounded-lg shadow-2xl border-t-4 border-gold p-7 lg:p-8">
      {children}
    </div>
  </section>
);

const RecommendationCard = ({
  recommendedSlug,
  courseTitles,
  enrollmentsBySlug,
  progressByCourseId,
}: RecommendationCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isCore(recommendedSlug)) return null;

  const slug = recommendedSlug;
  const title = courseTitles[slug] || slug;
  const enrollment = enrollmentsBySlug[slug];
  const stats = enrollment ? progressByCourseId.get(enrollment.courseId) : undefined;
  const done = stats?.done ?? 0;
  const total = stats?.total ?? 0;
  const isCompleted = !!stats && total > 0 && done >= total;
  const isInProgress = !!stats && total > 0 && done > 0 && done < total;

  const goToCourse = (s: string) => {
    const enrolled = !!enrollmentsBySlug[s];
    navigate(enrolled ? `/course/${s}` : "/courses");
  };

  const startReaudit = async () => {
    if (!user) return;
    const { data: latest, error: readErr } = await supabase
      .from("audit_attempts")
      .select("attempt_number")
      .eq("user_id", user.id)
      .order("attempt_number", { ascending: false })
      .limit(1);
    if (readErr) {
      toast({ title: "Couldn't start audit", description: readErr.message, variant: "destructive" });
      return;
    }
    const nextNum = (latest?.[0]?.attempt_number ?? 0) + 1;
    const { error: insErr } = await supabase
      .from("audit_attempts")
      .insert({ user_id: user.id, attempt_number: nextNum });
    if (insErr) {
      toast({ title: "Couldn't start audit", description: insErr.message, variant: "destructive" });
      return;
    }
    navigate("/course/foundations");
  };

  // Next-step / re-audit when completed
  if (isCompleted) {
    const next = LADDER[slug];
    if (next === "reaudit") {
      return (
        <Shell>
          <Eyebrow>Next step</Eyebrow>
          <h2 className="font-display text-2xl font-bold mb-2">Re-run your Equity Audit</h2>
          <p className="font-body text-sm text-muted-foreground mb-5 max-w-[60ch]">
            The trend line from your baseline is the story you tell next year.
          </p>
          <button
            onClick={startReaudit}
            className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Start new audit
          </button>
        </Shell>
      );
    }
    const nextTitle = courseTitles[next] || next;
    return (
      <Shell>
        <Eyebrow>Next step</Eyebrow>
        <h2 className="font-display text-2xl font-bold mb-1">
          You finished {title}. Next: {nextTitle}
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-5 max-w-[60ch]">
          {SITUATION[next]}
        </p>
        <button
          onClick={() => goToCourse(next)}
          className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          Start {nextTitle} <ArrowRight className="h-4 w-4" />
        </button>
      </Shell>
    );
  }

  // In progress
  if (isInProgress) {
    return (
      <Shell>
        <Eyebrow>Your recommended course</Eyebrow>
        <h2 className="font-display text-2xl font-bold mb-2">
          Pick up where you left off in {title}
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-5">
          {done} of {total} lessons complete.
        </p>
        <button
          onClick={() => goToCourse(slug)}
          className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          Continue {title} <ArrowRight className="h-4 w-4" />
        </button>
      </Shell>
    );
  }

  // Start (not started — enrolled with 0 progress, or not enrolled)
  const enrolled = !!enrollment;
  return (
    <Shell>
      <Eyebrow>Your recommended starting point</Eyebrow>
      <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
      <p className="font-body text-sm text-muted-foreground mb-5 max-w-[60ch]">
        {SITUATION[slug]}
      </p>
      <button
        onClick={() => goToCourse(slug)}
        className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
      >
        {enrolled ? `Start ${title}` : `Get ${title}`} <ArrowRight className="h-4 w-4" />
      </button>
    </Shell>
  );
};

export default RecommendationCard;
