import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WaitlistModal from "./WaitlistModal";

import mockupCommunication from "@/assets/mockup-communication.jpg";
import mockupReadiness from "@/assets/mockup-readiness.jpg";
import mockupRoadmap from "@/assets/mockup-roadmap.jpg";
import mockupLaunch from "@/assets/mockup-launch.jpg";

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
    mockup: string;
    deliverables: string[];
  }
> = {
  fluency: {
    title: "AI Communication & Stakeholder Plan",
    shortDescription: "Tools you use Monday morning — templates, coordination maps, and action plans for your first week.",
    timeline: "BOARD-READY IN 1–2 WEEKS",
    mockup: mockupCommunication,
    deliverables: [
      '"5 Ways I Use AI" district document',
      "Stakeholder Coordination Map",
      "AI Communication Templates (staff, parents, students)",
      "5-Day AI Leadership Action Plan",
    ],
  },
  foundations: {
    title: "AI Landscape & Readiness Assessment",
    shortDescription: "Audit your district's AI maturity across infrastructure, staffing, policy, and student impact.",
    timeline: "BASELINE SCORECARD IN 2 WEEKS",
    mockup: mockupReadiness,
    deliverables: [
      "District AI Maturity Scorecard",
      "Instructional + Operations Readiness Audit",
      "Risk and Opportunity Prioritization Matrix",
      "Leadership Briefing Summary for cabinet teams",
    ],
  },
  strategy: {
    title: "AI Strategic Roadmap & Portfolio",
    shortDescription: "Build your district's phased AI strategy with governance, priorities, and a board-ready narrative.",
    timeline: "ROADMAP DRAFT IN 30 DAYS",
    mockup: mockupRoadmap,
    deliverables: [
      "AI Strategic Vision and Success Metrics",
      "Portfolio Prioritization Framework",
      "Governance Decision Rights Matrix",
      "Board Presentation Deck + Executive Narrative",
    ],
  },
  action: {
    title: "90-Day Launch & Implementation Plan",
    shortDescription: "Move from plan to execution with milestones, pilot playbooks, and a live progress dashboard.",
    timeline: "IMPLEMENTATION SPRINT IN 90 DAYS",
    mockup: mockupLaunch,
    deliverables: [
      "90-Day Launch Plan with milestones",
      "Pilot Site Implementation Playbook",
      "Responsible Use Governance Checklist",
      "Implementation Dashboard for progress tracking",
    ],
  },
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
      <section id="courses" className="relative py-[120px] bg-navy overflow-hidden">
        <div className="absolute inset-0 forge-texture opacity-10" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white mb-4 leading-tight">
              What You'll Build
            </h2>
            <p className="font-body text-xl text-white/50 max-w-2xl mx-auto">
              Concrete deliverables designed for district-level execution.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-white/10 bg-white/[0.03]">
                  <Skeleton className="h-[300px] bg-white/5" />
                  <div className="p-10 space-y-4">
                    <Skeleton className="h-8 w-3/4 bg-white/5" />
                    <Skeleton className="h-6 w-2/3 bg-white/5" />
                    <Skeleton className="h-32 w-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
              {visibleCourses.map((course, idx) => {
                const content = COURSE_CONTENT[course.slug];
                const deliverables =
                  course.deliverables.length > 0 ? course.deliverables : content.deliverables;

                return (
                  <div
                    key={course.id}
                    className="group bg-white/[0.04] backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-xl hover:shadow-gold/10 hover:scale-[1.03]"
                    style={{ marginTop: idx % 2 === 1 ? "40px" : "0" }}
                  >
                    {/* Mockup image */}
                    <div className="relative">
                      <img
                        src={content.mockup}
                        alt={`${content.title} template preview`}
                        loading="lazy"
                        width={960}
                        height={640}
                        className="w-full h-[280px] sm:h-[320px] object-cover"
                      />
                      {/* Timeline pill badge */}
                      <span className="absolute top-4 right-4 bg-burnt-orange text-white font-body text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">
                        {content.timeline}
                      </span>
                    </div>

                    <div className="p-8 sm:p-10 flex flex-col flex-1">
                      <h3 className="font-display text-[24px] sm:text-[28px] font-bold text-white leading-tight mb-3">
                        {content.title}
                      </h3>

                      <p className="font-body text-lg sm:text-xl text-white/60 mb-8 leading-relaxed">
                        {content.shortDescription}
                      </p>

                      <div className="flex-1 mb-8">
                        <p className="font-body text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
                          Deliverables
                        </p>
                        <ul className="space-y-3">
                          {deliverables.slice(0, 4).map((d, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 font-body text-base sm:text-lg text-white/80"
                            >
                              <CheckCircle2 className="w-5 h-5 text-burnt-orange mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          onClick={() => openWaitlist(course.slug, content.title, "overview")}
                          className="gold-hover w-full font-body font-semibold gap-2 bg-burnt-orange text-navy text-base py-6"
                        >
                          <Sparkles className="w-4 h-4" />
                          Download Overview
                        </Button>
                        <Button
                          onClick={() => openWaitlist(course.slug, content.title, "waitlist")}
                          variant="outline"
                          className="w-full font-body font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 text-base py-6"
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
            <p className="text-center text-white/50 font-body text-lg">
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
