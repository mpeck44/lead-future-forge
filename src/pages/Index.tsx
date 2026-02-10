import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import FeaturedCourse from "@/components/FeaturedCourse";
import DifferentiatorSection from "@/components/DifferentiatorSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturedCourse />
        <DifferentiatorSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
