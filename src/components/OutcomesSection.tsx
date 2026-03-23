const outcomes = [
  {
    number: "01",
    title: "Strategic Clarity",
    description:
      "Walk away with a blueprint you can present to your board — not a theoretical framework, but a concrete plan with timelines, owners, and success metrics.",
  },
  {
    number: "02",
    title: "Organizational Alignment",
    description:
      "Communication frameworks that bring stakeholders — from teachers to parents to board members — into alignment around your AI vision.",
  },
  {
    number: "03",
    title: "Governance & Equity",
    description:
      "Checklists, audits, and decision-rights matrices to ensure responsible, equitable AI deployment across your district.",
  },
  {
    number: "04",
    title: "Operational Action",
    description:
      "A 90-day launch plan with milestones, pilot playbooks, and an implementation dashboard you can put to work immediately.",
  },
];

const OutcomesSection = () => {
  return (
    <section id="outcomes" className="relative py-[120px] bg-navy overflow-hidden">
      <div className="absolute inset-0 forge-texture opacity-10" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white text-center mb-4 leading-tight">
          What This Program Actually <em>Delivers</em>
        </h2>
        <p className="font-body text-xl sm:text-2xl text-white/50 text-center max-w-2xl mx-auto mb-24 italic">
          Not theory. Not workshops. Tangible artifacts for your district.
        </p>

        <div className="max-w-4xl mx-auto">
          {outcomes.map((item, i) => (
            <div key={item.number}>
              <div className="flex items-start gap-8 sm:gap-12">
                {/* Number circle with orange glow */}
                <div
                  className="shrink-0 w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-burnt-orange flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 30px hsl(38 93% 44% / 0.35), 0 0 60px hsl(38 93% 44% / 0.15)",
                  }}
                >
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white leading-none">
                    {item.number}
                  </span>
                </div>

                <div className="pt-2">
                  <h3 className="font-display text-[28px] sm:text-[32px] font-bold text-white mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-body text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                </div>
              </div>

              {i < outcomes.length - 1 && (
                <div className="my-[45px] sm:my-[50px] h-[3px] bg-burnt-orange/30 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
