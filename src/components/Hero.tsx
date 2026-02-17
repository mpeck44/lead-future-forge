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
  Wrench } from
"lucide-react";
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

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(221,56%,17%)] via-[hsl(202,38%,20%)] to-[hsl(214,42%,18%)]" />
        <div className="absolute inset-0 hero-dot-grid opacity-22" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,hsl(185,62%,45%,0.24),transparent_45%),radial-gradient(circle_at_88%_75%,hsl(143,63%,47%,0.16),transparent_48%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[hsl(208,24%,72%,0.24)] to-transparent" />

        <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-dark-teal/16 blur-3xl" />
        <div className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full bg-green/12 blur-3xl" />

        


























































































































      </section>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} source="hero-waitlist" />
    </>);

};

export default Hero;