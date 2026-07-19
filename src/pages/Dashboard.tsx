import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import DashboardHero from "@/components/dashboard/DashboardHero";
import PathwayStrip, { PathStep } from "@/components/dashboard/PathwayStrip";
import PortfolioGrid, { PortfolioCardItem } from "@/components/dashboard/PortfolioGrid";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import { Button } from "@/components/ui/button";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CheckoutModal, CheckoutTarget } from "@/components/CheckoutModal";
import { paymentsConfigured } from "@/lib/stripe";
import { COMPLETE_PATH, formatCents } from "@/lib/bundles";
import { isFounderActive, INDIVIDUAL_SUM_CENTS } from "@/lib/founderDiscount";
import { ArrowRight, Lock, Check, Settings } from "lucide-react";

interface Profile {
  full_name: string | null;
  recommended_course: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  amount_paid: number | null;
  created_at: string;
  courses: { id: string; title: string; slug: string };
}

interface CoreCourse {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  description: string | null;
}

const PAID_SLUGS = ["fluency", "strategy", "action"] as const;
const PATHWAY: { slug: string; title: string; tag: string }[] = [
  { slug: "foundations", title: "Foundations", tag: "Start here" },
  { slug: "fluency", title: "Fluency", tag: "Course 1" },
  { slug: "strategy", title: "Strategy", tag: "Course 2" },
  { slug: "action", title: "Action", tag: "Course 3" },
];

