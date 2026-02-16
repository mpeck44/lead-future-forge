import { ClipboardList, Network, Scale, Target } from "lucide-react";

const outcomes = [
  {
    icon: ClipboardList,
    title: "Strategic Clarity",
    description: "A blueprint you can present to your board.",
  },
  {
    icon: Network,
    title: "Organizational Alignment",
    description: "Communication frameworks for stakeholders.",
  },
  {
    icon: Scale,
    title: "Governance & Equity",
    description: "Checklists and audits to ensure responsible deployment.",
  },
  {
    icon: Target,
    title: "Operational Action",
    description: "90-day launch plan you can immediately use.",
  },
];

const OutcomesSection = () => {
  return (
    <section id="outcomes" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
          What This Program Actually <em>Delivers</em> for You
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {outcomes.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-card-foreground mb-2">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
