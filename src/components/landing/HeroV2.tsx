import { Button } from "@/components/ui/button";
import HeroAppPreview from "./HeroAppPreview";

interface Props {
  onWaitlist: () => void;
}

const HeroV2 = ({ onWaitlist }: Props) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const districts = [
    "Pen Argyl ASD",
    "Chester County IU",
    "Bethlehem Area",
    "Easton ASD",
  ];

  return (
    <section className="relative overflow-hidden bg-navy text-white/85 pt-[7.5rem] md:pt-[8.5rem] hero-horizon-glow">
      <div className="relative w-[min(1200px,100%-2.5rem)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center pb-16 lg:pb-20">
          {/* Left: text */}
          <div className="relative">
            <div className="w-24 h-px bg-gold/60 mb-8" />
            <h1 className="rv rv-d1 font-display font-semibold leading-[1.05] tracking-[-0.015em] text-white mb-6 text-[clamp(2.5rem,5.6vw,4.5rem)]">
              <span className="block">Stop reacting to AI.</span>
              <span className="block">
                Start{" "}
                <em className="not-italic md:italic text-gold font-semibold">
                  leading through it.
                </em>
              </span>
            </h1>
            <p className="rv rv-d2 text-[clamp(1.05rem,1.5vw,1.18rem)] text-white/60 max-w-[42ch] mb-9 font-body leading-relaxed">
              K-12 AI leadership development for principals, superintendents,
              and school administrators — build your district AI policy,
              strategy, and 3-year roadmap with board-ready deliverables
              you'll use Monday morning.
            </p>

            <div className="rv rv-d3 flex flex-wrap gap-3 mb-10">
              <Button
                onClick={() => scrollTo("doors")}
                className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold px-7 py-6 text-base rounded-[10px]"
              >
                Explore the courses →
              </Button>
              <Button
                variant="outline"
                onClick={onWaitlist}
                className="border-[1.5px] border-white/20 bg-transparent text-white hover:bg-transparent hover:text-gold hover:border-gold font-body font-semibold px-7 py-6 text-base rounded-[10px]"
              >
                Take the 5-min readiness audit
              </Button>
            </div>

            {/* Stats */}
            <div className="border-t border-white/10 pt-6">
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dt className="sr-only">District leaders trained</dt>
                  <dd className="font-display text-2xl font-bold text-white leading-none">
                    50<span className="text-gold">+</span>
                  </dd>
                  <div className="text-[0.78rem] text-white/50 font-body mt-1.5">
                    district leaders trained
                  </div>
                </div>
                <div className="border-l border-white/10 pl-10">
                  <dt className="sr-only">Leadership courses</dt>
                  <dd className="font-display text-2xl font-bold text-white leading-none">
                    4
                  </dd>
                  <div className="text-[0.78rem] text-white/50 font-body mt-1.5">
                    leadership courses
                  </div>
                </div>
                <div className="border-l border-white/10 pl-10">
                  <dt className="sr-only">Standards alignment</dt>
                  <dd className="font-display text-2xl font-bold text-white leading-none">
                    ISTE · CoSN
                  </dd>
                  <div className="text-[0.78rem] text-white/50 font-body mt-1.5">
                    aligned
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Right: app preview */}
          <div className="rv rv-d2 relative lg:pl-4">
            <HeroAppPreview />
          </div>
        </div>

        {/* Districts strip */}
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          <span className="text-[0.72rem] uppercase tracking-[0.16em] text-white/40 font-body whitespace-nowrap">
            Trusted in districts across PA & beyond
          </span>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 list-none">
            {districts.map((d) => (
              <li
                key={d}
                className="font-display text-base lg:text-lg text-white/55"
              >
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroV2;
