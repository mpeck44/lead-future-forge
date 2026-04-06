import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistModal from "./WaitlistModal";
import heroLeader from "@/assets/hero-leader.jpg";

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
        <div className="absolute inset-0 forge-texture opacity-10" />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal/60 to-navy" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-[160px] lg:py-[200px]">
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 lg:gap-8 items-center">
            {/* Left column — text + CTAs */}
            <div>
              <h1
                className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-white leading-[1.05] tracking-tight mb-8 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                From Reactive Chaos{" "}
                <br className="hidden sm:block" />
                to{" "}
                <span style={{ color: "#d4af37" }}>
                  Strategic Leadership.
                </span>
              </h1>

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
                className="flex flex-col sm:flex-row items-start gap-4 mb-12 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  size="lg"
                  onClick={scrollToCourses}
                  className="gold-hover font-body font-semibold px-12 py-8 text-[18px] group rounded-lg"
                  style={{ backgroundColor: "#d4af37", color: "#0F172A" }}
                >
                  Get the Leadership Forge Preview
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setWaitlistOpen(true)}
                  className="font-body font-semibold border-2 border-white bg-transparent text-white hover:bg-white hover:text-secondary px-10 py-8 text-[18px] transition-all duration-200 rounded-lg"
                >
                  Join the Waitlist
                </Button>
              </div>

              {/* Trust bar */}
              <div
                className="flex flex-wrap items-center gap-3 text-white/50 font-body text-[15px] animate-fade-in"
                style={{ animationDelay: "0.45s" }}
              >
                <span>50+ District Leaders Trained</span>
                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-gold" />
                <span>4 Leadership Courses</span>
                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-gold" />
                <span>COSN & ISTE Aligned</span>
              </div>
            </div>

            {/* Right column — hero image */}
            <div
              className="relative animate-fade-in order-first lg:order-last"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/40">
                <img
                  src={heroLeader}
                  alt="K-12 district superintendent confidently presenting AI strategy to a school board"
                  width={896}
                  height={1152}
                  className="w-full h-auto object-cover aspect-[4/5] lg:aspect-[3/4]"
                />
                {/* Subtle gradient overlay at bottom for blending */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
              </div>
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
