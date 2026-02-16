import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import FeaturedCourse from "@/components/FeaturedCourse";
import OutcomesSection from "@/components/OutcomesSection";
import DifferentiatorSection from "@/components/DifferentiatorSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <OutcomesSection />
        <FeaturedCourse />
        <DifferentiatorSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
