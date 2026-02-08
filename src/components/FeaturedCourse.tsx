import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WaitlistModal from "./WaitlistModal";

interface CourseWithDeliverables {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  estimated_hours: number | null;
  path_type: string | null;
  tags: string[] | null;
  deliverables: string[];
}

const COURSE_THEMES: Record<string, { gradient: string; accent: string }> = {
  foundations: {
    gradient: "from-navy via-dark-teal to-teal",
    accent: "text-light-teal",
  },
  fluency: {
    gradient: "from-teal via-dark-teal to-navy",
    accent: "text-gold",
  },
  strategy: {
    gradient: "from-navy via-navy to-gold/80",
    accent: "text-gold",
  },
  action: {
    gradient: "from-dark-teal via-green to-teal",
    accent: "text-light-teal",
  },
};

const AUDIENCE_MAP: Record<string, string> = {
  foundations: "All K-12 Leaders",
  fluency: "Practitioners",
  strategy: "Superintendents & Cabinet",
  action: "Implementation Teams",
};

const DEFAULT_THEME = {
  gradient: "from-navy to-teal",
  accent: "text-light-teal",
};

const FeaturedCourse = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("featured");
  const [waitlistSlug, setWaitlistSlug] = useState<string | undefined>();
  const [waitlistTitle, setWaitlistTitle] = useState<string | undefined>();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async (): Promise<CourseWithDeliverables[]> => {
      // Fetch featured courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, slug, description, estimated_hours, path_type, tags")
        .eq("featured", true)
        .order("created_at");

      if (coursesError) throw coursesError;
      if (!coursesData || coursesData.length === 0) return [];

      // Fetch deliverables for all featured courses
      const courseIds = coursesData.map((c) => c.id);
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("course_id, deliverable_name, sequence_order")
        .in("course_id", courseIds)
        .not("deliverable_name", "is", null)
        .order("sequence_order");

      if (modulesError) throw modulesError;

      // Group deliverables by course
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

  const openWaitlist = (slug: string, title: string) => {
    setWaitlistSource(`featured-${slug}`);
    setWaitlistSlug(slug);
    setWaitlistTitle(title);
    setWaitlistOpen(true);
  };

  const getShortDescription = (description: string | null): string => {
    if (!description) return "";
    // Take just the first line/paragraph (before double newline)
    const firstParagraph = description.split("\n\n")[0];
    return firstParagraph;
  };

  return (
    <>
      <section id="courses" className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What You'll Build
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Real tools and frameworks you can use in your district—not just theory
            </p>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
                  <Skeleton className="h-28" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {courses.map((course) => {
                const theme = COURSE_THEMES[course.slug] || DEFAULT_THEME;
                const audience = AUDIENCE_MAP[course.slug] || "K-12 Leaders";

                return (
                  <div
                    key={course.id}
                    className="group relative bg-card rounded-2xl overflow-hidden shadow-lg border border-border flex flex-col transition-shadow hover:shadow-xl"
                  >
                    {/* Gradient Header */}
                    <div className={`h-28 bg-gradient-to-br ${theme.gradient} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20">
                            <span className="font-display font-bold text-lg text-gold">
                              {course.title.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Fade into card */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                        {course.title}
                      </h3>

                      {/* Short Description */}
                      <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-2">
                        {getShortDescription(course.description)}
                      </p>

                      {/* Meta Bar */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-body font-medium text-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {course.estimated_hours
                            ? `~${course.estimated_hours} hours`
                            : "Coming Soon"}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-body font-medium text-foreground">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {audience}
                        </div>
                        {(course.tags || []).slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs font-body rounded-full px-3 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Deliverables */}
                      <div className="flex-1 mb-6">
                        <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          What You'll Build
                        </p>
                        {course.deliverables.length > 0 ? (
                          <ul className="space-y-1.5">
                            {course.deliverables.map((d, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 font-body text-sm text-foreground"
                              >
                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-body text-sm text-muted-foreground italic">
                            Deliverables coming soon
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => openWaitlist(course.slug, course.title)}
                        variant="outline"
                        className="w-full font-body font-semibold gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Coming Soon — Join Waitlist
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-body">
              Courses are being prepared. Check back soon!
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
