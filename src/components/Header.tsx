import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, BookOpen, Briefcase, Shield } from "lucide-react";
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
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const location = useLocation();
  const onLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        setUserName(data?.full_name || user.email?.split("@")[0] || "User");
      } else {
        setUserName(null);
      }
    };
    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // On the landing page we render the dark, scroll-aware nav from the design.
  if (onLanding) {
    const landingLinks = [
      { label: "Which one is you?", href: "#doors" },
      { label: "The pathway", href: "#pathway" },
      { label: "What you'll build", href: "#deliverables" },
      { label: "FAQ", href: "#faq" },
    ];
    return (
      <>
        <a
          href="#main"
          className="absolute left-4 -top-12 z-[200] bg-gold text-navy px-4 py-2 rounded-md font-semibold focus:top-4 transition-all"
        >
          Skip to content
        </a>
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 border-b ${
            scrolled
              ? "bg-navy/85 backdrop-blur-md border-white/15"
              : "bg-transparent border-transparent"
          }`}
        >
          <div className="w-[min(1120px,100%-2.5rem)] mx-auto flex items-center justify-between h-[68px]">
            <Link to="/" className="font-display text-[1.22rem] font-semibold text-white tracking-[0.01em]">
              Leadership <em className="not-italic italic text-gold">Forge</em>
            </Link>

            <nav className="hidden md:flex items-center gap-[1.9rem]">
              {landingLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-white/60 hover:text-[hsl(43_72%_66%)] text-[0.92rem] font-medium transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white/85 hover:bg-white/10 hover:text-white">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gold text-navy text-xs">
                          {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate">{userName || "User"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile"><Settings className="mr-2 h-4 w-4" />Profile Settings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin Console</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold px-[1.1rem] py-2 text-[0.9rem] rounded-[10px]"
                >
                  <Link to="/courses">Start learning today!</Link>
                </Button>
              )}
            </div>

            <button
              type="button"
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-navy/95 backdrop-blur-md border-t border-white/15 animate-fade-in">
              <nav className="w-[min(1120px,100%-2.5rem)] mx-auto py-4 flex flex-col gap-3">
                {landingLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/85 font-medium py-2"
                  >
                    {l.label}
                  </a>
                ))}
                {user ? (
                  <Button variant="outline" onClick={handleSignOut} className="border-white/20 text-white bg-transparent hover:bg-white/10 justify-start">
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                  </Button>
                ) : (
                  <Button
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                    className="gold-hover bg-gold text-navy hover:bg-gold font-semibold rounded-[10px]"
                  >
                    <Link to="/courses">Start learning today!</Link>
                  </Button>
                )}
              </nav>
            </div>
          )}
        </header>
      </>
    );
  }

  // Non-landing routes: keep the existing light app header.
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                <span className="text-burnt-orange font-display font-bold text-lg">LF</span>
              </div>
              <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
                The Leadership Forge
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  <Link to="/dashboard" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                  <Link to="/my-courses" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Courses</Link>
                  <Link to="/portfolio" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
                </>
              ) : (
                <Link to="/courses" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Courses</Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 font-body font-medium">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-burnt-orange text-primary-foreground text-xs">
                          {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate">{userName || "User"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile"><Settings className="mr-2 h-4 w-4" />Profile Settings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin Console</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  className="gold-hover bg-burnt-orange text-navy hover:bg-burnt-orange font-body font-medium"
                >
                  <Link to="/courses">Get the bundle</Link>
                </Button>
              )}
            </div>

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-4">
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                    <Link to="/my-courses" className="flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}><BookOpen className="h-4 w-4" /> My Courses</Link>
                    <Link to="/portfolio" className="flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}><Briefcase className="h-4 w-4" /> Portfolio</Link>
                    <Link to="/profile" className="flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}><Settings className="h-4 w-4" /> Profile Settings</Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}><Shield className="h-4 w-4" /> Admin Console</Link>
                    )}
                    <Button variant="outline" onClick={handleSignOut} className="font-body font-medium justify-start">
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/courses" className="py-2" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                    <Button asChild onClick={() => setIsMenuOpen(false)} className="gold-hover bg-burnt-orange text-navy hover:bg-burnt-orange font-body font-medium justify-start">
                      <Link to="/courses">Get the bundle</Link>
                    </Button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
