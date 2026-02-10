import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, ShieldCheck, Wrench } from "lucide-react";
import WaitlistModal from "./WaitlistModal";
const Hero = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient — deeper navy-dominant */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-[hsl(200,30%,12%)] to-navy" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 hero-dot-grid opacity-40" />

        {/* Floating decorative elements */}
        <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-teal/15 blur-3xl animate-float-slow" />
        <div className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full bg-gold/10 blur-3xl animate-float-slower" />
        <div className="absolute top-[55%] right-[25%] w-40 h-40 rounded-full border border-teal/20 animate-float-slow" style={{
        animationDelay: "5s"
      }} />
        <div className="absolute top-[30%] left-[60%] w-24 h-24 rounded-full border border-gold/15 animate-float-slower" style={{
        animationDelay: "8s"
      }} />

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
            <h1 className="font-display text-[2.75rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-white leading-tight mb-4 animate-fade-in" style={{
            animationDelay: "0.1s"
          }}>
              Stop Reacting to AI.{" "}
              <span className="text-gold">Start Leading Through It.</span>
            </h1>

            {/* Accent line */}
            <div className="mx-auto mb-6 h-1 w-28 rounded-full bg-gradient-to-r from-teal to-gold animate-fade-in" style={{
            animationDelay: "0.15s"
          }} />

            {/* Subheadline */}
            <p className="font-body text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              The professional development system designed specifically for K-12 leaders 
to move from reactive AI adoption to strategic transformation—with 
deliverables you can implement immediately.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{
            animationDelay: "0.3s"
          }}>
              <Button size="lg" onClick={scrollToCourses} className="font-body font-semibold bg-gold hover:bg-gold/90 text-navy px-8 py-6 text-base group">
                See the Pathways
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setWaitlistOpen(true)} className="font-body font-semibold bg-white text-navy hover:bg-white/90 border-white px-8 py-6 text-base">
                Join the Waitlist
              </Button>
            </div>

            {/* Social Proof Bar */}
            <div className="mt-16 animate-fade-in" style={{
            animationDelay: "0.4s"
          }}>
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                  <Users className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/80">50+ leaders trained</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/80">COSN/ISTE aligned</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                  <Wrench className="h-3.5 w-3.5 text-light-teal" />
                  <span className="font-body text-sm text-white/80">Built by a practicing K-12 Director of Technology</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>;
};
export default Hero;