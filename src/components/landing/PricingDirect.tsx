import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PricingDirect = () => {
  return (
    <section id="pricing" className="py-[5.5rem] md:py-[7.5rem] bg-navy text-white/85 text-center">
      <div className="w-[min(820px,100%-2.5rem)] mx-auto">
        <span className="rv inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Pricing
        </span>
        <h2 className="rv font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] text-white mt-[0.85rem]">
          One price per course. No tiers, no upsells.
        </h2>

        <div className="rv font-display font-semibold text-white leading-none mt-[1.1rem] mb-[0.3rem] text-[clamp(3.4rem,8vw,5rem)]">
          <sup className="text-[0.38em] -top-[1.1em] relative text-[hsl(43_72%_66%)]">$</sup>79
        </div>
        <p className="text-white/60 text-base mb-[0.9rem]">per course</p>
        <div className="inline-block text-[0.92rem] text-[hsl(43_72%_66%)] border border-[hsl(46_65%_52%/0.4)] rounded-full px-[1.05rem] py-[0.4rem] mb-[2.8rem]">
          Less than a single ISTE conference registration.
        </div>

        <div className="rv max-w-[520px] mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold px-7 py-6 text-base rounded-[10px]"
          >
            <Link to="/courses#bundle">Get the bundle</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[1.5px] border-white/20 bg-transparent text-white hover:bg-transparent hover:text-gold hover:border-gold font-body font-semibold px-7 py-6 text-base rounded-[10px]"
          >
            <Link to="/courses">See courses and pricing</Link>
          </Button>
        </div>

        <p className="mt-[1.4rem] text-[0.86rem] text-white/60">
          Institutional / team pricing available. Questions?{" "}
          <a href="mailto:contact@peckeducation.com" className="text-[hsl(43_72%_66%)] hover:underline">
            contact@peckeducation.com
          </a>
        </p>

        <div className="rv max-w-[640px] mx-auto mt-[3.2rem] border-dashed-gold rounded-lg px-[1.5rem] py-[1.3rem] text-left">
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)] mb-[0.5rem]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            The advanced track
          </span>
          <h3 className="font-display text-white text-[1.15rem] leading-[1.3] mb-[0.4rem]">
            After the courses: Leaders Make the Future
          </h3>
          <p className="text-white/70 text-[0.93rem] leading-[1.55] mb-[0.9rem]">
            The advanced track — ten leadership capacities built for the next decade, not the next quarter.
          </p>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/45 border border-white/15 rounded-[6px] px-[0.9rem] py-[0.45rem] cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingDirect;
