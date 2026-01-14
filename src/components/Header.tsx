import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">AI</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              AI Leadership Accelerator
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#courses"
              className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Courses
            </a>
            <a
              href="#about"
              className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-body font-medium">
              Log In
            </Button>
            <Button className="font-body font-medium bg-primary hover:bg-dark-teal">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a
                href="#courses"
                className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                Courses
              </a>
              <a
                href="#about"
                className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                About
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="font-body font-medium justify-start">
                  Log In
                </Button>
                <Button className="font-body font-medium bg-primary hover:bg-dark-teal">
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
