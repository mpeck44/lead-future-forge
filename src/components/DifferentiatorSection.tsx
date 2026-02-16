import { Hammer, Briefcase, GitFork, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Hammer,
    title: "Built by a Practitioner, For Practitioners",
    description:
      "Every framework comes from real implementation in actual schools—not consulting theory or academic research.",
  },
  {
    icon: Briefcase,
    title: "Portfolio-Based Learning",
    description:
      "Each course produces deliverables you can use Monday morning: governance frameworks, communication templates, strategic roadmaps.",
  },
  {
    icon: GitFork,
    title: "Flexible Pathways",
    description:
      "Start where you are. Follow the recommended sequence, or jump to what you need most.",
  },
  {
    icon: ShieldCheck,
    title: "Standards-Aligned",
    description: "Aligned with leadership standards from COSN and ISTE.",
  },
];

const DifferentiatorSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
          What Makes This Different
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6 flex gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">
                  {title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {description}
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
