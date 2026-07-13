import { Check, FileText, Lock } from "lucide-react";

const HeroAppPreview = () => {
  return (
    <div className="relative">
      {/* Top card — pathway progress (light) */}
      <div className="relative rounded-xl border border-black/5 shadow-2xl shadow-black/40 overflow-hidden bg-[hsl(40_20%_98%)] text-navy">
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 bg-[hsl(40_15%_96%)]">
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="ml-4 text-[0.78rem] text-navy/50 font-body">
            app.leadershipforge.org
          </span>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7">
          <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-navy/50 font-body mb-1.5">
            Your pathway
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-navy mb-5">
            Welcome back, Dr. Ellison
          </h3>

          {/* Step 1 — active */}
          <div className="rounded-lg border border-gold/60 bg-gold/5 p-3.5 mb-2.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-gold text-navy font-display font-bold flex items-center justify-center text-base flex-none">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-navy text-[0.95rem] mb-1.5">
                Command the Tools
              </div>
              <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <span className="text-navy font-body font-semibold text-sm flex-none">72%</span>
          </div>

          {/* Step 2 — locked */}
          <div className="rounded-lg border border-black/10 p-3.5 mb-2.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-navy/5 text-navy/40 font-display font-bold flex items-center justify-center text-base flex-none">
              2
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-navy/85 text-[0.95rem]">
                Chart the Course
              </div>
              <div className="text-[0.78rem] text-navy/50 font-body">
                Strategy · 6 modules
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[0.72rem] text-navy/50 font-body flex-none">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>

          {/* Step 3 — locked */}
          <div className="rounded-lg border border-black/10 p-3.5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-md bg-navy/5 text-navy/40 font-display font-bold flex items-center justify-center text-base flex-none">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-semibold text-navy/85 text-[0.95rem]">
                Ship It
              </div>
              <div className="text-[0.78rem] text-navy/50 font-body">
                Action · 90-day plan
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[0.72rem] text-navy/50 font-body flex-none">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>
        </div>
      </div>

      {/* Bottom card — artifact thumbnail, offset */}
      <div className="relative mt-5 ml-4 sm:ml-10 rounded-xl border border-black/5 shadow-2xl shadow-black/40 bg-[hsl(40_20%_98%)] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
        <div className="p-5 pl-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-md bg-navy/5 flex items-center justify-center flex-none">
            <FileText className="h-5 w-5 text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-body font-semibold text-navy text-[0.95rem]">
                3-Year AI Roadmap.pdf
              </span>
              <span className="inline-flex items-center rounded-full bg-gold/15 text-navy px-2 py-0.5 text-[0.68rem] font-body font-semibold">
                Ready to present
              </span>
            </div>
            <div className="text-[0.78rem] text-navy/55 font-body mb-2.5">
              Board-ready · 14 pages
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-navy/10" style={{ width: "92%" }} />
              <div className="h-1.5 rounded-full bg-navy/10" style={{ width: "78%" }} />
              <div className="h-1.5 rounded-full bg-navy/10" style={{ width: "60%" }} />
            </div>
          </div>
        </div>

        {/* Toast hanging off the artifact card */}
        <div className="absolute -bottom-4 -right-3 sm:right-4 bg-background text-foreground rounded-lg shadow-2xl shadow-black/40 px-3.5 py-2.5 flex items-center gap-2.5 max-w-[17rem]">
          <span className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center flex-none">
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <div className="font-body font-semibold text-[0.82rem] leading-tight">
              Artifact saved
            </div>
            <div className="font-body text-[0.72rem] text-muted-foreground leading-tight mt-0.5">
              Ready for your board
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAppPreview;
