import { Hammer, Briefcase, Route, Award } from "lucide-react";

const features = [
  {
    icon: Hammer,
    title: "Built by a Practitioner, For Practitioners",
    description:
      "Every framework comes from real implementation in actual schools — not consulting theory or academic research.",
  },
  {
    icon: Briefcase,
    title: "Portfolio-Based Learning",
    description:
      "Each course produces deliverables you can use Monday morning: governance frameworks, communication templates, strategic roadmaps.",
  },
  {
    icon: Route,
    title: "Flexible Pathways",
    description:
      "Start where you are. Follow the recommended sequence, or jump to what you need most.",
  },
  {
    icon: Award,
    title: "Standards-Aligned",
    description:
      "Aligned with leadership standards from COSN and ISTE — ensuring your work meets professional benchmarks.",
  },
];

const DifferentiatorSection = () => {
  return (
    <section id="about" className="relative py-[120px] bg-navy overflow-hidden">
      <div className="absolute inset-0 forge-texture opacity-10" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white mb-24">
          What Makes This Different
        </h2>

        <div className="max-w-4xl">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={i < features.length - 1 ? "mb-[70px]" : ""}
              >
                <div className="flex gap-8">
                  {/* Thick burnt orange vertical bar */}
                  <div className="w-[6px] shrink-0 rounded-full bg-burnt-orange" />

                  <div>
                    <Icon className="text-burnt-orange mb-5" size={48} strokeWidth={1.5} />
                    <h3 className="font-display text-[28px] sm:text-[32px] font-bold text-white mb-3 leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-body text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorSection;
