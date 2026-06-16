import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeHtml } from "@/lib/sanitize";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouterLessonProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
  };
  isCompleted: boolean;
  onComplete: () => void;
  isPending: boolean;
}

type CourseSlug = "fluency" | "strategy" | "action";
type Source = "self_selected" | "audit";

const SITUATIONS: { quote: string; slug: CourseSlug }[] = [
  {
    quote: "AI is already in my buildings. Our approach is improvised.",
    slug: "fluency",
  },
  {
    quote: "My board — or my boss — is asking for a plan I don't have.",
    slug: "strategy",
  },
  {
    quote: "We wrote the plan. Nothing is moving.",
    slug: "action",
  },
];

const COURSE_TITLES: Record<CourseSlug, string> = {
  fluency: "Command the Tools",
  strategy: "Chart the Course",
  action: "Ship It",
};

const RESULT_COPY: Record<CourseSlug, string> = {
  fluency:
    "Your gap is operational. Tools are in use without evaluation criteria. Start by getting what's already happening under control.",
  strategy:
    "Your gap is strategic. Activity without direction. Start by building the framework and roadmap your stakeholders are waiting for.",
  action:
    "Your gap is execution. The thinking is done; the follow-through isn't. Start by turning your plan into assignments with names and dates.",
};

const CATEGORY_TO_SLUG: Record<string, CourseSlug> = {
  fluency: "fluency",
  strategy: "strategy",
  governance: "strategy",
  action: "action",
  capacity: "action",
};

const isCourseSlug = (v: string | null | undefined): v is CourseSlug =>
  v === "fluency" || v === "strategy" || v === "action";

const RouterLesson = ({ lesson, isCompleted, onComplete }: RouterLessonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"select" | "confirm">("select");
  const [selectedSlug, setSelectedSlug] = useState<CourseSlug | null>(null);
  const [source, setSource] = useState<Source>("self_selected");
  const [latestCompletedAttemptId, setLatestCompletedAttemptId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<CourseSlug, boolean>>({
    fluency: false,
    strategy: false,
    action: false,
  });
  const [coursesBySlug, setCoursesBySlug] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [profileRes, attemptRes, coursesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("recommended_course, recommendation_source")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("audit_attempts")
          .select("id, completed_at")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(1),
        supabase
          .from("courses")
          .select("id, slug")
          .in("slug", ["fluency", "strategy", "action"]),
      ]);
      if (cancelled) return;

      const slugMap: Record<string, string> = {};
      (coursesRes.data ?? []).forEach((c: { id: string; slug: string }) => {
        slugMap[c.slug] = c.id;
      });
      setCoursesBySlug(slugMap);

      const courseIds = Object.values(slugMap);
      if (courseIds.length && user) {
        const { data: enrolls } = await supabase
          .from("enrollments")
          .select("course_id, status")
          .eq("user_id", user.id)
          .in("course_id", courseIds);
        const enrollMap: Record<CourseSlug, boolean> = {
          fluency: false,
          strategy: false,
          action: false,
        };
        (enrolls ?? []).forEach((e: { course_id: string; status: string | null }) => {
          if (e.status && e.status !== "active") return;
          const slug = Object.entries(slugMap).find(([, id]) => id === e.course_id)?.[0];
          if (slug && isCourseSlug(slug)) enrollMap[slug] = true;
        });
        if (!cancelled) setEnrollments(enrollMap);
      }

      const latest = attemptRes.data?.[0];
      if (latest) setLatestCompletedAttemptId(latest.id);

      const existing = profileRes.data?.recommended_course;
      if (isCourseSlug(existing)) {
        setSelectedSlug(existing);
        setSource(
          profileRes.data?.recommendation_source === "audit" ? "audit" : "self_selected",
        );
        setPhase("confirm");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const auditAvailable = !!latestCompletedAttemptId;

  const persistRecommendation = async (slug: CourseSlug, src: Source) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ recommended_course: slug, recommendation_source: src })
      .eq("id", user.id);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Couldn't save your choice",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSelectedSlug(slug);
    setSource(src);
    setPhase("confirm");
    if (!isCompleted) onComplete();
  };

  const handlePickSituation = (slug: CourseSlug) => {
    persistRecommendation(slug, "self_selected");
  };

  const handleUseAudit = async () => {
    if (!latestCompletedAttemptId) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("get_audit_summary", {
      _attempt_id: latestCompletedAttemptId,
    });
    if (error) {
      setSubmitting(false);
      toast({
        title: "Couldn't read audit",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    const rows = (data as Array<{ category: string; is_lowest: boolean }>) ?? [];
    // RPC orders by category order (fluency, strategy, action, governance, capacity),
    // so the first is_lowest row already encodes the tiebreak we want.
    const lowest = rows.find((r) => r.is_lowest);
    const mapped = lowest ? CATEGORY_TO_SLUG[lowest.category] : null;
    setSubmitting(false);
    if (!mapped) {
      toast({
        title: "Couldn't map audit result",
        description: "We couldn't read a clear lowest category from your audit.",
        variant: "destructive",
      });
      return;
    }
    persistRecommendation(mapped, "audit");
  };

  const ctaLink = useMemo(() => {
    if (!selectedSlug) return "/courses";
    return enrollments[selectedSlug] ? `/course/${selectedSlug}` : "/courses";
  }, [selectedSlug, enrollments]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (phase === "confirm" && selectedSlug) {
    const title = COURSE_TITLES[selectedSlug];
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mb-2">
            Your next course
          </p>
          <h3 className="text-2xl font-bold font-display">{title}</h3>
          {source === "audit" && (
            <p className="text-xs text-muted-foreground mt-1">
              Based on your AI Equity Audit score.
            </p>
          )}
        </div>

        <div
          className="border rounded-lg p-6 bg-card"
          style={{ borderLeft: "4px solid #d4af37" }}
        >
          <p className="text-base leading-relaxed">{RESULT_COPY[selectedSlug]}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button asChild size="lg">
            <Link to={ctaLink}>
              Go to {title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase("select")}
            className="text-muted-foreground"
          >
            Change my answer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lesson.content && (
        <div
          className="prose prose-slate dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
        />
      )}

      <div>
        <h3 className="text-2xl sm:text-3xl font-bold font-display">
          Where are you right now?
        </h3>
        <p className="text-muted-foreground mt-2">
          Pick the sentence that sounds like your district — or let your audit decide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SITUATIONS.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => handlePickSituation(s.slug)}
            disabled={submitting}
            className={cn(
              "text-left border rounded-lg p-6 bg-card transition-all",
              "hover:border-[hsl(46_65%_52%/0.55)] hover:shadow-[0_2px_4px_rgba(11,22,38,.06),0_18px_44px_rgba(11,22,38,.16)]",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex flex-col gap-4",
            )}
          >
            <span className="font-display text-[2.6rem] leading-none text-[#d4af37]">
              &ldquo;
            </span>
            <p className="font-display font-semibold text-lg leading-snug">{s.quote}</p>
            <div className="mt-auto pt-3 border-t border-foreground/10 flex items-center gap-2 text-sm font-semibold text-[hsl(40_72%_30%)]">
              {COURSE_TITLES[s.slug]}
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          variant="outline"
          onClick={handleUseAudit}
          disabled={!auditAvailable || submitting}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Use my audit score
        </Button>
        {!auditAvailable && (
          <p className="text-xs text-muted-foreground">
            Complete the AI Equity Audit above to unlock this option.
          </p>
        )}
      </div>
    </div>
  );
};

export default RouterLesson;
