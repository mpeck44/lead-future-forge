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
    <section id="outcomes" className="py-24 lg:py-32 bg-navy">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-6">
          What This Program Actually <em>Delivers</em>
        </h2>
        <p className="font-body text-lg text-white/50 text-center max-w-2xl mx-auto mb-20">
          Not theory. Not workshops. Tangible artifacts for your district.
        </p>

        <div className="max-w-3xl mx-auto">
          {outcomes.map((item, i) => (
            <div
              key={item.number}
              className={`flex gap-6 sm:gap-10 py-10 ${
                i < outcomes.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <span className="font-display text-3xl sm:text-4xl font-bold text-burnt-orange/60 leading-none pt-1 shrink-0">
                {item.number}
              </span>
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-base text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
