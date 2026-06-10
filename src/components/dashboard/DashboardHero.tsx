import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

interface DashboardHeroProps {
  firstName: string;
  subtitle: string;
  continueCard: {
    moduleTitle: string;
    courseTitle: string;
    moduleIndex: number;
    moduleTotal: number;
    completedLessons: number;
    totalLessons: number;
    remainingMinutes: number;
    href: string;
  } | null;
  ctaWhenEmpty?: { label: string; href: string };
}

const DashboardHero = ({ firstName, subtitle, continueCard, ctaWhenEmpty }: DashboardHeroProps) => {
  const pct = continueCard && continueCard.totalLessons > 0
    ? Math.round((continueCard.completedLessons / continueCard.totalLessons) * 100)
    : 0;

  return (
    <section className="bg-navy text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px] lg:gap-16 items-center">
          <div>
            <h1 className="font-display text-3xl lg:text-5xl font-bold mb-3 text-white">
              Welcome back, {firstName}.
            </h1>
            <p className="font-body text-white/70 text-base lg:text-lg max-w-[46ch]">
              {subtitle}
            </p>
          </div>

          {continueCard ? (
            <div className="bg-background text-foreground rounded-lg shadow-2xl border-t-4 border-gold p-7">
              <span className="block font-body text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43,69%,35%)] mb-2">
                Pick up where you left off
              </span>
              <h2 className="font-display text-2xl font-bold mb-1">
                {continueCard.moduleTitle}
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-4">
                {continueCard.courseTitle} · Module {continueCard.moduleIndex} of {continueCard.moduleTotal}
              </p>

              <div className="mb-4">
                <div className="h-2 rounded-full bg-muted border border-border overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5 font-body">
                  <span>{continueCard.completedLessons} of {continueCard.totalLessons} lessons</span>
                  <span>{pct}%</span>
                </div>
              </div>

              <p className="font-body text-sm text-foreground mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[hsl(43,69%,35%)] flex-none" />
                {continueCard.remainingMinutes} minutes remaining — designed to finish in one sitting.
              </p>

              <Link
                to={continueCard.href}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Continue Module {continueCard.moduleIndex} <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-3 font-body">
                Keep momentum — each module ships a deliverable to your portfolio.
              </p>
            </div>
          ) : (
            <div className="bg-background text-foreground rounded-lg shadow-2xl border-t-4 border-gold p-7">
              <span className="block font-body text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43,69%,35%)] mb-2">
                Get started
              </span>
              <h2 className="font-display text-2xl font-bold mb-2">
                Ready to build something you can use tomorrow?
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-5">
                Pick a course and walk away with real documents, frameworks, and tools you can use in your district next week.
              </p>
              <Link
                to={ctaWhenEmpty?.href || "/courses"}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold text-navy font-body font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(43,72%,66%)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                {ctaWhenEmpty?.label || "Explore Courses"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
