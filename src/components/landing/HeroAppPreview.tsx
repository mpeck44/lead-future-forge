import heroAuditAsset from "@/assets/hero-audit-results.png.asset.json";

const HeroAppPreview = () => {
  return (
    <div className="relative">
      <div className="relative rounded-xl border border-black/5 shadow-2xl shadow-black/40 overflow-hidden bg-[hsl(40_20%_98%)]">
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 bg-[hsl(40_15%_96%)]">
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="ml-4 text-[0.78rem] text-navy/50 font-body">
            app.edleaderforge.com
          </span>
        </div>

        {/* Real audit results screenshot */}
        <img
          src={heroAuditAsset.url}
          alt="AI readiness audit results — score across five categories with a recommended course path"
          className="block w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default HeroAppPreview;
