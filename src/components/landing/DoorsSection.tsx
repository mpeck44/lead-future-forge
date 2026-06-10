import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Props {
  onAudit: () => void;
}

const doors = [
  {
    quote: "I'm already doing AI work, but I'm winging it.",
    promise: <>Get organized and capable. <strong className="text-foreground font-semibold">Build real fluency</strong> through practice, not theory.</>,
    route: "Command the Tools",
    slug: "fluency",
  },
  {
    quote: "My board and community want an AI answer, and I need a plan.",
    promise: <>Move from reactive to strategic. <strong className="text-foreground font-semibold">Build governance, vision, and a 3-year roadmap.</strong></>,
    route: "Chart the Course",
    slug: "strategy",
  },
  {
    quote: "We have a framework, but nothing is actually moving.",
    promise: <><strong className="text-foreground font-semibold">Make it ship.</strong> 90-day execution, PD that targets real gaps, resistance management, and scale/stop decisions.</>,
    route: "Ship It",
    slug: "action",
  },
];

const DoorsSection = ({ onAudit }: Props) => {
  const navigate = useNavigate();
  return (
    <section id="doors" className="py-[5.5rem] md:py-[7.5rem] bg-white">
      <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
        <div className="rv text-center max-w-[640px] mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            Start here
          </span>
          <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] tracking-[-0.01em] mt-[0.85rem] mb-[0.9rem]">
            Which one is you?
          </h2>
          <p className="text-foreground/65 text-[1.06rem]">
            Three doors. Each one opens onto the same connected pathway — at the point that matches the problem on your desk right now.
          </p>
        </div>

        <div className="grid gap-[1.4rem] md:gap-[1.6rem] grid-cols-1 md:grid-cols-3">
          {doors.map((d, i) => (
            <button
              key={d.slug}
              onClick={() => navigate(`/courses/${d.slug}`)}
              className={`door-card rv rv-d${Math.min(i + 1, 3)} text-left flex flex-col bg-background border border-foreground/10 rounded-lg p-[1.7rem] pt-[2.1rem] shadow-[0_1px_2px_rgba(11,22,38,.05),0_8px_28px_rgba(11,22,38,.08)] hover:shadow-[0_2px_4px_rgba(11,22,38,.06),0_18px_44px_rgba(11,22,38,.16)] hover:border-[hsl(46_65%_52%/0.55)] hover:-translate-y-[5px] transition-all duration-200`}
            >
              <span className="font-display text-[2.6rem] leading-none text-gold mb-[0.4rem]">"</span>
              <h3 className="font-display font-semibold text-[clamp(1.22rem,1.7vw,1.42rem)] leading-[1.3] mb-4 text-foreground">
                {d.quote}
              </h3>
              <p className="text-foreground/65 text-[0.97rem] flex-1 mb-[1.7rem]">{d.promise}</p>
              <div className="flex items-baseline gap-[0.55rem] flex-wrap border-t border-foreground/10 pt-[1.1rem]">
                <small className="text-[0.68rem] font-semibold tracking-[0.13em] uppercase text-foreground/65">Routes to</small>
                <span className="font-semibold text-[hsl(40_72%_30%)] text-[0.98rem] inline-flex items-center gap-[0.4rem]">
                  {d.route} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="rv mt-[2.6rem] text-center text-foreground/65 text-[0.97rem]">
          Not sure where you are?{" "}
          <button onClick={onAudit} className="text-[hsl(40_72%_30%)] font-semibold underline underline-offset-4">
            Take the 5-minute AI Readiness &amp; Equity Audit
          </button>{" "}
          — it recommends the right door.
          <span className="block text-[0.83rem] mt-[0.3rem] text-foreground/65">
            Launching with our beta. Waitlist members get it first.
          </span>
        </p>
      </div>
    </section>
  );
};

export default DoorsSection;
