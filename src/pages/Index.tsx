import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroV2 from "@/components/landing/HeroV2";
import ProblemV2 from "@/components/landing/ProblemV2";
import DoorsSection from "@/components/landing/DoorsSection";
import PathwaySection from "@/components/landing/PathwaySection";
import DeliverablesSection from "@/components/landing/DeliverablesSection";
import BioSection from "@/components/landing/BioSection";
import TestimonialsV2 from "@/components/landing/TestimonialsV2";
import PricingWaitlist from "@/components/landing/PricingWaitlist";
import FaqSection from "@/components/landing/FaqSection";
import FooterV2 from "@/components/landing/FooterV2";
import WaitlistModal from "@/components/WaitlistModal";
import { useReveal } from "@/hooks/useReveal";

const Index = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("hero");
  useReveal();

  const openWaitlist = (source: string) => {
    setWaitlistSource(source);
    setWaitlistOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main">
        <HeroV2 onWaitlist={() => openWaitlist("hero")} />
        <ProblemV2 />
        <DoorsSection onAudit={() => openWaitlist("readiness-audit")} />
        <PathwaySection />
        <DeliverablesSection />
        <BioSection />
        <TestimonialsV2 />
        <PricingWaitlist />
        <FaqSection />
      </main>
      <FooterV2 />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} source={waitlistSource} />
    </div>
  );
};

export default Index;