type DashState = "A" | "B" | "D" | "E";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkout, setCheckout] = useState<CheckoutTarget | null>(null);

  const forceCatalog = searchParams.get("view") === "catalog";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, recommended_course")
      .eq("id", user.id)
      .single()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  const { data: enrollments = [] } = useQuery({
    queryKey: ["dashboard-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, course_id, amount_paid, created_at, courses(id, title, slug)")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return (data || []) as Enrollment[];
    },
    enabled: !!user,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["dashboard-all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, price, description")
        .in("slug", ["foundations", ...PAID_SLUGS]);
      if (error) throw error;
      return (data || []) as CoreCourse[];
    },
  });

  const coursesBySlug = useMemo(() => {
    const m = new Map<string, CoreCourse>();
    allCourses.forEach((c) => m.set(c.slug, c));
    return m;
  }, [allCourses]);

  // Per-course progress + current module (only when enrolled)
  const { data: progressBundle } = useQuery({
    queryKey: ["dashboard-progress-bundle", user?.id, enrollments.map((e) => e.course_id).join(",")],
    queryFn: async () => {
      if (!user || enrollments.length === 0) {
        return {
          byCourse: new Map<string, { done: number; total: number }>(),
          currentModule: null as null | {
            moduleTitle: string;
            moduleIndex: number;
            moduleTotal: number;
            completedLessons: number;
            totalLessons: number;
            remainingMinutes: number;
            courseId: string;
          },
        };
      }
      const courseIds = enrollments.map((e) => e.course_id);
      const { data: modules } = await supabase
        .from("modules")
        .select("id, course_id, title, sequence_order")
        .in("course_id", courseIds)
        .order("sequence_order");
      const mods = modules || [];
      const moduleIds = mods.map((m) => m.id);
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, module_id, estimated_minutes")
        .in("module_id", moduleIds.length ? moduleIds : ["00000000-0000-0000-0000-000000000000"])
        .eq("is_published", true);
      const less = lessons || [];
      const { data: progress } = await supabase
        .from("user_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .eq("status", "completed");
      const completed = new Set((progress || []).map((p) => p.lesson_id));

      const byCourse = new Map<string, { done: number; total: number }>();
      courseIds.forEach((cid) => {
        const courseModuleIds = mods.filter((m) => m.course_id === cid).map((m) => m.id);
        const courseLessons = less.filter((l) => courseModuleIds.includes(l.module_id));
        byCourse.set(cid, {
          done: courseLessons.filter((l) => completed.has(l.id)).length,
          total: courseLessons.length,
        });
      });

      const mostRecent = [...enrollments].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      let currentModule = null as null | {
        moduleTitle: string;
        moduleIndex: number;
        moduleTotal: number;
        completedLessons: number;
        totalLessons: number;
        remainingMinutes: number;
        courseId: string;
      };
      if (mostRecent) {
        const courseModules = mods.filter((m) => m.course_id === mostRecent.course_id);
        for (let i = 0; i < courseModules.length; i++) {
          const m = courseModules[i];
          const mLessons = less.filter((l) => l.module_id === m.id);
          const done = mLessons.filter((l) => completed.has(l.id)).length;
          if (mLessons.length > 0 && done < mLessons.length) {
            const remainingMinutes = mLessons
              .filter((l) => !completed.has(l.id))
              .reduce((sum, l) => sum + (l.estimated_minutes || 5), 0);
            currentModule = {
              moduleTitle: m.title,
              moduleIndex: i + 1,
              moduleTotal: courseModules.length,
              completedLessons: done,
              totalLessons: mLessons.length,
              remainingMinutes,
              courseId: mostRecent.course_id,
            };
            break;
          }
        }
      }
      return { byCourse, currentModule };
    },
    enabled: !!user,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["dashboard-portfolio", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("id, title, status, used_in_district, course_id, updated_at, courses(title)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const markTested = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ used_in_district: true, used_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-portfolio", user?.id] });
      toast({ title: "Marked as tested", description: "Nice — that's the whole point." });
    },
    onError: (err: Error) =>
      toast({ title: "Couldn't update", description: err.message, variant: "destructive" }),
  });

  // ------ State detection ------
  const enrolledSlugs = new Set(enrollments.map((e) => e.courses?.slug).filter(Boolean) as string[]);
  const hasFoundations = enrolledSlugs.has("foundations");
  const hasPaidEnrollment = PAID_SLUGS.some((s) => enrolledSlugs.has(s));
  const auditTaken = !!profile?.recommended_course;

  let state: DashState;
  if (hasPaidEnrollment) state = "E";
  else if (auditTaken) state = "D";
  else if (hasFoundations) state = "B";
  else state = "A";

  // ------ Auto-open checkout from URL params (post-auth redirect) ------
  useEffect(() => {
    if (!user || allCourses.length === 0) return;
    const co = searchParams.get("checkout");
    if (!co) return;
    if (!paymentsConfigured()) {
      toast({
        title: "Payments not ready",
        description: "Checkout isn't configured yet. Please check back shortly.",
        variant: "destructive",
      });
      // strip param
      const p = new URLSearchParams(searchParams);
      p.delete("checkout"); p.delete("slug");
      setSearchParams(p, { replace: true });
      return;
    }
    if (co === "bundle") {
      setCheckout({ mode: "bundle" });
    } else if (co === "course") {
      const slug = searchParams.get("slug");
      const course = slug ? coursesBySlug.get(slug) : null;
      if (course) setCheckout({ mode: "course", courseId: course.id, courseTitle: course.title });
    }
    const p = new URLSearchParams(searchParams);
    p.delete("checkout"); p.delete("slug");
    setSearchParams(p, { replace: true });
  }, [user, allCourses, searchParams, setSearchParams, coursesBySlug]);

  // ------ Handlers ------
  const openBundle = () => {
    if (!paymentsConfigured()) {
      toast({ title: "Payments not ready", description: "Please check back shortly.", variant: "destructive" });
      return;
    }
    if (hasPaidEnrollment) {
      toast({
        title: "You already own part of the bundle",
        description: "Purchase the remaining courses individually.",
      });
      return;
    }
    setCheckout({ mode: "bundle" });
  };

  const openCourse = (slug: string) => {
    const course = coursesBySlug.get(slug);
    if (!course) return;
    if (!paymentsConfigured()) {
      toast({ title: "Payments not ready", description: "Please check back shortly.", variant: "destructive" });
      return;
    }
    setCheckout({ mode: "course", courseId: course.id, courseTitle: course.title });
  };

  const enrollFoundationsAndGo = async () => {
    if (!user) return;
    const course = coursesBySlug.get("foundations");
    if (!course) return;
    try {
      if (!enrolledSlugs.has("foundations")) {
        await supabase
          .from("enrollments")
          .insert({
            user_id: user.id,
            course_id: course.id,
            status: "active",
            amount_paid: 0,
          });
      }
    } catch (err) {
      // ignore duplicates
    }
    window.location.href = "/course/foundations";
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const currentModule = progressBundle?.currentModule || null;
  const mostRecentEnrollment = enrollments.length
    ? [...enrollments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  const continueCard = currentModule && mostRecentEnrollment
    ? {
        moduleTitle: currentModule.moduleTitle,
        courseTitle: mostRecentEnrollment.courses.title,
        moduleIndex: currentModule.moduleIndex,
        moduleTotal: currentModule.moduleTotal,
        completedLessons: currentModule.completedLessons,
        totalLessons: currentModule.totalLessons,
        remainingMinutes: currentModule.remainingMinutes,
        href: `/course/${mostRecentEnrollment.courses.slug}`,
      }
    : null;

  // Hero subtitle by state
  let subtitle = "Let's get you started with your first course.";
  if (state === "A") subtitle = "Start with Foundations — it's free and takes about 45 minutes.";
  else if (state === "B" && currentModule) {
    const remaining = currentModule.totalLessons - currentModule.completedLessons;
    subtitle = `You're ${currentModule.remainingMinutes} minutes from finishing ${currentModule.moduleTitle} — ${remaining} lesson${remaining === 1 ? "" : "s"} to go.`;
  } else if (state === "B") subtitle = "Keep going with Foundations. Your audit at the end unlocks your personalized path.";
  else if (state === "D") subtitle = "You've taken the audit. Here's the course we recommend based on your answers.";
  else if (state === "E" && currentModule) {
    const remaining = currentModule.totalLessons - currentModule.completedLessons;
    subtitle = `You're ${currentModule.remainingMinutes} minutes from finishing ${currentModule.moduleTitle} — ${remaining} lesson${remaining === 1 ? "" : "s"} to go.`;
  } else if (state === "E") subtitle = "You've completed every available lesson. Time to test what you've built in your district.";

  // Pathway steps
  const pathSteps: PathStep[] = PATHWAY.map((p, idx) => {
    const enrollment = enrollments.find((e) => e.courses?.slug === p.slug);
    const stats = enrollment ? progressBundle?.byCourse.get(enrollment.course_id) : undefined;
    let status: PathStep["status"] = "locked";
    let progressPercent: number | undefined;
    let href: string | undefined;
    if (enrollment && stats && stats.total > 0) {
      progressPercent = Math.round((stats.done / stats.total) * 100);
      status = stats.done >= stats.total ? "done" : "current";
      href = `/course/${enrollment.courses.slug}`;
    } else if (state === "A" && p.slug === "foundations") {
      status = "upnext";
    }
    return { index: idx + 1, title: p.title, tag: p.tag, status, progressPercent, href };
  });

  // Portfolio cards
  const portfolioCards: PortfolioCardItem[] = portfolio.slice(0, 4).map((p: any) => {
    const s: PortfolioCardItem["state"] = p.used_in_district ? "tested" : p.status === "draft" ? "draft" : "built";
    return { id: p.id, title: p.title, origin: p.courses?.title || "Your work", state: s };
  });
  const totalCount = portfolio.length;
  const testedCount = portfolio.filter((p: any) => p.used_in_district).length;

  // The hero CTA depends on state
  const heroCta = (() => {
    if (state === "A") return { label: "Start Foundations free", onClick: enrollFoundationsAndGo };
    if (state === "B") return { label: "Continue Foundations", href: "/course/foundations" };
    if (state === "D") return { label: "See the bundle", href: "#purchase-block" };
    return null;
  })();

  // Show purchase block if State D, or user forced catalog view (?view=catalog)
  const showPurchase = state === "D" || (forceCatalog && !hasPaidEnrollment);
  // Hide the "locked previews" if we're showing purchase block or already paid
  const showLockedPreviews = (state === "A" || state === "B") && !showPurchase;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Your Dashboard — EdLeaderForge</title>
        <meta name="description" content="Track your AI leadership progress, continue your courses, and access your portfolio of district-ready deliverables." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://edleaderforge.com/dashboard" />
      </Helmet>
      <PaymentTestModeBanner />
      <Header />

      <CheckoutModal target={checkout} onClose={() => setCheckout(null)} />

      <main className="pt-16 lg:pt-20 flex-1">
        <DashboardHero
          firstName={firstName}
          subtitle={subtitle}
          continueCard={state === "E" || state === "B" ? continueCard : null}
          ctaWhenEmpty={
            heroCta?.href
              ? { label: heroCta.label, href: heroCta.href }
              : heroCta
                ? { label: heroCta.label, href: "#" }
                : undefined
          }
          onEmptyCtaClick={heroCta?.onClick}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-2 mb-4 flex justify-end">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Account settings
          </Link>
        </div>

        {state === "D" && (
          <RecommendationCard
            recommendedSlug={profile?.recommended_course ?? null}
            courseTitles={Object.fromEntries(
              PAID_SLUGS.map((s) => [s, coursesBySlug.get(s)?.title ?? s])
            )}
            enrollmentsBySlug={Object.fromEntries(
              enrollments
                .filter((e) => e.courses?.slug)
                .map((e) => [e.courses.slug, { courseId: e.course_id, slug: e.courses.slug }])
            )}
            progressByCourseId={progressBundle?.byCourse ?? new Map()}
          />
        )}

        {showPurchase && (
          <PurchaseBlock
            recommendedSlug={profile?.recommended_course ?? null}
            courses={PAID_SLUGS.map((s) => coursesBySlug.get(s)).filter(Boolean) as CoreCourse[]}
            enrolledSlugs={enrolledSlugs}
            onBuyBundle={openBundle}
            onBuyCourse={openCourse}
          />
        )}

        {showLockedPreviews && (
          <LockedPreviews
            courses={PAID_SLUGS.map((s) => coursesBySlug.get(s)).filter(Boolean) as CoreCourse[]}
          />
        )}

        <PathwayStrip steps={pathSteps} />

        {state === "E" && (
          <PortfolioGrid
            items={portfolioCards}
            totalCount={totalCount}
            testedCount={testedCount}
            onMarkTested={(id) => markTested.mutate(id)}
          />
        )}
      </main>
      <DashboardFooter />
    </div>
  );
};

