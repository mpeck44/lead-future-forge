import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const FinalCTA = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="relative py-[140px] bg-navy overflow-hidden">
        <div className="absolute inset-0 forge-texture opacity-10" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white mb-6 leading-tight">
              Ready to Lead AI in Your District?
            </h2>
            <p className="font-body text-lg sm:text-xl text-white/50 mb-12 leading-relaxed">
              Join the K-12 leaders who are moving from reactive to strategic.
              Start building your AI implementation roadmap today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={scrollToCourses}
                className="gold-hover font-body font-semibold bg-burnt-orange text-navy px-12 py-8 text-[18px] rounded-lg group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWaitlistOpen(true)}
                className="font-body font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/60 px-10 py-8 text-[18px] rounded-lg"
              >
                Join the Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} source="final-cta" />
    </>
  );
};

export default FinalCTA;
