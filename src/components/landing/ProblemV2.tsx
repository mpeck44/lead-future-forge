const items = [
  {
    n: "01",
    text: "Your teachers are using AI tools you didn't approve. You're improvising the response.",
  },
  {
    n: "02",
    text: "Your board is asking where the district stands on AI. You don't have a plan to point at.",
  },
  {
    n: "03",
    text: "The policy passed. It's months later. Nothing in your buildings has actually changed.",
  },
];

const ProblemV2 = () => (
  <section id="problem" className="py-[5.5rem] md:py-[7.5rem] bg-background">
    <div className="w-[min(1200px,100%-2.5rem)] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-20">
        {/* Left: heading column */}
        <div className="rv max-w-[420px]">
          <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            The situation
          </span>
          <h2 className="font-display font-semibold text-[clamp(1.85rem,3.6vw,2.7rem)] leading-[1.12] tracking-[-0.01em] text-foreground mt-[0.85rem] mb-[1rem]">
            The problem school leaders face
          </h2>
          <p className="font-body text-foreground/60 text-[1rem] leading-relaxed max-w-[34ch]">
            You're being asked to lead on AI before anyone handed you a
            playbook. Sound familiar?
          </p>
        </div>

        {/* Right: numbered list + closing */}
        <div>
          <ul className="list-none">
            {items.map((item, i) => (
              <li
                key={item.n}
                className={`rv grid grid-cols-[auto_1fr] gap-x-6 md:gap-x-8 items-start py-[1.4rem] border-b border-foreground/10 ${
                  i === 0 ? "border-t" : ""
                }`}
              >
                <span className="font-display text-[1.05rem] md:text-[1.1rem] text-[hsl(40_72%_30%)] leading-[1.5] tabular-nums">
                  {item.n}
                </span>
                <p className="font-display text-foreground text-[clamp(1.1rem,1.5vw,1.32rem)] leading-[1.45]">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>

          <p className="rv font-display font-semibold text-[clamp(1.4rem,2.4vw,1.85rem)] leading-[1.3] mt-[2.5rem] max-w-[34ch] md:ml-[3.5rem]">
            You don't need another workshop. You need a{" "}
            <em className="not-italic italic text-[hsl(40_72%_30%)]">system.</em>
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default ProblemV2;
