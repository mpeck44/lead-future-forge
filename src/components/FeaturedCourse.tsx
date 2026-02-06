import { Clock, Users, Award, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FeaturedCourse = () => {
  return (
    <section id="courses" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What You'll Build
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Real tools and frameworks you can use in your district—not just theory
          </p>
        </div>

        {/* Course Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
            {/* Coming Soon Badge */}
            <div className="absolute top-6 right-6 z-10">
              <Badge className="bg-gold text-navy font-body font-semibold px-4 py-1.5 text-sm">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Coming Soon
              </Badge>
            </div>

            {/* Course Image Placeholder */}
            <div className="h-64 sm:h-80 bg-gradient-to-br from-navy via-dark-teal to-teal relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <span className="font-display font-bold text-3xl text-gold">LF</span>
                  </div>
                  <p className="font-body text-sm text-light-teal/80">Course Preview</p>
                </div>
              </div>
              {/* Decorative gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Course Content */}
            <div className="p-8 sm:p-10">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                The Leadership Forge
              </h3>
              <p className="font-body text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                In 4-6 hours, you'll build a complete AI toolkit for your district: governance policies, 
                communication templates, and implementation roadmaps you can use immediately.
              </p>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-body">Self-Paced</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-body">For Administrators</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-body">Certificate Included</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="font-body font-semibold bg-primary hover:bg-dark-teal px-8"
                >
                  Join the Waitlist
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="font-body font-medium"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourse;
