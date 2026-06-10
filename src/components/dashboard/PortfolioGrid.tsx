import { Link } from "react-router-dom";
import { FileText, Pencil, ShieldCheck } from "lucide-react";

export interface PortfolioCardItem {
  id: string;
  title: string;
  origin: string;
  state: "draft" | "built" | "tested";
}

interface PortfolioGridProps {
  items: PortfolioCardItem[];
  totalCount: number;
  testedCount: number;
  onMarkTested: (id: string) => void;
}

const ChipDraft = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider border border-dashed border-[hsl(43,69%,35%)] text-[hsl(43,69%,35%)] mb-4 w-fit">
    Draft
  </span>
);

const ChipBuilt = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider bg-muted text-navy mb-4 w-fit">
    Built
  </span>
);

const ChipTested = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider bg-[hsl(150,30%,92%)] text-[hsl(150,40%,28%)] mb-4 w-fit">
    ✓ Tested in your district
  </span>
);

const iconFor = (state: PortfolioCardItem["state"]) => {
  if (state === "draft") return <Pencil className="h-4 w-4 text-[hsl(43,69%,35%)]" />;
  if (state === "tested") return <ShieldCheck className="h-4 w-4 text-[hsl(43,69%,35%)]" />;
  return <FileText className="h-4 w-4 text-[hsl(43,69%,35%)]" />;
};

const PortfolioGrid = ({ items, totalCount, testedCount, onMarkTested }: PortfolioGridProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Your portfolio</h2>
            <p className="font-body text-sm text-muted-foreground">
              Work products you can use tomorrow.
            </p>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            {totalCount} artifact{totalCount === 1 ? "" : "s"} ·{" "}
            <strong className="text-[hsl(43,69%,35%)] font-semibold">
              {testedCount} tested in your district
            </strong>
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-background border border-dashed border-border rounded-lg p-10 text-center">
            <p className="font-body text-muted-foreground">
              Your deliverables will land here as you work through courses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const isDraft = item.state === "draft";
              return (
                <article
                  key={item.id}
                  className={`flex flex-col p-5 rounded-lg transition-all ${
                    isDraft
                      ? "bg-transparent border border-dashed border-border"
                      : "bg-background border border-border shadow-sm hover:-translate-y-1 hover:shadow-lg"
                  }`}
                >
                  <span className="w-9 h-9 rounded-md bg-[hsl(43,80%,93%)] flex items-center justify-center mb-3">
                    {iconFor(item.state)}
                  </span>
                  <h3 className="font-display text-base font-semibold leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mb-3">{item.origin}</p>
                  {item.state === "draft" && <ChipDraft />}
                  {item.state === "built" && <ChipBuilt />}
                  {item.state === "tested" && <ChipTested />}
                  <div className="mt-auto flex gap-3 flex-wrap">
                    <Link
                      to="/portfolio"
                      className="font-body text-sm font-semibold text-[hsl(43,69%,35%)] underline underline-offset-2 hover:text-foreground"
                    >
                      {isDraft ? "Resume draft →" : "View"}
                    </Link>
                    {item.state === "built" && (
                      <button
                        type="button"
                        onClick={() => onMarkTested(item.id)}
                        className="font-body text-sm font-semibold text-[hsl(43,69%,35%)] underline underline-offset-2 hover:text-foreground bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Mark as tested
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="font-body text-sm text-muted-foreground mt-6 max-w-[62ch]">
          <strong className="text-foreground">Tested</strong> means you actually used it — with
          staff, your cabinet, or your board. That's the whole point. When you put an artifact to
          work, mark it here.
        </p>
      </div>
    </section>
  );
};

export default PortfolioGrid;