/* ---------- Sub-components ---------- */

interface PurchaseBlockProps {
  recommendedSlug: string | null;
  courses: CoreCourse[];
  enrolledSlugs: Set<string>;
  onBuyBundle: () => void;
  onBuyCourse: (slug: string) => void;
}

const COURSE_SUB: Record<string, string> = {
  fluency:
    "AI Communication & Stakeholder Plan — templates, coordination map, 5-day action plan.",
  strategy:
    "3-Year AI Strategic Roadmap — governance matrix, portfolio priorities, board-ready deck.",
  action:
    "90-Day Pilot Launch Plan — milestones, pilot playbook, responsible-use checklist.",
};

function PurchaseBlock({ recommendedSlug, courses, enrolledSlugs, onBuyBundle, onBuyCourse }: PurchaseBlockProps) {
  const recommended = recommendedSlug && courses.find((c) => c.slug === recommendedSlug);
  const others = courses.filter((c) => c.slug !== recommended?.slug);
  const savings = INDIVIDUAL_SUM_CENTS - COMPLETE_PATH.priceCents;

  return (
    <section id="purchase-block" className="py-12 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Recommended course (primary) OR bundle takes primary when no recommendation */}
          {recommended ? (
            <RecommendedCard
              course={recommended}
              enrolled={enrolledSlugs.has(recommended.slug)}
              onBuy={() => onBuyCourse(recommended.slug)}
            />
          ) : (
            <BundlePrimaryCard onBuy={onBuyBundle} savings={savings} />
          )}

          {/* Bundle sidecar OR (if bundle is primary) a compact "why bundle" summary */}
          {recommended ? (
            <BundleSidecarCard onBuy={onBuyBundle} savings={savings} />
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>

        {/* Remaining individual courses */}
        {others.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-semibold mb-4">
              Prefer one course at a time?
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(recommended ? others : courses).map((c) => (
                <IndividualCourseCard
                  key={c.id}
                  course={c}
                  enrolled={enrolledSlugs.has(c.slug)}
                  onBuy={() => onBuyCourse(c.slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RecommendedCard({ course, enrolled, onBuy }: { course: CoreCourse; enrolled: boolean; onBuy: () => void }) {
  return (
    <div className="rounded-lg bg-navy text-white p-8 border-t-4 border-gold shadow-xl">
      <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-gold mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Recommended for you
      </span>
      <h2 className="font-display text-3xl font-bold mb-2">{course.title}</h2>
      <p className="font-body text-white/70 text-sm mb-6 max-w-[46ch]">
        {COURSE_SUB[course.slug] || course.description}
      </p>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-display text-3xl font-bold text-gold">${((course.price ?? 7900) / 100).toFixed(0)}</span>
        <span className="font-body text-white/50 text-sm">one-time</span>
      </div>
      {enrolled ? (
        <Button asChild className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold rounded-[10px]">
          <Link to={`/course/${course.slug}`}>Continue learning <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      ) : (
        <Button
          onClick={onBuy}
          className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold rounded-[10px] px-6 py-6 text-base"
        >
          Get {course.title} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function BundlePrimaryCard({ onBuy, savings }: { onBuy: () => void; savings: number }) {
  return (
    <div className="rounded-lg bg-navy text-white p-8 border-t-4 border-gold shadow-xl">
      <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-gold mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Complete Path
      </span>
      <h2 className="font-display text-3xl font-bold mb-2">Fluency + Strategy + Action</h2>
      <p className="font-body text-white/70 text-sm mb-6 max-w-[46ch]">
        All three core courses. Every framework, every artifact, every deliverable you'll use next quarter.
      </p>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-display text-4xl font-bold text-gold">{formatCents(COMPLETE_PATH.priceCents)}</span>
        <span className="font-body text-white/50 text-sm line-through">${(INDIVIDUAL_SUM_CENTS / 100).toFixed(0)}</span>
        <span className="font-body text-white/70 text-sm">save {formatCents(savings)}</span>
      </div>
      <Button
        onClick={onBuy}
        className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold rounded-[10px] px-6 py-6 text-base"
      >
        Get the bundle <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      {isFounderActive() && (
        <p className="mt-3 font-body text-xs text-gold/80">Founder pricing ends Sept 7.</p>
      )}
    </div>
  );
}

function BundleSidecarCard({ onBuy, savings }: { onBuy: () => void; savings: number }) {
  return (
    <div className="rounded-lg bg-background border border-border p-6 shadow-sm">
      <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43,69%,35%)] mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Or go all-in
      </span>
      <h3 className="font-display text-xl font-bold mb-2">Complete Path bundle</h3>
      <p className="font-body text-sm text-muted-foreground mb-4">
        Fluency + Strategy + Action. Every artifact, every framework, one purchase.
      </p>
      <ul className="font-body text-sm space-y-1.5 mb-4">
        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-gold mt-0.5 flex-none" /> All three core courses</li>
        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-gold mt-0.5 flex-none" /> Save {formatCents(savings)} vs. buying separately</li>
        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-gold mt-0.5 flex-none" /> Lifetime access</li>
      </ul>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-2xl font-bold">{formatCents(COMPLETE_PATH.priceCents)}</span>
        <span className="font-body text-sm text-muted-foreground line-through">${(INDIVIDUAL_SUM_CENTS / 100).toFixed(0)}</span>
      </div>
      <Button onClick={onBuy} variant="outline" className="w-full font-body border-foreground/25">
        Get the bundle <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function IndividualCourseCard({ course, enrolled, onBuy }: { course: CoreCourse; enrolled: boolean; onBuy: () => void }) {
  return (
    <div className="rounded-lg bg-white border border-border p-5 shadow-sm flex flex-col">
      <h4 className="font-display text-lg font-bold mb-1">{course.title}</h4>
      <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
        {COURSE_SUB[course.slug] || course.description}
      </p>
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-xl font-bold">${((course.price ?? 7900) / 100).toFixed(0)}</span>
        <Link to={`/courses/${course.slug}`} className="font-body text-xs text-muted-foreground hover:text-foreground underline">
          Details
        </Link>
      </div>
      {enrolled ? (
        <Button asChild size="sm" variant="outline" className="w-full font-body">
          <Link to={`/course/${course.slug}`}>Continue <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      ) : (
        <Button onClick={onBuy} size="sm" className="w-full font-body">
          Buy
        </Button>
      )}
    </div>
  );
}

function LockedPreviews({ courses }: { courses: CoreCourse[] }) {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
          <h2 className="font-display text-xl font-bold">What's ahead</h2>
          <p className="font-body text-sm text-muted-foreground">
            Finish Foundations to unlock your personalized recommendation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/60 bg-white p-5 relative">
              <Lock className="absolute top-4 right-4 h-4 w-4 text-muted-foreground/50" aria-hidden />
              <h3 className="font-display text-lg font-semibold mb-1">{c.title}</h3>
              <p className="font-body text-sm text-muted-foreground line-clamp-3">
                {COURSE_SUB[c.slug] || c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
