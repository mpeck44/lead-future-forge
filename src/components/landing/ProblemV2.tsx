const lines = [
  {
    text: "Your teachers are using AI tools you didn't approve. You're improvising the response.",
    size: "text-[clamp(1.12rem,2vw,1.3rem)]",
  },
  {
    text: "Your board is asking where the district stands on AI. You don't have a plan to point at.",
    size: "text-[clamp(1.22rem,2.3vw,1.48rem)]",
  },
  {
    text: "The policy passed. It's months later. Nothing in your buildings has actually changed.",
    size: "text-[clamp(1.32rem,2.6vw,1.66rem)]",
  },
];

const ProblemV2 = () => (
  <section id="problem" className="py-[5.5rem] md:py-[7.5rem] bg-background">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[640px] mb-12">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          The situation
        </span>
        <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] tracking-[-0.01em] text-foreground mt-[0.85rem] mb-[0.9rem]">
          The problem school leaders face
        </h2>
      </div>

      <ul className="list-none max-w-[760px] mb-[3.2rem]">
        {lines.map((l, i) => (
          <li
            key={i}
            className={`rv flex gap-[1.15rem] items-start py-[1.35rem] border-b border-foreground/10 ${i === 0 ? "border-t" : ""}`}
          >
            <span className="flex-none w-[26px] h-[2px] bg-gold mt-[0.95em]" />
            <p className={`font-display text-foreground leading-[1.35] ${l.size}`}>{l.text}</p>
          </li>
        ))}
      </ul>

      <p className="rv font-display font-semibold text-[clamp(1.55rem,3.4vw,2.25rem)] leading-[1.25] max-w-[680px]">
        You don't need another workshop. You need a <em className="not-italic italic text-[hsl(40_72%_30%)]">system</em>.
      </p>
    </div>
  </section>
);

export default ProblemV2;
