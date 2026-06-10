const quotes = [
  {
    body: "The experience helped me gain a fuller understanding of the complexities schools face in developing successful AI implementation initiatives.",
    cite: "Workshop participant, in-person series",
  },
  {
    body: "Wow! This Bootcamp went above anything I would have expected.",
    cite: "Workshop participant, in-person series",
  },
];

const TestimonialsV2 = () => (
  <section id="proof" className="py-[5.5rem] md:py-[7.5rem] bg-background">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          From the rooms where this was built
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] mt-[0.85rem]">
          What leaders say after the workshops
        </h2>
      </div>
      <div className="grid gap-[1.4rem] grid-cols-1 md:grid-cols-2">
        {quotes.map((q, i) => (
          <div
            key={i}
            className={`rv rv-d${i + 1} bg-white border border-foreground/10 rounded-lg p-[1.8rem] flex flex-col shadow-[0_1px_2px_rgba(11,22,38,.05),0_8px_28px_rgba(11,22,38,.08)]`}
          >
            <span className="font-display text-[2.2rem] leading-none text-gold mb-[0.4rem]">"</span>
            <blockquote className="font-display text-[1.18rem] leading-[1.45] mb-[1.4rem] flex-1 text-foreground">
              {q.body}
            </blockquote>
            <cite className="not-italic text-[0.84rem] text-foreground/65 border-t border-foreground/10 pt-4">
              {q.cite}
            </cite>
          </div>
        ))}
      </div>
      <p className="mt-[1.6rem] text-[0.84rem] text-foreground/65 text-center">
        From our in-person workshop series. Online-cohort testimonials coming with our first beta.
      </p>
    </div>
  </section>
);

export default TestimonialsV2;
