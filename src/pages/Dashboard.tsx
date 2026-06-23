import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import DashboardHero from "@/components/dashboard/DashboardHero";
import PathwayStrip, { PathStep } from "@/components/dashboard/PathwayStrip";
import PortfolioGrid, { PortfolioCardItem } from "@/components/dashboard/PortfolioGrid";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import RecommendationCard from "@/components/dashboard/RecommendationCard";

interface Profile {
  full_name: string | null;
  recommended_course: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    slug: string;
  };
}

// Pathway slug → display config
const PATHWAY: { slug: string; title: string; tag: string }[] = [
  { slug: "foundations", title: "The Launchpad", tag: "Foundations" },
  { slug: "fluency", title: "Command the Tools", tag: "Fluency" },
  { slug: "strategy", title: "Chart the Course", tag: "Strategy" },
  { slug: "action", title: "Ship It", tag: "Action" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, recommended_course")
      .eq("id", user.id)
      .single()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  // Enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ["dashboard-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, course_id, created_at, courses(id, title, slug)")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return (data || []) as Enrollment[];
    },
    enabled: !!user,
  });

  // Per-course progress + current module
  const { data: progressBundle } = useQuery({
    queryKey: ["dashboard-progress-bundle", user?.id, enrollments.map((e) => e.course_id).join(",")],
    queryFn: async () => {
      if (!user || enrollments.length === 0) {
        return { byCourse: new Map<string, { done: number; total: number }>(), currentModule: null as null | {
          moduleTitle: string;
          moduleIndex: number;
          moduleTotal: number;
          completedLessons: number;
          totalLessons: number;
          remainingMinutes: number;
          courseId: string;
        } };
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

      // Current module = first incomplete module of the most-recent enrollment
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

  // Portfolio items
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

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const currentModule = progressBundle?.currentModule || null;
  const mostRecentEnrollment = enrollments.length
    ? [...enrollments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  // Hero subtitle
  let subtitle = "Let's get you started with your first course.";
  if (currentModule) {
    const remaining = currentModule.totalLessons - currentModule.completedLessons;
    subtitle = `You're ${currentModule.remainingMinutes} minutes from finishing ${currentModule.moduleTitle} — ${remaining} lesson${remaining === 1 ? "" : "s"} to go.`;
  } else if (enrollments.length > 0) {
    subtitle = "You've completed every available lesson. Time to test what you've built in your district.";
  }

  // Pathway steps
  const pathSteps: PathStep[] = PATHWAY.map((p, idx) => {
    const enrollment = enrollments.find((e) => e.courses?.slug === p.slug);
    const stats = enrollment ? progressBundle?.byCourse.get(enrollment.course_id) : undefined;
    let status: PathStep["status"] = "locked";
    let progressPercent: number | undefined;
    let href: string | undefined;
    if (enrollment && stats && stats.total > 0) {
      progressPercent = Math.round((stats.done / stats.total) * 100);
      if (stats.done >= stats.total) status = "done";
      else status = "current";
      href = `/course/${enrollment.courses.slug}`;
    } else {
      // first locked step = up next
      const firstLockedIdx = PATHWAY.findIndex((pp) => {
        const e = enrollments.find((en) => en.courses?.slug === pp.slug);
        const s = e ? progressBundle?.byCourse.get(e.course_id) : undefined;
        return !e || !s || s.total === 0 || s.done < s.total;
      });
      if (idx === firstLockedIdx && !enrollment) {
        status = "upnext";
        href = "/courses";
      }
    }
    return {
      index: idx + 1,
      title: p.title,
      tag: p.tag,
      status,
      progressPercent,
      href,
    };
  });

  // Portfolio cards (cap at 4 most-recent)
  const portfolioCards: PortfolioCardItem[] = portfolio.slice(0, 4).map((p: any) => {
    const state: PortfolioCardItem["state"] = p.used_in_district
      ? "tested"
      : p.status === "draft"
        ? "draft"
        : "built";
    const courseTitle = p.courses?.title || "Your work";
    return {
      id: p.id,
      title: p.title,
      origin: courseTitle,
      state,
    };
  });

  const totalCount = portfolio.length;
  const testedCount = portfolio.filter((p: any) => p.used_in_district).length;

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pt-16 lg:pt-20 flex-1">
        <DashboardHero
          firstName={firstName}
          subtitle={subtitle}
          continueCard={continueCard}
          ctaWhenEmpty={{ label: "Explore Courses", href: "/courses" }}
        />
        <PathwayStrip steps={pathSteps} />
        <PortfolioGrid
          items={portfolioCards}
          totalCount={totalCount}
          testedCount={testedCount}
          onMarkTested={(id) => markTested.mutate(id)}
        />
      </main>
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
