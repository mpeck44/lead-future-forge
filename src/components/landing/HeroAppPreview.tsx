import { Check, Lock } from "lucide-react";

const HeroAppPreview = () => {
  return (
    <div className="relative">
      {/* Browser card */}
      <div
        className="relative rounded-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
        style={{ backgroundColor: "hsl(222 47% 9%)" }}
      >
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="ml-4 text-[0.78rem] text-white/40 font-body">
            app.leadershipforge.org
          </span>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7">
          <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-white/40 font-body mb-1.5">
            Your pathway
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-white mb-5">
            Welcome back, Dr. Ellison
          </h3>

          {/* Step 1 — active */}
          <div className="rounded-lg border border-gold/40 bg-white/[0.02] p-3.5 mb-2.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-gold text-navy font-display font-bold flex items-center justify-center text-base flex-none">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-white text-[0.95rem] mb-1.5">
                Command the Tools
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <span className="text-gold font-body font-semibold text-sm flex-none">72%</span>
          </div>

          {/* Step 2 — locked */}
          <div className="rounded-lg border border-white/10 p-3.5 mb-2.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-white/5 text-white/40 font-display font-bold flex items-center justify-center text-base flex-none">
              2
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-white/85 text-[0.95rem]">
                Chart the Course
              </div>
              <div className="text-[0.78rem] text-white/40 font-body">
                Strategy · 6 modules
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[0.72rem] text-white/40 font-body flex-none">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>

          {/* Step 3 — locked */}
          <div className="rounded-lg border border-white/10 p-3.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-white/5 text-white/40 font-display font-bold flex items-center justify-center text-base flex-none">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-white/85 text-[0.95rem]">
                Ship It
              </div>
              <div className="text-[0.78rem] text-white/40 font-body">
                Action · 90-day plan
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[0.72rem] text-white/40 font-body flex-none">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="absolute -bottom-5 -right-3 sm:right-6 bg-background text-foreground rounded-lg shadow-2xl shadow-black/40 px-4 py-3 flex items-center gap-3 max-w-[18rem]">
        <span className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center flex-none">
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <div className="font-body font-semibold text-sm leading-tight">
            Artifact saved
          </div>
          <div className="font-body text-[0.78rem] text-muted-foreground leading-tight mt-0.5">
            3-Year Roadmap · ready for your board
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAppPreview;
