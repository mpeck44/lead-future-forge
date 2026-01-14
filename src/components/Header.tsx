import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setUserName(data.full_name);
        } else {
          // Fallback to email
          setUserName(user.email?.split('@')[0] || 'User');
        }
      } else {
        setUserName(null);
      }
    };

    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">AI</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              AI Leadership Accelerator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {user ? (
              // Logged-in navigation
              <>
                <Link
                  to="/dashboard"
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-courses"
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  My Courses
                </Link>
                <Link
                  to="/portfolio"
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Portfolio
                </Link>
              </>
            ) : (
              // Logged-out navigation
              <>
                <Link
                  to="/courses"
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Courses
                </Link>
                <a
                  href="#about"
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </a>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 font-body font-medium">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate">{userName || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="font-body font-medium">
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button asChild className="font-body font-medium bg-primary hover:bg-dark-teal">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
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
              {user ? (
                // Logged-in mobile navigation
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/my-courses"
                    className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    My Courses
                  </Link>
                  <Link
                    to="/portfolio"
                    className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    Portfolio
                  </Link>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="font-body font-medium justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                </>
              ) : (
                // Logged-out mobile navigation
                <>
                  <Link
                    to="/courses"
                    className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Courses
                  </Link>
                  <a
                    href="#about"
                    className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </a>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" asChild className="font-body font-medium justify-start">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild className="font-body font-medium bg-primary hover:bg-dark-teal">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
