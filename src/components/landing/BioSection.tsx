import mikeHeadshot from "@/assets/mike-peck-headshot.jpg.asset.json";

const proofPoints = [
  {
    label: "Teaching",
    text: "Currently teaching emerging-technology courses to doctoral students at Delaware Valley University.",
  },
  {
    label: "Speaking",
    text: "Sought out for regional panels and keynotes on AI leadership in K-12.",
  },
  {
    label: "Convening",
    text: "Founded a K-12 AI leadership advisory group and organizing in-person events for district leaders.",
  },
  {
    label: "Building",
    text: "Designs and runs custom AI systems inside a working district — not theory, current practice.",
  },
];

const BioSection = () => (
  <section id="bio" className="py-[5.5rem] md:py-[7.5rem] bg-white">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[720px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Why people are already coming to me
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem]">
          Built by a practitioner other leaders are{" "}
          <em className="not-italic italic text-[hsl(40_72%_30%)]">
            already seeking out.
          </em>
        </h2>
      </div>

      <div className="grid gap-[2.6rem] md:gap-16 grid-cols-1 md:grid-cols-[340px_1fr] items-start">
        <div className="rv aspect-[4/5] rounded-lg overflow-hidden border border-foreground/10 max-w-[340px]">
          <img
            src={mikeHeadshot.url}
            alt="Mike Peck, K-12 Director of Technology and founder of The Leadership Forge"
            className="w-full h-full object-cover grayscale"
            width={340}
            height={425}
          />
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.4rem] mb-[2rem]">
            {proofPoints.map((p, i) => (
              <div
                key={p.label}
                className={`rv rv-d${i} border-l-[3px] border-gold pl-[1.1rem]`}
              >
                <span className="block text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mb-[0.4rem]">
                  {p.label}
                </span>
                <p className="font-body text-foreground/75 text-[0.98rem] leading-[1.55]">
                  {p.text}
                </p>
              </div>
            ))}
          </div>

          <p className="rv rv-d2 font-body text-foreground/60 text-[0.95rem] leading-relaxed max-w-[560px] mb-[1.6rem]">
            Built by a practicing K-12 Director of Technology in Pennsylvania.
            I lead AI integration in a working district every day — the
            policies, the pilots, the board questions, the staff concerns.
          </p>

          <p className="rv rv-d3 font-display italic font-medium text-[clamp(1.3rem,2.4vw,1.7rem)] leading-[1.35] text-foreground border-l-[3px] border-gold pl-[1.3rem] max-w-[560px]">
            "I build practical tools educational leaders can put into practice
            today."
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default BioSection;
