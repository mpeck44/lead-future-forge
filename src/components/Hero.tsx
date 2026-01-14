import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-dark-teal to-navy opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/20 border border-teal/30 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-body text-sm text-light-teal">
              For K-12 Educational Leaders
            </span>
          </div>

          {/* Headline */}
          <h1 
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Lead with Confidence{" "}
            <span className="text-gold">in the AI Era</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="font-body text-lg sm:text-xl text-light-teal/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Empowering school administrators and educational leaders with the knowledge 
            and skills to navigate AI integration thoughtfully and strategically.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Button 
              size="lg" 
              className="font-body font-semibold bg-gold hover:bg-gold/90 text-navy px-8 py-6 text-base group"
            >
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-body font-semibold border-light-teal/50 text-white hover:bg-light-teal/10 px-8 py-6 text-base"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicator */}
          <div 
            className="mt-16 pt-8 border-t border-white/10 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="font-body text-sm text-light-teal/70">
              Designed specifically for principals, superintendents, and district leaders
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
