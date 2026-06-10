const painPoints = [
  {
    title: "AI is already in your buildings. Your approach is improvised.",
    supporting: "Teachers are using tools you never approved. You're answering questions case by case.",
  },
  {
    title: "Your board — or your boss — is asking for a plan you don't have.",
    supporting: "The question has moved from 'what is AI?' to 'what's our strategy?'",
  },
  {
    title: "You wrote the plan. Nothing is moving.",
    supporting: "The framework got adopted. The binder got shelved. Practice hasn't changed.",
  },
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
          Your district isn't lacking AI tools. It's lacking a strategy that works at scale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {painPoints.map((point, i) => (
            <div key={i} className="border-l-4 border-dark-teal bg-white/5 rounded-r-lg p-6">
              <p className="font-body text-white/90 text-base leading-relaxed">{point.title}</p>
              <p className="font-body text-white/60 text-sm leading-relaxed mt-3">{point.supporting}</p>
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
