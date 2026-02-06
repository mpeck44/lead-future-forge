import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-dark-teal to-navy opacity-95" />

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/20 border border-teal/30 mb-8 animate-fade-in">
              <span className="font-body text-[11px] uppercase tracking-widest text-light-teal">
                For K-12 Superintendents, Principals, and District Leaders
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-[2.75rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-white leading-tight mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Stop Reacting to AI.{" "}
              <span className="text-gold">Start Leading Through It.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="font-body text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              The Leadership Forge is the only professional development system
              that takes school leaders from AI-curious to AI-strategic—with
              real deliverables you'll use this week.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                size="lg"
                onClick={scrollToCourses}
                className="font-body font-semibold bg-gold hover:bg-gold/90 text-navy px-8 py-6 text-base group"
              >
                See the Pathways
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWaitlistOpen(true)}
                className="font-body font-semibold border-white/60 text-white hover:bg-white/10 hover:border-white px-8 py-6 text-base"
              >
                Join the Waitlist
              </Button>
            </div>

            {/* Social Proof Bar */}
            <div
              className="mt-16 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-sm text-white/70">
                <span>50+ leaders trained</span>
                <span className="text-white/30">|</span>
                <span>COSN/ISTE aligned</span>
                <span className="text-white/30">|</span>
                <span>Built by a practicing K-12 Director of Technology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
};

export default Hero;
