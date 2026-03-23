import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  LayoutDashboard,
  Map,
  Megaphone,
  Network,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WaitlistModal from "./WaitlistModal";

interface CourseWithDeliverables {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  deliverables: string[];
}

const COURSE_CONTENT: Record<
  string,
  {
    title: string;
    shortDescription: string;
    timeline: string;
    icon: typeof Megaphone;
    deliverables: string[];
  }
> = {
  fluency: {
    title: "AI Communication & Stakeholder Plan",
    shortDescription: "Tools you use Monday morning.",
    timeline: "Board-ready assets in 1-2 weeks",
    icon: Megaphone,
    deliverables: [
      '"5 Ways I Use AI" district document',
      "Stakeholder Coordination Map",
      "AI Communication Templates (staff, parents, students)",
      "5-Day AI Leadership Action Plan",
    ],
  },
  foundations: {
    title: "AI Landscape & Readiness Assessment",
    shortDescription: "Audit your district readiness.",
    timeline: "Baseline scorecard in 2 weeks",
    icon: Network,
    deliverables: [
      "District AI Maturity Scorecard",
      "Instructional + Operations Readiness Audit",
      "Risk and Opportunity Prioritization Matrix",
      "Leadership Briefing Summary for cabinet teams",
    ],
  },
  strategy: {
    title: "AI Strategic Roadmap & Portfolio",
    shortDescription: "Plan priorities with confidence.",
    timeline: "Roadmap draft in 30 days",
    icon: Map,
    deliverables: [
      "AI Strategic Vision and Success Metrics",
      "Portfolio Prioritization Framework",
      "Governance Decision Rights Matrix",
      "Board Presentation Deck + Executive Narrative",
    ],
  },
  action: {
    title: "90-Day Launch & Implementation Plan",
    shortDescription: "Move from plan to execution.",
    timeline: "Implementation sprint in 90 days",
    icon: LayoutDashboard,
    deliverables: [
      "90-Day Launch Plan with milestones",
      "Pilot Site Implementation Playbook",
      "Responsible Use Governance Checklist",
      "Implementation Dashboard for progress tracking",
    ],
  },
};

const HEADER_STYLES: Record<string, string> = {
  fluency: "bg-burnt-orange",
  foundations: "bg-charcoal",
  strategy: "bg-navy",
  action: "bg-burnt-orange/80",
};

const COURSE_ORDER = ["fluency", "foundations", "strategy", "action"];

const FeaturedCourse = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("featured");
  const [waitlistSlug, setWaitlistSlug] = useState<string | undefined>();
  const [waitlistTitle, setWaitlistTitle] = useState<string | undefined>();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async (): Promise<CourseWithDeliverables[]> => {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, slug, description")
        .eq("featured", true)
        .order("created_at");

      if (coursesError) throw coursesError;
      if (!coursesData || coursesData.length === 0) return [];

      const courseIds = coursesData.map((c) => c.id);
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("course_id, deliverable_name, sequence_order")
        .in("course_id", courseIds)
        .not("deliverable_name", "is", null)
        .order("sequence_order");

      if (modulesError) throw modulesError;

      const deliverablesByCourse: Record<string, string[]> = {};
      (modulesData || []).forEach((m) => {
        if (!deliverablesByCourse[m.course_id]) {
          deliverablesByCourse[m.course_id] = [];
        }
        if (m.deliverable_name) {
          deliverablesByCourse[m.course_id].push(m.deliverable_name);
        }
      });

      return coursesData.map((course) => ({
        ...course,
        deliverables: deliverablesByCourse[course.id] || [],
      }));
    },
  });

  const openWaitlist = (slug: string, title: string, sourceType: "overview" | "waitlist") => {
    setWaitlistSource(`${sourceType}-${slug}`);
    setWaitlistSlug(slug);
    setWaitlistTitle(title);
    setWaitlistOpen(true);
  };

  const visibleCourses = (courses || [])
    .filter((course) => COURSE_CONTENT[course.slug])
    .sort((a, b) => COURSE_ORDER.indexOf(a.slug) - COURSE_ORDER.indexOf(b.slug));

  return (
    <>
      <section id="courses" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What You'll Build
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Concrete deliverables designed for district-level execution.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
                  <Skeleton className="h-24" />
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {visibleCourses.map((course) => {
                const content = COURSE_CONTENT[course.slug];
                const Icon = content.icon;
                const deliverables =
                  course.deliverables.length > 0 ? course.deliverables : content.deliverables;

                return (
                  <div
                    key={course.id}
                    className="group bg-card rounded-xl overflow-hidden border border-border flex flex-col transition-shadow hover:shadow-lg"
                  >
                    {/* Tall header band with title */}
                    <div
                      className={`${HEADER_STYLES[course.slug] || "bg-primary"} px-8 py-6 flex items-center gap-4`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-white leading-tight">
                        {content.title}
                      </h3>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <p className="font-body text-sm text-muted-foreground mb-3">
                        {content.shortDescription}
                      </p>

                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-burnt-orange mb-6">
                        {content.timeline}
                      </p>

                      <div className="flex-1 mb-8">
                        <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Deliverables
                        </p>
                        <ul className="space-y-2">
                          {deliverables.slice(0, 4).map((d, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 font-body text-sm text-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4 text-burnt-orange mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          onClick={() => openWaitlist(course.slug, content.title, "overview")}
                          className="w-full font-body font-semibold gap-2 bg-burnt-orange hover:bg-burnt-orange/90 text-white"
                        >
                          <Sparkles className="w-4 h-4" />
                          Download Overview
                        </Button>
                        <Button
                          onClick={() => openWaitlist(course.slug, content.title, "waitlist")}
                          variant="outline"
                          className="w-full font-body font-semibold"
                        >
                          Join the Waitlist
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-body">
              The first leadership deliverable previews are being finalized this month.
            </p>
          )}
        </div>
      </section>

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        source={waitlistSource}
        courseSlug={waitlistSlug}
        courseTitle={waitlistTitle}
      />
    </>
  );
};

export default FeaturedCourse;
