import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroV2 from "@/components/landing/HeroV2";
import ProblemV2 from "@/components/landing/ProblemV2";
import WhyNotChatGPTSection from "@/components/landing/WhyNotChatGPTSection";
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
      <Helmet>
        <title>K-12 AI Leadership: District AI Strategy, Policy & PD | The Leadership Forge</title>
        <meta name="description" content="AI for principals, superintendents, and school administrators. Build a school district AI policy, district AI strategy, and 3-year roadmap — from a practicing K-12 Director of Technology." />
        <link rel="canonical" href="https://edleaderforge.com/" />
        <meta property="og:title" content="K-12 AI Leadership — District AI Strategy & Policy | The Leadership Forge" />
        <meta property="og:description" content="AI for principals, superintendents, and school administrators. Build a school district AI policy, district AI strategy, and 3-year roadmap you'll use Monday morning." />
        <meta property="og:url" content="https://edleaderforge.com/" />
        <meta property="og:image" content="https://edleaderforge.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Mike Peck",
          "jobTitle": "K-12 Director of Technology",
          "description": "Practicing K-12 Director of Technology and founder of The Leadership Forge. Builds AI professional development from the decisions actually sitting on a district leader's desk.",
          "worksFor": {
            "@type": "Organization",
            "name": "The Leadership Forge",
            "url": "https://edleaderforge.com/"
          },
          "knowsAbout": [
            "K-12 educational technology",
            "AI in education",
            "School district AI strategy",
            "AI governance for schools",
            "Educational leadership"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How is this different from ISTE or CoSN AI training?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "ISTE and CoSN give you standards and awareness — and this program is aligned to them. What they don't give you is a system. Every module ends in an artifact built for your district: a governance framework, a pilot design, a roadmap, a board communication. You leave with a portfolio, not a binder of slides. It's also built by someone doing this job right now, in a real district."
              }
            },
            {
              "@type": "Question",
              "name": "Can I get PD credit for this?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Every course includes a certificate of completion with documented hours. Whether those hours count toward your state's continuing-education requirements depends on your state and district — most leaders submit the certificate through their local approval process."
              }
            },
            {
              "@type": "Question",
              "name": "How much time does it take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Each course runs four to five hours of focused work, broken into short modules designed to fit between obligations. It's self-paced — built to be finished in two to three weeks at a module every few days."
              }
            },
            {
              "@type": "Question",
              "name": "Is this only for tech directors, or can principals take it?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "It's built for superintendents, assistant superintendents, principals, curriculum and instructional directors, and technology directors. Resources inside each course are segmented by role so each leader leaves with deliverables for their own seat."
              }
            },
            {
              "@type": "Question",
              "name": "What if I'm completely new to AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Start with The Launchpad — a short orientation that establishes the shared language everything else builds on. No technical background is required anywhere in the pathway. This is leadership development, not technical training."
              }
            }
          ]
        })}</script>
      </Helmet>
      <Header />
      <main id="main">
        <HeroV2 onWaitlist={() => openWaitlist("hero")} />
        <ProblemV2 />
        <WhyNotChatGPTSection />
        <BioSection />
        <DoorsSection onAudit={() => openWaitlist("readiness-audit")} />
        <PathwaySection />
        <DeliverablesSection />
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
