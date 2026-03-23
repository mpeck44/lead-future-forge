const features = [
  {
    number: "01",
    title: "Built by a Practitioner, For Practitioners",
    description:
      "Every framework comes from real implementation in actual schools — not consulting theory or academic research.",
  },
  {
    number: "02",
    title: "Portfolio-Based Learning",
    description:
      "Each course produces deliverables you can use Monday morning: governance frameworks, communication templates, strategic roadmaps.",
  },
  {
    number: "03",
    title: "Flexible Pathways",
    description:
      "Start where you are. Follow the recommended sequence, or jump to what you need most.",
  },
  {
    number: "04",
    title: "Standards-Aligned",
    description:
      "Aligned with leadership standards from COSN and ISTE — ensuring your work meets professional benchmarks.",
  },
];

const DifferentiatorSection = () => {
  return (
    <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-center mb-20">
          What Makes This Different
        </h2>

        <div className="max-w-3xl mx-auto">
          {features.map((item, i) => (
            <div
              key={item.number}
              className={`flex gap-6 sm:gap-10 py-10 ${
                i < features.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="w-1 shrink-0 rounded-full bg-burnt-orange/40" />
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
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

export default DifferentiatorSection;
