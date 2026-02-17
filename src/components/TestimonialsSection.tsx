import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "This program gave me the confidence and framework to present an AI strategy to our board — and they approved it unanimously.",
    name: "Dr. Sarah Mitchell",
    role: "Superintendent, Greenfield USD",
  },
  {
    quote:
      "I've attended dozens of AI workshops. This is the first one that produced something I could actually use the next Monday morning.",
    name: "James Ortega",
    role: "Director of Technology, Lincoln ISD",
  },
  {
    quote:
      "The governance templates alone saved our team weeks of work. Everything is practical, standards-aligned, and ready to deploy.",
    name: "Maria Chen",
    role: "Assistant Superintendent, Oakridge Schools",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[hsl(40,33%,96%)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy text-center mb-4">
          What Our Leaders Say
        </h2>
        <p className="font-body text-lg text-navy/60 text-center max-w-2xl mx-auto mb-14">
          Hear from K-12 leaders who have transformed their AI strategy with The Leadership Forge.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-navy/10 p-7 flex flex-col shadow-sm"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]"
                  />
                ))}
              </div>
              <p className="font-body text-navy/85 text-[15px] leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>
              <div>
                <p className="font-body font-semibold text-navy text-sm">
                  {t.name}
                </p>
                <p className="font-body text-navy/55 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
