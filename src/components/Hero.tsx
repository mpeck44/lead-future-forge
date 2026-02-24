import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Target,
  Users,
  GraduationCap,
  Award } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const stats = [
  { icon: Users, value: "50+", label: "District Leaders Trained" },
  { icon: GraduationCap, value: "4", label: "Leadership Courses" },
  { icon: Award, value: "COSN & ISTE", label: "Standards Aligned" },
];

const Hero = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 bg-[hsl(40,33%,96%)]">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">

            {/* Two-column grid — balanced 1fr / 1fr */}
            <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-10">

              {/* Left column */}
              <div className="text-center lg:text-left">
                <h1
                  className="font-display text-[2.6rem] sm:text-[3rem] lg:text-[3.35rem] font-bold text-navy leading-tight mb-4 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}>
                  From Reactive to Strategic:{" "}
                  <span className="text-dark-teal">
                    Lead AI Adoption With Confidence and Outcomes.
                  </span>
                </h1>

                <div
                  className="mb-6 h-1 w-28 rounded-full bg-gradient-to-r from-dark-teal to-green animate-fade-in lg:mx-0 mx-auto"
                  style={{ animationDelay: "0.15s" }} />

                <p
                  className="font-body text-lg sm:text-xl text-navy/70 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in"
                  style={{ animationDelay: "0.2s" }}>
                  A professional development system designed to help K-12 leaders
                  move beyond tools and workshops to build real AI strategies,
                  governance frameworks, and implementation roadmaps — with
                  ready-to-use deliverables.
                </p>

                <div
                  className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}>
                  <Button
                    size="lg"
                    onClick={scrollToCourses}
                    className="font-body font-semibold bg-green hover:bg-green/90 text-white px-8 py-6 text-base group">
                    Get the Leadership Forge Preview
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setWaitlistOpen(true)}
                    className="font-body font-semibold border-navy text-navy hover:bg-navy/5 px-8 py-6 text-base">
                    Join the Leadership Waitlist
                  </Button>
                </div>
              </div>

              {/* Right column — course card */}
              <div className="animate-fade-in flex items-center" style={{ animationDelay: "0.32s" }}>
                <div className="w-full rounded-3xl border border-navy/15 bg-white p-7 shadow-[0_28px_80px_-34px_rgba(8,40,52,0.18)]">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[hsl(191,65%,88%)] flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-[hsl(191,43%,28%)]" />
                      </div>
                      <div>
                        <p className="font-body text-xs font-semibold uppercase tracking-[0.13em] text-[hsl(191,43%,32%)]">
                          Featured Course
                        </p>
                        <h3 className="font-display text-2xl font-bold text-navy leading-tight">
                          AI Strategic Roadmap
                        </h3>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[hsl(9,79%,88%)] flex items-center justify-center">
                      <Target className="h-5 w-5 text-[hsl(9,57%,43%)]" />
                    </div>
                  </div>

                  <p className="font-body text-sm text-navy/80 mb-4">
                    12 lessons • 4.5 hours • build a district-ready implementation plan.
                  </p>

                  <div className="mb-5">
                    <div className="flex items-center justify-between font-body text-xs text-navy/70 mb-1.5">
                      <span>Progress preview</span>
                      <span className="font-semibold text-[hsl(145,57%,36%)]">65%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(214,27%,84%)] overflow-hidden">
                      <div className="h-full w-[65%] bg-green rounded-full" />
                    </div>
                  </div>

                  <Button
                    onClick={scrollToCourses}
                    className="w-full font-body font-semibold bg-green hover:bg-green/90 text-white">
                    Continue with Course Preview
                  </Button>

                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(192,64%,90%)] border border-[hsl(191,47%,78%)]">
                    <Sparkles className="h-4 w-4 text-[hsl(191,43%,32%)]" />
                    <span className="font-body text-xs text-[hsl(191,43%,28%)] font-semibold">
                      COSN &amp; ISTE aligned • district-ready templates included
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar — full width below both columns */}
            <div
              className="mt-12 pt-10 border-t border-navy/10 animate-fade-in"
              style={{ animationDelay: "0.45s" }}>
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-10">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-teal/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-dark-teal" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold text-navy leading-none">
                        {stat.value}
                      </p>
                      <p className="font-body text-xs text-navy/60 mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        source="hero-waitlist" />
    </>
  );
};

export default Hero;
