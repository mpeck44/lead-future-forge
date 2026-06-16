import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  AUDIT_CATEGORIES,
  AUDIT_ITEMS,
  SCALE_LABELS,
  TOTAL_AUDIT_ITEMS,
  type AuditCategory,
} from "@/lib/auditQuestions";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";

interface AuditLessonProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
  };
  isCompleted: boolean;
  onComplete: () => void;
  isPending: boolean;
}

type Phase = "loading" | "intro" | "in_progress" | "summary";

interface CategorySummaryRow {
  category: AuditCategory;
  avg_score: number;
  item_count: number;
  is_lowest: boolean;
  recommended_course: string | null;
}

const CATEGORY_ORDER: AuditCategory[] = AUDIT_CATEGORIES.map((c) => c.key);
const COURSE_TITLES: Record<string, string> = {
  fluency: "Fluency",
  strategy: "Strategy",
  action: "Action",
};

const AuditLesson = ({ lesson, isCompleted, onComplete }: AuditLessonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("loading");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<CategorySummaryRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const itemsByCategory = useMemo(() => {
    const map: Record<AuditCategory, typeof AUDIT_ITEMS> = {
      fluency: [],
      strategy: [],
      action: [],
      governance: [],
      capacity: [],
    };
    AUDIT_ITEMS.forEach((it) => map[it.category].push(it));
    return map;
  }, []);

  const answeredCount = Object.keys(answers).length;
  const currentCategory = CATEGORY_ORDER[categoryIndex];
  const currentItems = currentCategory ? itemsByCategory[currentCategory] : [];
  const categoryComplete = currentItems.every((it) => answers[it.key] != null);

  // Initial load: find latest attempt
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: attempts, error } = await supabase
        .from("audit_attempts")
        .select("id, attempt_number, completed_at")
        .eq("user_id", user.id)
        .order("attempt_number", { ascending: false })
        .limit(1);

      if (cancelled) return;
      if (error) {
        toast({ title: "Couldn't load audit", description: error.message, variant: "destructive" });
        setPhase("intro");
        return;
      }

      const latest = attempts?.[0];
      if (!latest) {
        setPhase("intro");
        return;
      }

      setAttemptNumber(latest.attempt_number);

      if (latest.completed_at) {
        // Load summary for the completed attempt
        await loadSummary(latest.id);
        setAttemptId(latest.id);
        setPhase("summary");
      } else {
        // Resume
        const { data: responses } = await supabase
          .from("audit_responses")
          .select("item_key, score")
          .eq("attempt_id", latest.id);
        const resumed: Record<string, number> = {};
        responses?.forEach((r) => {
          resumed[r.item_key] = r.score;
        });
        setAnswers(resumed);
        setAttemptId(latest.id);
        // Jump to first category that has unanswered items
        const firstIncomplete = CATEGORY_ORDER.findIndex((cat) =>
          itemsByCategory[cat].some((it) => resumed[it.key] == null),
        );
        setCategoryIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
        setPhase("in_progress");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadSummary = async (id: string) => {
    const { data, error } = await supabase.rpc("get_audit_summary", { _attempt_id: id });
    if (error) {
      toast({ title: "Couldn't load results", description: error.message, variant: "destructive" });
      return;
    }
    setSummary((data as CategorySummaryRow[]) ?? []);
  };

  const startAudit = async (newAttemptNumber?: number) => {
    if (!user) return;
    const nextNum = newAttemptNumber ?? 1;
    const { data, error } = await supabase
      .from("audit_attempts")
      .insert({ user_id: user.id, attempt_number: nextNum })
      .select("id, attempt_number")
      .single();
    if (error) {
      toast({ title: "Couldn't start audit", description: error.message, variant: "destructive" });
      return;
    }
    setAttemptId(data.id);
    setAttemptNumber(data.attempt_number);
    setAnswers({});
    setSummary(null);
    setCategoryIndex(0);
    setPhase("in_progress");
  };

  const handleAnswer = async (itemKey: string, score: number) => {
    if (!attemptId) return;
    const prev = answers[itemKey];
    setAnswers((a) => ({ ...a, [itemKey]: score }));
    setSaving(true);
    const item = AUDIT_ITEMS.find((i) => i.key === itemKey);
    if (!item) return;
    const { error } = await supabase
      .from("audit_responses")
      .upsert(
        { attempt_id: attemptId, item_key: itemKey, category: item.category, score },
        { onConflict: "attempt_id,item_key" },
      );
    setSaving(false);
    if (error) {
      // revert
      setAnswers((a) => {
        const next = { ...a };
        if (prev == null) delete next[itemKey];
        else next[itemKey] = prev;
        return next;
      });
      toast({ title: "Couldn't save answer", description: error.message, variant: "destructive" });
    }
  };

  const goNextCategory = async () => {
    if (categoryIndex < CATEGORY_ORDER.length - 1) {
      setCategoryIndex((i) => i + 1);
      return;
    }
    // Final category — submit
    if (!attemptId || !user) return;
    setSubmitting(true);
    const { error: completeErr } = await supabase
      .from("audit_attempts")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", attemptId);
    if (completeErr) {
      setSubmitting(false);
      toast({ title: "Couldn't complete audit", description: completeErr.message, variant: "destructive" });
      return;
    }

    const { data: summaryData, error: sumErr } = await supabase.rpc("get_audit_summary", {
      _attempt_id: attemptId,
    });
    if (sumErr) {
      setSubmitting(false);
      toast({ title: "Couldn't load results", description: sumErr.message, variant: "destructive" });
      return;
    }
    const rows = (summaryData as CategorySummaryRow[]) ?? [];
    setSummary(rows);
    const lowest = rows.find((r) => r.is_lowest);
    if (lowest?.recommended_course) {
      await supabase
        .from("profiles")
        .update({
          recommended_course: lowest.recommended_course,
          recommendation_source: "audit",
        })
        .eq("id", user.id);
    }
    if (!isCompleted) onComplete();
    setSubmitting(false);
    setPhase("summary");
  };

  const goPrevCategory = () => setCategoryIndex((i) => Math.max(0, i - 1));

  // ──────────────────────────────────────────────────────────── Render
  if (phase === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        {lesson.content && (
          <div
            className="prose prose-slate dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
          />
        )}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">AI Equity Audit</h3>
              <p className="text-sm text-muted-foreground">
                {TOTAL_AUDIT_ITEMS} statements across 5 categories. Score each one 1–4. Takes about
                15 minutes. You'll leave with your district's baseline and a recommended next path.
              </p>
            </div>
          </div>
          <Button onClick={() => startAudit(1)} className="w-full sm:w-auto">
            Start the audit
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "in_progress") {
    const meta = AUDIT_CATEGORIES[categoryIndex];
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Category {categoryIndex + 1} of {CATEGORY_ORDER.length}
            </span>
            <span className="font-medium">
              {answeredCount} / {TOTAL_AUDIT_ITEMS} answered
            </span>
          </div>
          <Progress value={(answeredCount / TOTAL_AUDIT_ITEMS) * 100} className="h-2" />
        </div>

        {/* Category header */}
        <div>
          <h3 className="text-2xl font-bold">{meta.label}</h3>
          <p className="text-muted-foreground">{meta.subtitle}</p>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {currentItems.map((item, idx) => {
            const selected = answers[item.key];
            return (
              <div key={item.key} className="border rounded-lg p-5 bg-card space-y-4">
                <div className="flex gap-3">
                  <span className="text-sm font-semibold text-muted-foreground mt-0.5">
                    {idx + 1}.
                  </span>
                  <p className="font-medium leading-relaxed">{item.prompt}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCALE_LABELS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleAnswer(item.key, s.value)}
                      className={cn(
                        "rounded-md border p-3 text-left transition-all hover:bg-muted/50",
                        selected === s.value
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border",
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{s.value}</div>
                      <div className="font-semibold text-sm">{s.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        {s.helper}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={goPrevCategory} disabled={categoryIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            {saving ? "Saving…" : "Answers auto-save"}
          </span>
          <Button onClick={goNextCategory} disabled={!categoryComplete || submitting}>
            {categoryIndex === CATEGORY_ORDER.length - 1 ? (
              submitting ? "Submitting…" : "See my results"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // summary phase
  const rows = summary ?? [];
  const lowest = rows.find((r) => r.is_lowest);
  const recommendedCourse = lowest?.recommended_course ?? null;
  const recommendedTitle = recommendedCourse ? COURSE_TITLES[recommendedCourse] ?? recommendedCourse : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Your AI Equity Audit baseline</h3>
        <p className="text-muted-foreground">
          Attempt #{attemptNumber}. Scores reflect where your district is right now — not where it
          could be.
        </p>
      </div>

      {/* Bar summary */}
      <div className="border rounded-lg p-6 bg-card space-y-4">
        {AUDIT_CATEGORIES.map((meta) => {
          const row = rows.find((r) => r.category === meta.key);
          const score = row ? Number(row.avg_score) : 0;
          const pct = (score / 4) * 100;
          const isLow = row?.is_lowest ?? false;
          return (
            <div key={meta.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{meta.label}</span>
                  {isLow && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: "#d4af3722", color: "#8a6d14" }}
                    >
                      Focus area
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {score.toFixed(1)} / 4
                </span>
              </div>
              <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isLow ? "#d4af37" : "hsl(var(--primary))",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      {recommendedCourse && recommendedTitle && (
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Recommended next course</p>
          <h4 className="text-xl font-bold mb-2">{recommendedTitle}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your lowest-scoring category, this is the path most likely to move your
            district forward fastest.
          </p>
          <Button asChild>
            <Link to={`/course/${recommendedCourse}`}>
              Go to {recommendedTitle}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startAudit(attemptNumber + 1)}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake the audit
        </Button>
      </div>
    </div>
  );
};

export default AuditLesson;
