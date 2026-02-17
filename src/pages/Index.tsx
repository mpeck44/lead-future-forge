import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturedCourse from "@/components/FeaturedCourse";
import OutcomesSection from "@/components/OutcomesSection";
import DifferentiatorSection from "@/components/DifferentiatorSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TestimonialsSection />
        <OutcomesSection />
        <FeaturedCourse />
        <DifferentiatorSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
