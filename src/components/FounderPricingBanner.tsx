import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isFounderActive, FOUNDER_CUTOFF_LABEL } from "@/lib/founderDiscount";

const DISMISS_KEY = "founder-banner-dismissed-v1";

export function FounderPricingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || !isFounderActive()) return null;

  return (
    <div className="w-full bg-navy text-white text-xs sm:text-sm font-body border-b border-gold/25">
      <div className="w-[min(1200px,100%-1.5rem)] mx-auto flex items-center gap-3 py-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold flex-none" aria-hidden />
        <p className="flex-1 leading-tight">
          <span className="font-semibold text-gold">Founder pricing</span>
          <span className="text-white/80"> — Complete Path $158 (save $79). Ends {FOUNDER_CUTOFF_LABEL}.</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
          }}
          aria-label="Dismiss"
          className="text-white/60 hover:text-white flex-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
