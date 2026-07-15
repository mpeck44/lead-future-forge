import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { COMPLETE_PATH, formatCents } from "@/lib/bundles";
import { isFounderActive } from "@/lib/founderDiscount";

const DISMISS_KEY = "sticky-buy-bar-dismissed";

const StickyBuyBar = () => {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (dismissed || user || loading) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, user, loading]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (user || loading || dismissed) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5 pointer-events-none transition-all duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-gold/30 bg-navy text-white shadow-2xl shadow-black/40 flex items-center gap-3 px-4 py-3 sm:px-5">
        <div className="flex-1 min-w-0">
          <div className="font-body font-semibold text-sm sm:text-base leading-tight">
            The Complete Path — Fluency + Strategy + Action
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-body text-white/50 line-through text-xs sm:text-sm">
              {isFounderActive() ? "$197" : "$237"}
            </span>
            <span className="font-display font-bold text-gold text-base sm:text-lg leading-none">
              {formatCents(COMPLETE_PATH.priceCents)}
            </span>
            {isFounderActive() && (
              <span className="hidden sm:inline font-body text-[0.7rem] uppercase tracking-[0.12em] text-gold/80 ml-1">
                Founder · ends Sept 7
              </span>
            )}
            <Link
              to="/courses#pathway-trio"
              className="hidden sm:inline font-body text-xs text-white/60 hover:text-gold ml-2"
            >
              Compare courses
            </Link>
          </div>
        </div>
        <Link
          to="/courses#bundle"
          className="gold-hover inline-flex items-center gap-1.5 rounded-[10px] bg-gold px-4 py-2.5 font-body font-semibold text-navy text-sm whitespace-nowrap"
        >
          Buy the bundle
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="text-white/50 hover:text-white transition-colors flex-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StickyBuyBar;
