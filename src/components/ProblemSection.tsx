const painPoints = [
  "Your district is buying AI tools, but lacks a strategy for deploying them with impact.",
  "Your board/leadership expects an AI plan, but you're unsure where to start or what success looks like.",
  "Conference sessions show demos — but offer no pathway for organizational leadership or change.",
];

const ProblemSection = () => {
  return (
    <section className="relative py-20 bg-navy overflow-hidden">
      <div className="absolute inset-0 hero-dot-grid opacity-20" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-5">
          The Problem You're Facing
        </h2>

        <p className="font-body text-lg text-white/85 text-center max-w-3xl mx-auto mb-12">
          Your district isn't lacking AI tools — it's lacking a strategy that works at scale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {painPoints.map((point, i) => (
            <div key={i} className="border-l-4 border-dark-teal bg-white/5 rounded-r-lg p-6">
              <p className="font-body text-white/90 text-base leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        <p className="font-display text-xl sm:text-2xl text-center text-light-teal max-w-3xl mx-auto">
          You don't need another workshop. You need a system that produces outcomes you can implement.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
