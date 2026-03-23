const testimonials = [
  {
    quote:
      "This program gave me the confidence and framework to present an AI strategy to our board — and they approved it unanimously.",
    name: "Dr. Sarah Mitchell",
    title: "Superintendent",
    district: "Greenfield USD",
    initials: "SM",
  },
  {
    quote:
      "I've attended dozens of AI workshops. This is the first one that produced something I could actually use the next Monday morning.",
    name: "James Ortega",
    title: "Director of Technology",
    district: "Lincoln ISD",
    initials: "JO",
  },
  {
    quote:
      "The governance templates alone saved our team weeks of work. Everything is practical, standards-aligned, and ready to deploy.",
    name: "Maria Chen",
    title: "Assistant Superintendent",
    district: "Oakridge Schools",
    initials: "MC",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-[120px] bg-navy overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 forge-texture opacity-10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-[48px] font-bold text-white text-center mb-24 leading-tight">
          What Our Leaders Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-white/[0.04] backdrop-blur-sm rounded-lg border border-white/10 p-10 flex flex-col items-center text-center"
            >
              {/* Large orange quote mark */}
              <span className="font-display text-[48px] leading-none text-burnt-orange mb-4 select-none">
                "
              </span>

              <p className="font-body text-white/90 text-xl sm:text-2xl leading-relaxed mb-10 flex-1 italic">
                {t.quote}
              </p>

              {/* Avatar placeholder */}
              <div
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full bg-burnt-orange/20 border-2 border-burnt-orange/30 flex items-center justify-center mb-5"
                style={{
                  boxShadow: "0 0 20px hsl(38 93% 44% / 0.15)",
                }}
              >
                <span className="font-display text-2xl sm:text-3xl font-bold text-burnt-orange">
                  {t.initials}
                </span>
              </div>

              <p className="font-body font-bold text-white text-lg">
                {t.name}
              </p>
              <p className="font-body text-white/80 text-base">
                {t.title}
              </p>
              <p className="font-body text-white/40 text-sm mt-0.5">
                {t.district}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
