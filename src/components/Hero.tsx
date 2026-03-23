import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const Hero = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-navy pt-20">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 forge-grid-texture opacity-30" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal/50 to-navy" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            {/* Headline — massive, intentional */}
            <h1
              className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem] font-bold text-white leading-[1.1] mb-8 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              From Reactive Chaos{" "}
              <br className="hidden sm:block" />
              to <span className="text-burnt-orange">Strategic Leadership.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="font-body text-lg sm:text-xl lg:text-2xl text-white/60 max-w-2xl mb-12 leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Move beyond one-off tools and workshops. Build real governance,
              roadmaps, and board-ready plans — with deliverables you use
              Monday morning.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-start gap-4 mb-16 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                size="lg"
                onClick={scrollToCourses}
                className="font-body font-semibold bg-burnt-orange hover:bg-burnt-orange/90 text-white px-10 py-7 text-lg group"
              >
                Get the Leadership Forge Preview
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWaitlistOpen(true)}
                className="font-body font-semibold border-white/30 text-white hover:bg-white/10 px-8 py-7 text-lg"
              >
                Join the Waitlist
              </Button>
            </div>

            {/* Micro-trust line */}
            <div
              className="flex flex-wrap items-center gap-6 text-white/40 font-body text-sm animate-fade-in"
              style={{ animationDelay: "0.45s" }}
            >
              <span>50+ District Leaders Trained</span>
              <span className="hidden sm:inline">·</span>
              <span>4 Leadership Courses</span>
              <span className="hidden sm:inline">·</span>
              <span>COSN & ISTE Aligned</span>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        source="hero-waitlist"
      />
    </>
  );
};

export default Hero;
