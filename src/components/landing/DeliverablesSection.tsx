import { ShieldCheck, FlaskConical, MessageSquareQuote } from "lucide-react";

const supporting = [
  {
    icon: ShieldCheck,
    title: "AI Governance Framework",
    body: "Customized to your district's policies, people, and risk tolerance.",
  },
  {
    icon: FlaskConical,
    title: "Pilot Program Design",
    body: "Scoped, staffed, and measured — success metrics defined before you start.",
  },
  {
    icon: MessageSquareQuote,
    title: "Stakeholder Comms Templates",
    body: "Board, parents, staff — the messages ready before the questions come.",
  },
];

const years = [
  { label: "Y1", width: "78%", caption: "Foundations & policy" },
  { label: "Y2", width: "58%", caption: "Scaled pilots" },
  { label: "Y3", width: "38%", caption: "District-wide" },
];

const DeliverablesSection = () => (
  <section id="deliverables" className="py-[5.5rem] md:py-[7.5rem] bg-background">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      {/* Header */}
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          What you'll walk away with
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem] mb-[0.9rem]">
          You don't finish with notes. You finish with{" "}
          <em className="italic text-gold not-italic font-display" style={{ fontStyle: "italic" }}>
            artifacts.
          </em>
        </h2>
        <p className="text-foreground/65 text-[1.06rem]">
          Every module produces something you can put in front of your board, your cabinet, or your staff — this week.
        </p>
      </div>

      {/* Two-column: featured card + supporting list */}
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] items-start">
        {/* Featured deliverable card */}
        <div className="rv bg-white border border-foreground/10 rounded-xl p-7 shadow-[0_1px_2px_rgba(11,22,38,.05),0_10px_30px_rgba(11,22,38,.08)]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-[hsl(40_72%_30%)] mb-2">
                Featured deliverable
              </div>
              <h3 className="font-display text-[1.55rem] leading-[1.15]">
                3-Year AI Strategic Roadmap
              </h3>
            </div>
            <span className="shrink-0 inline-flex items-center rounded-full bg-gold/15 text-[hsl(40_72%_30%)] text-[0.72rem] font-semibold px-3 py-1">
              Board-ready
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {years.map((y) => (
              <div key={y.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                <span className="font-display italic text-gold text-[1.1rem] w-6">{y.label}</span>
                <div className="h-[10px] rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gold" style={{ width: y.width }} />
                </div>
                <span className="text-foreground/60 text-[0.82rem] text-right max-w-[120px] leading-tight">
                  {y.caption}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/10 pt-4">
            <p className="text-foreground/60 text-[0.88rem] leading-relaxed">
              Sequenced, defensible, and yours — generated from your district's real policies, people, and risk tolerance.
            </p>
          </div>
        </div>

        {/* Supporting deliverables */}
        <div className="rv rv-d1">
          {supporting.map((it, i) => (
            <div
              key={it.title}
              className={`grid grid-cols-[auto_1fr] gap-4 py-5 ${
                i !== supporting.length - 1 ? "border-b border-foreground/10" : ""
              } ${i === 0 ? "pt-0" : ""}`}
            >
              <div className="w-10 h-10 rounded-md bg-deep-navy text-gold flex items-center justify-center shrink-0">
                <it.icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="font-display text-[1.08rem] mb-1">{it.title}</h4>
                <p className="text-foreground/65 text-[0.94rem] leading-relaxed">{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial band */}
      <div className="rv rv-d2 mt-12 bg-deep-navy text-background rounded-xl px-8 md:px-12 py-9 md:py-11">
        <p className="font-display italic text-[clamp(1.05rem,1.8vw,1.35rem)] leading-[1.45] text-background/95 max-w-[820px]">
          "I walked into my board meeting with a roadmap instead of a shrug. That's the difference."
        </p>
        <p className="mt-4 text-[0.95rem]">
          <span className="text-gold font-semibold">Dr. Maria Ellison</span>
          <span className="text-background/65"> — Superintendent, suburban district (4,800 students)</span>
        </p>
      </div>
    </div>
  </section>
);

export default DeliverablesSection;
