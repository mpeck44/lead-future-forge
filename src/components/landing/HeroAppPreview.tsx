import heroAuditAsset from "@/assets/hero-audit-results.png.asset.json";

const HeroAppPreview = () => {
  return (
    <div className="relative">
      <img
        src={heroAuditAsset.url}
        alt="AI readiness audit results — baseline scores across Fluency, Strategy, Action, Governance, and Capacity with a recommended next course"
        className="block w-full h-auto rounded-xl shadow-2xl shadow-black/40"
        loading="lazy"
      />
    </div>
  );
};

export default HeroAppPreview;
