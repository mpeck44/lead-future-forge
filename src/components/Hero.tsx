import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const Hero = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(221,56%,17%)] via-[hsl(202,38%,20%)] to-[hsl(214,42%,18%)]" />
        <div className="absolute inset-0 hero-dot-grid opacity-22" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,hsl(185,62%,45%,0.24),transparent_45%),radial-gradient(circle_at_88%_75%,hsl(143,63%,47%,0.16),transparent_48%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[hsl(208,24%,72%,0.24)] to-transparent" />

        <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-dark-teal/16 blur-3xl" />
        <div className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full bg-green/12 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-12 lg:gap-10">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-teal/20 border border-dark-teal/35 mb-8 animate-fade-in">
                <Compass className="w-4 h-4 text-light-teal" />
                <span className="font-body text-[11px] uppercase tracking-widest text-light-teal">
                  For K-12 Superintendents, Principals, and District Leaders
                </span>
              </div>

              <h1
                className="font-display text-[2.6rem] sm:text-[3rem] lg:text-[3.35rem] font-bold text-white leading-tight mb-4 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                From Reactive to Strategic: <span className="text-[hsl(188,66%,69%)]">Lead AI Adoption With Confidence and Outcomes.</span>
              </h1>

              <div
                className="mb-6 h-1 w-28 rounded-full bg-gradient-to-r from-dark-teal to-green animate-fade-in lg:mx-0 mx-auto"
                style={{ animationDelay: "0.15s" }}
              />

              <p
                className="font-body text-lg sm:text-xl text-white/88 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                A professional development system designed to help K-12 leaders move beyond tools and workshops to build real AI strategies, governance frameworks, and implementation roadmaps — with ready-to-use deliverables.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  size="lg"
                  onClick={scrollToCourses}
                  className="font-body font-semibold bg-green hover:bg-green/90 text-white px-8 py-6 text-base group"
                >
                  Get the Leadership Forge Preview
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setWaitlistOpen(true)}
                  className="font-body font-semibold bg-white/90 text-navy hover:bg-white border-white/75 px-8 py-6 text-base"
                >
                  Join the Leadership Waitlist
                </Button>
              </div>

              <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-light-teal" />
                    <span className="font-body text-sm text-white/88">50+ district leaders trained</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-light-teal" />
                    <span className="font-body text-sm text-white/88">Standards aligned (COSN &amp; ISTE)</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <Wrench className="h-3.5 w-3.5 text-light-teal" />
                    <span className="font-body text-sm text-white/88">Built by a K-12 Director of Technology</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <ArrowRight className="h-3.5 w-3.5 text-light-teal" />
                    <span className="font-body text-sm text-white/88">Tools you can implement this quarter</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.32s" }}>
              <div className="mx-auto max-w-md rounded-3xl border border-white/35 bg-white/90 p-5 shadow-[0_28px_80px_-34px_rgba(8,40,52,0.75)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[hsl(191,65%,88%)] flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-[hsl(191,43%,28%)]" />
                    </div>
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.13em] text-[hsl(191,43%,32%)]">
                        Featured Course
                      </p>
                      <h3 className="font-display text-2xl font-bold text-navy leading-tight">AI Strategic Roadmap</h3>
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
                  className="w-full font-body font-semibold bg-green hover:bg-green/90 text-white"
                >
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
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} source="hero-waitlist" />
    </>
  );
};

export default Hero;
