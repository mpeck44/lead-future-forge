const testimonials = [
  {
    quote:
      "This program gave me the confidence and framework to present an AI strategy to our board — and they approved it unanimously.",
    name: "Dr. Sarah Mitchell",
    role: "Superintendent, Greenfield USD",
    initials: "SM",
  },
  {
    quote:
      "I've attended dozens of AI workshops. This is the first one that produced something I could actually use the next Monday morning.",
    name: "James Ortega",
    role: "Director of Technology, Lincoln ISD",
    initials: "JO",
  },
  {
    quote:
      "The governance templates alone saved our team weeks of work. Everything is practical, standards-aligned, and ready to deploy.",
    name: "Maria Chen",
    role: "Assistant Superintendent, Oakridge Schools",
    initials: "MC",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-center mb-6">
          What Our Leaders Say
        </h2>
        <p className="font-body text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-20">
          Hear from K-12 leaders who have transformed their AI strategy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-card rounded-xl border border-border p-8 flex flex-col"
            >
              {/* Large quote mark */}
              <span className="absolute top-4 right-6 font-display text-[5rem] leading-none text-burnt-orange/10 select-none">
                "
              </span>

              <p className="font-body text-foreground/85 text-base leading-relaxed mb-8 flex-1 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burnt-orange/15 flex items-center justify-center">
                  <span className="font-body text-sm font-bold text-burnt-orange">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">
                    {t.name}
                  </p>
                  <p className="font-body text-muted-foreground text-xs">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
