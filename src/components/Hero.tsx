import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Wrench } from "lucide-react";
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
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-[hsl(200,32%,12%)] to-navy" />
        <div className="absolute inset-0 hero-dot-grid opacity-35" />

        <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-dark-teal/20 blur-3xl" />
        <div className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full bg-green/15 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-teal/25 border border-dark-teal/40 mb-8 animate-fade-in">
              <Compass className="w-4 h-4 text-light-teal" />
              <span className="font-body text-[11px] uppercase tracking-widest text-light-teal">
                For K-12 Superintendents, Principals, and District Leaders
              </span>
            </div>

            <h1
              className="font-display text-[2.75rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-white leading-tight mb-4 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              From Reactive to Strategic: <span className="text-light-teal">Lead AI Adoption With Confidence and Outcomes.</span>
            </h1>

            <div
              className="mx-auto mb-6 h-1 w-28 rounded-full bg-gradient-to-r from-dark-teal to-green animate-fade-in"
              style={{ animationDelay: "0.15s" }}
            />

            <p
              className="font-body text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              A professional development system designed to help K-12 leaders move beyond tools and workshops to build real AI strategies, governance frameworks, and implementation roadmaps — with ready-to-use deliverables.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
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
                className="font-body font-semibold bg-white text-navy hover:bg-white/90 border-white px-8 py-6 text-base"
              >
                Join the Leadership Waitlist
              </Button>
            </div>

            <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/85">50+ district leaders trained</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <ShieldCheck className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/85">Standards aligned (COSN &amp; ISTE)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <Wrench className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/85">Built by a K-12 Director of Technology</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <ArrowRight className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/85">Tools you can implement this quarter</span>
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
