import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const FinalCTA = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="py-20 bg-[hsl(191,40%,94%)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl border border-dark-teal/15 p-10 sm:p-14 shadow-sm">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
              Ready to Lead AI in Your District?
            </h2>
            <p className="font-body text-lg text-navy/65 mb-8">
              Join the K-12 leaders who are moving from reactive to strategic. Start building your AI implementation roadmap today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={scrollToCourses}
                className="font-body font-semibold bg-green hover:bg-green/90 text-white px-8 py-6 text-base group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWaitlistOpen(true)}
                className="font-body font-semibold border-navy text-navy hover:bg-navy/5 px-8 py-6 text-base"
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
