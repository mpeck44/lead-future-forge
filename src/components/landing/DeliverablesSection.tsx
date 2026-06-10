import { ShieldCheck, FlaskConical, Map, MessageSquare } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "AI Governance Framework", body: "Customized to your district's policies, people, and risk tolerance." },
  { icon: FlaskConical, title: "Pilot Program Design", body: "Scoped, staffed, and measured — with success metrics defined before you start." },
  { icon: Map, title: "3-Year AI Strategic Roadmap", body: "The plan your board is asking for — sequenced, defensible, and yours." },
  { icon: MessageSquare, title: "Stakeholder Communication Templates", body: "Board, parents, staff — the messages ready before the questions come." },
];

const DeliverablesSection = () => (
  <section id="deliverables" className="py-[5.5rem] md:py-[7.5rem] bg-background">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          What you'll walk away with
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem] mb-[0.9rem]">
          You don't finish with notes. You finish with artifacts.
        </h2>
        <p className="text-foreground/65 text-[1.06rem]">
          Every module produces something you can put in front of your board, your cabinet, or your staff — this week.
        </p>
      </div>
      <div className="grid gap-[1.3rem] grid-cols-1 sm:grid-cols-2">
        {items.map((it, i) => (
          <div
            key={it.title}
            className={`rv rv-d${Math.min(i + 1, 3)} bg-white border border-foreground/10 rounded-lg p-[1.7rem] shadow-[0_1px_2px_rgba(11,22,38,.05),0_8px_28px_rgba(11,22,38,.08)]`}
          >
            <it.icon className="w-[34px] h-[34px] text-[hsl(40_72%_30%)] mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-[1.18rem] mb-[0.45rem]">{it.title}</h3>
            <p className="text-foreground/65 text-[0.94rem]">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default DeliverablesSection;
