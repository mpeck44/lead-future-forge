import { Button } from "@/components/ui/button";

interface Props {
  onWaitlist: () => void;
}

const HeroV2 = ({ onWaitlist }: Props) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-navy text-white/85 pt-[9.5rem] md:pt-[11rem] hero-horizon-glow">
      <div className="relative w-[min(1120px,100%-2.5rem)] mx-auto">
        <div className="relative text-center max-w-[880px] mx-auto">
          <div className="rv inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-[hsl(43_72%_66%)] border border-[hsl(46_65%_52%/0.38)] rounded-full px-[1.05rem] py-[0.45rem] mb-[1.9rem]">
            For K-12 superintendents, principals, and district leaders
          </div>
          <h1 className="rv rv-d1 font-display font-semibold leading-[1.12] tracking-[-0.01em] text-white mb-[1.3rem] text-[clamp(2.45rem,6.4vw,4.3rem)]">
            <span className="block">Stop Reacting to AI.</span>
            <span className="block">Start <em className="not-italic md:italic text-gold">Leading Through It.</em></span>
          </h1>
          <p className="rv rv-d2 text-[clamp(1.05rem,1.6vw,1.22rem)] text-white/60 max-w-[620px] mx-auto mb-[2.3rem]">
            The only professional-development system that takes school leaders from AI-curious to AI-strategic — with real deliverables you'll use Monday morning.
          </p>
          <div className="rv rv-d3 flex flex-wrap gap-[0.9rem] justify-center mb-[4.5rem]">
            <Button
              onClick={() => scrollTo("doors")}
              className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold px-[1.6rem] py-[1.6rem] text-base rounded-[10px]"
            >
              Which one is you? ↓
            </Button>
            <Button
              variant="outline"
              onClick={onWaitlist}
              className="border-[1.5px] border-white/15 bg-transparent text-white/85 hover:bg-transparent hover:text-gold hover:border-gold font-body font-semibold px-[1.6rem] py-[1.6rem] text-base rounded-[10px]"
            >
              Join the waitlist
            </Button>
          </div>
        </div>

        <div className="relative border-t border-white/15 py-[1.4rem] md:py-[1.6rem]">
          <ul className="flex flex-wrap justify-center gap-y-[0.4rem] gap-x-[2.4rem] text-[0.85rem] text-white/60 list-none">
            {[
              "Built by a practicing K-12 Director of Technology",
              "ISTE & CoSN aligned",
              "Portfolio-based, not lecture-based",
            ].map((t) => (
              <li key={t} className="flex items-center gap-[0.55rem]">
                <span className="w-[5px] h-[5px] rounded-full bg-gold inline-block" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroV2;
