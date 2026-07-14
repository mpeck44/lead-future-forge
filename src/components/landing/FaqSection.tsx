import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How is this different from ISTE or CoSN AI training?",
    a: [
      "ISTE and CoSN give you standards and awareness — and this program is aligned to them. What they don't give you is a system. Every module here ends in an artifact built for your district: a governance framework, a pilot design, a roadmap, a board communication. You leave with a portfolio, not a binder of slides.",
      "It's also built by someone doing this job right now, in a real district — so the scenarios are the decisions actually sitting on your desk, not hypotheticals.",
    ],
  },
  {
    q: "Can I get PD credit for this?",
    a: ["Every course includes a certificate of completion with documented hours. Whether those hours count toward your state's continuing-education requirements depends on your state and district — most leaders submit the certificate through their local approval process. If your district or IU needs something formal, ask us about institutional options."],
  },
  {
    q: "How much time does it take?",
    a: ["Each course runs six to eight hours of focused work, broken into short modules designed to fit between obligations. It's self-paced — built to be finished in two to three weeks at a module every few days, not crammed into a Saturday."],
  },
  {
    q: "Is this only for tech directors, or can principals take it?",
    a: ["It's built for superintendents, assistant superintendents, principals, curriculum and instructional directors, and technology directors. Resources inside each course are segmented by role — a principal and a tech director working through the same module each leave with deliverables for their own seat."],
  },
  {
    q: "What if I'm completely new to AI?",
    a: ["Start with Foundations — a short orientation that establishes the shared language everything else builds on. No technical background is required anywhere in the pathway. This is leadership development, not technical training."],
  },
];

const FaqSection = () => (
  <section id="faq" className="py-[5.5rem] md:py-[7.5rem] bg-white">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Questions leaders ask
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem]">
          Before you ask your business manager
        </h2>
      </div>

      <Accordion type="single" collapsible className="max-w-[760px]">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-foreground/10 first:border-t">
            <AccordionTrigger className="font-display font-semibold text-[1.13rem] leading-[1.35] py-[1.35rem] hover:no-underline text-foreground">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/65 max-w-[660px] pb-6">
              {f.a.map((p, j) => (
                <p key={j} className={j > 0 ? "mt-[0.7rem]" : ""}>{p}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
