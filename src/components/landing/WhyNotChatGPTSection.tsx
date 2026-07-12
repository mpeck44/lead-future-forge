const WhyNotChatGPTSection = () => (
  <section
    id="why-not-chatgpt"
    className="relative py-[5.5rem] md:py-[7.5rem] bg-navy text-white/85 overflow-hidden"
  >
    <div className="absolute inset-0 hero-dot-grid opacity-20 pointer-events-none" />
    <div className="relative z-10 w-[min(960px,100%-2.5rem)] mx-auto">
      <div className="rv max-w-[720px]">
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-gold">
          <span className="w-2 h-2 rounded-full bg-gold" />
          The objection everyone thinks but doesn't say
        </span>
        <h2 className="font-display font-semibold text-[clamp(2rem,4.4vw,2.9rem)] leading-[1.1] tracking-[-0.01em] text-white mt-[0.9rem] mb-[1.6rem]">
          "Why not just ask{" "}
          <em className="not-italic italic text-gold">ChatGPT?</em>"
        </h2>
      </div>

      <div className="rv rv-d1 max-w-[680px] space-y-[1.15rem] font-body text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.65] text-white/80">
        <p>
          AI can draft your policy in an afternoon. It can't tell you which
          clause fails in a board meeting, which stakeholder quietly kills
          your pilot, or what breaks in month three.
        </p>
        <p>
          The hard part was never generating answers. It's knowing which
          questions to ask.
        </p>
        <p className="font-display italic text-white text-[clamp(1.2rem,1.9vw,1.5rem)] leading-[1.4] border-l-[3px] border-gold pl-[1.15rem] mt-[1.6rem]">
          That's what I teach.
        </p>
      </div>

      <div className="rv rv-d2 mt-[2.2rem] flex items-center gap-4">
        <span className="w-10 h-px bg-gold/70" />
        <span className="font-body text-[0.82rem] tracking-[0.12em] uppercase text-white/55">
          Mike Peck &middot; K-12 Director of Technology
        </span>
      </div>
    </div>
  </section>
);

export default WhyNotChatGPTSection;
