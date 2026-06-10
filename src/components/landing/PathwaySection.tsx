import { useEffect, useRef } from "react";

const steps = [
  { num: 1, title: "The Launchpad", tag: "Foundations", body: "A focused orientation. The shared language and frameworks everything else builds on." },
  { num: 2, title: "Command the Tools", tag: "Fluency", body: "Real capability through practice, not theory. Hands on the work, not slides about it." },
  { num: 3, title: "Chart the Course", tag: "Strategy", body: "Governance, vision, and the three-year roadmap your board is asking for." },
  { num: 4, title: "Ship It", tag: "Action", body: "Ninety-day execution: targeted PD, resistance management, and scale-or-stop calls." },
];

const PathwaySection = () => {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("drawn")),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="pathway" className="py-[5.5rem] md:py-[7.5rem] bg-navy text-white/85">
      <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
        <div className="rv text-center max-w-[640px] mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            The pathway
          </span>
          <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] text-white mt-[0.85rem] mb-[0.9rem]">
            Three doors. One connected system.
          </h2>
          <p className="text-white/60 text-[1.06rem]">
            The doors aren't separate products — they're entry points into one sequence that takes you from first tools to a three-year strategic roadmap.
          </p>
        </div>

        <div className="rv max-w-[560px] mx-auto border-dashed-gold rounded-lg px-[1.6rem] py-[1.35rem] text-center">
          <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)] mb-[0.45rem]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            The foresight layer
          </span>
          <h3 className="font-display text-[1.32rem] text-white mb-[0.35rem]">Leaders Make the Future</h3>
          <p className="text-[0.93rem] text-white/60">
            Position your district for the next 3–10 years — not just the next school year.
          </p>
        </div>

        <div className="layer-stem" />

        <div
          ref={railRef}
          className="pathway-rail grid grid-cols-1 md:grid-cols-4 gap-[2.2rem] md:gap-[1.8rem] pl-[2.2rem] md:pl-0 md:pt-[3.2rem]"
        >
          {steps.map((s, i) => (
            <div key={s.num} className={`rv rv-d${Math.min(i + 1, 3)} relative md:pt-0`}>
              <div className="absolute -left-[2.2rem] md:left-auto md:relative md:-mt-[3.2rem] md:mb-4 top-0 w-9 h-9 rounded-full bg-[hsl(217_33%_25%)] border-[1.5px] border-[hsl(46_65%_52%/0.4)] text-[hsl(43_72%_66%)] flex items-center justify-center font-semibold text-sm">
                {s.num}
              </div>
              <h3 className="font-display text-[1.22rem] text-white mb-[0.15rem]">{s.title}</h3>
              <span className="block text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)] mb-2">{s.tag}</span>
              <p className="text-[0.93rem] text-white/60 max-w-[420px]">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="rv mt-[3.4rem] text-center font-display text-[clamp(1.15rem,2vw,1.4rem)] text-white/85">
          Start where you are. <em className="not-italic italic text-[hsl(43_72%_66%)]">Each course recommends the next.</em>
        </p>
      </div>
    </section>
  );
};

export default PathwaySection;
