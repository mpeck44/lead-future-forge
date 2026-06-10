import { Link } from "react-router-dom";

export type PathStepStatus = "done" | "current" | "locked" | "upnext";

export interface PathStep {
  index: number;
  title: string;
  tag: string;
  status: PathStepStatus;
  progressPercent?: number;
  href?: string;
}

interface PathwayStripProps {
  steps: PathStep[];
}

const statusLabel = (s: PathStep) => {
  switch (s.status) {
    case "done":
      return <p className="font-body text-sm text-muted-foreground">Complete</p>;
    case "current":
      return (
        <p className="font-body text-sm font-semibold text-[hsl(43,69%,35%)]">
          In progress — {s.progressPercent ?? 0}%
        </p>
      );
    case "upnext":
      return (
        <p className="font-body text-sm text-muted-foreground">
          Up next ·{" "}
          {s.href ? (
            <Link to={s.href} className="text-[hsl(43,69%,35%)] font-semibold underline underline-offset-2">
              Preview →
            </Link>
          ) : (
            <span className="text-[hsl(43,69%,35%)] font-semibold">Preview →</span>
          )}
        </p>
      );
    default:
      return <p className="font-body text-sm text-muted-foreground">Coming up</p>;
  }
};

const discClasses = (s: PathStepStatus) => {
  if (s === "done") return "bg-navy border-navy text-gold";
  if (s === "current")
    return "bg-gold border-gold text-navy shadow-[0_0_0_5px_rgba(212,175,55,0.22)]";
  return "bg-background border-border text-muted-foreground";
};

const PathwayStrip = ({ steps }: PathwayStripProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <h2 className="font-display text-2xl font-bold">Your pathway</h2>
          <p className="font-body text-sm text-muted-foreground">
            Four courses. One connected system.
          </p>
        </div>

        <div className="bg-background border border-border rounded-lg shadow-sm p-7">
          <ol className="relative grid gap-6 md:grid-cols-4 md:gap-5 md:pt-10 pl-9 md:pl-0">
            {/* rail */}
            <div
              aria-hidden="true"
              className="absolute left-[15px] top-4 bottom-4 w-px bg-border md:left-[4%] md:right-[4%] md:top-[15px] md:bottom-auto md:w-auto md:h-px"
            />
            {steps.map((step) => {
              const opacity = step.status === "locked" ? "opacity-60" : "";
              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute -left-9 top-0 md:static md:mt-[-2.4rem] md:mb-3 w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center font-body text-sm font-semibold ${discClasses(step.status)}`}
                  >
                    {step.index}
                  </span>
                  <h3 className={`font-display text-base font-semibold ${step.status === "current" ? "text-foreground" : ""}`}>
                    {step.title}
                  </h3>
                  <span className="block font-body text-[0.68rem] font-semibold tracking-[0.13em] uppercase text-muted-foreground mb-1.5 mt-0.5">
                    {step.tag}
                  </span>
                  {statusLabel(step)}
                  {step.status === "current" && (
                    <div className="mt-2 h-1.5 max-w-[170px] rounded-full bg-muted border border-border overflow-hidden">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${step.progressPercent ?? 0}%` }}
                      />
                    </div>
                  )}
                </>
              );
              return (
                <li key={step.index} className={`relative ${opacity}`}>
                  {inner}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default PathwayStrip;
