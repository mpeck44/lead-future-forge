import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCourse from "@/components/FeaturedCourse";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedCourse />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
