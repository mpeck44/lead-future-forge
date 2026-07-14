import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  onAudit: () => void;
}

type Build = { title: string; desc: string };

type Door = {
  quote: string;
  promiseShort: React.ReactNode;
  route: string;
  slug: string;
  situation: string;
  promise: string;
  builds: Build[];
  time: string;
  who: string;
};

const doors: Door[] = [
  {
    quote: "I'm already doing AI work, but I'm winging it.",
    promiseShort: (
      <>
        Get organized and capable.{" "}
        <strong className="text-foreground font-semibold">Build real fluency</strong> through practice, not theory.
      </>
    ),
    route: "Fluency",
    slug: "fluency",
    situation:
      "Your teachers are using a dozen AI tools right now. You approved three of them.",
    promise:
      "In about two hours, the AI work already happening in your district becomes organized, documented, and defensible. You'll have artifacts you can put in front of your supervisor — not opinions, evidence.",
    builds: [
      {
        title: "AI Tool Evaluation Matrix",
        desc: "Every tool in use, scored against pedagogy, privacy, and cost. A keep/watch/cut call on each.",
      },
      {
        title: "Stakeholder Coordination Map",
        desc: "Who needs to be in the room before the next announcement — and who's missing now.",
      },
      {
        title: "Communication Template Pack",
        desc: "Staff email, parent letter, teacher FAQ. Written before the question arrives, not after.",
      },
      {
        title: "5-Day Quick Start Plan",
        desc: "The sequence for your first week, so the course doesn't end as a folder of good intentions.",
      },
    ],
    time: "~2 hours, self-paced",
    who: "Tech directors, principals, instructional coaches — anyone judged on execution.",
  },
  {
    quote: "My board and community want an AI answer, and I need a plan.",
    promiseShort: (
      <>
        Move from reactive to strategic.{" "}
        <strong className="text-foreground font-semibold">
          Build governance, vision, and a 3-year roadmap.
        </strong>
      </>
    ),
    route: "Strategy",
    slug: "strategy",
    situation:
      'If your board asked tonight — "where are we on AI?" — could you point to a plan, or just to activity?',
    promise:
      "In about four and a half hours, you build the strategic answer: where AI fits in your district's priorities, how you'll learn before you commit, what you're governing against, and the roadmap that gets it funded. It ends with a presentation built for the room you answer to.",
    builds: [
      {
        title: "Innovation Portfolio Map",
        desc: "AI positioned against everything else your district is carrying, so it stops competing for the same resources by accident.",
      },
      {
        title: "Strategic Pilot Designs",
        desc: "Experiments with a hypothesis, metrics, and a decision gate. Not permission slips.",
      },
      {
        title: "Risk/Opportunity Matrix",
        desc: "The risks that actually take down district AI initiatives, with a named owner on every high-impact item.",
      },
      {
        title: "Four-Layer Governance Stack",
        desc: "Board policy → administrative regulations → handbooks and toolkits → staff and student AI literacy.",
      },
      {
        title: "Strategic Roadmap + Stakeholder Presentation",
        desc: "The 1–3 year plan and the deck that presents it. This is where the course pays for itself.",
      },
    ],
    time: "~4.5 hours, self-paced",
    who: "Superintendents, assistant superintendents, curriculum directors, principals carrying the strategic question.",
  },
  {
    quote: "We have a framework, but nothing is actually moving.",
    promiseShort: (
      <>
        <strong className="text-foreground font-semibold">Make it ship.</strong> 90-day execution, PD that targets real
        gaps, resistance management, and scale/stop decisions.
      </>
    ),
    route: "Action",
    slug: "action",
    situation: "The policy passed in the spring. It's fall. Nothing in your buildings has changed.",
    promise:
      "In about four hours, your framework becomes a 90-day execution plan where every line has a name and a date — plus the PD design, resistance strategy, and monitoring system that keep it moving after the launch energy fades.",
    builds: [
      {
        title: "90-Day Launch Plan",
        desc: "Month by month, owner by owner. If a line item has no name, it isn't a plan.",
      },
      {
        title: "PD Needs Assessment + Calendar",
        desc: "Built on what your staff can't do yet, not on checkbox hours. Different moves for resisters, experimenters, and sprinters.",
      },
      {
        title: "Change Response Toolkit",
        desc: "The three resistance types and the matched response for each — including the quiet department that nods and changes nothing.",
      },
      {
        title: "Monitoring Dashboard",
        desc: "Five to seven indicators that separate adoption activity from instructional impact. Login counts don't count.",
      },
      {
        title: "Scaling Decision Framework",
        desc: "A documented scale/modify/stop verdict for every pilot. Pilot graveyards are caused by nobody deciding.",
      },
      {
        title: "Sustainability Plan",
        desc: "The systems that survive your departure: policy, job descriptions, budget lines.",
      },
    ],
    time: "~4 hours, self-paced",
    who: "Any leader holding an adopted plan that isn't moving — including workshop alumni.",
  },
];

const DoorsSection = ({ onAudit }: Props) => {
  const navigate = useNavigate();
  return (
    <section id="doors" className="py-[5.5rem] md:py-[7.5rem] bg-white">
      <div className="w-[min(1120px,100%-2.5rem)] mx-auto">
        <div className="rv text-center max-w-[640px] mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            Start here
          </span>
          <h2 className="font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] tracking-[-0.01em] mt-[0.85rem] mb-[0.9rem]">
            Which one is you?
          </h2>
          <p className="text-foreground/65 text-[1.06rem]">
            Three doors. Each one opens onto the same connected pathway — at the point that matches the problem on your desk right now.
          </p>
        </div>


        <div className="grid gap-[1.4rem] md:gap-[1.6rem] grid-cols-1 md:grid-cols-3 items-start">
          {doors.map((d, i) => (
            <div
              key={d.slug}
              className={`door-card rv rv-d${Math.min(i + 1, 3)} text-left flex flex-col bg-background border border-foreground/10 rounded-lg p-[1.7rem] pt-[2.1rem] shadow-[0_1px_2px_rgba(11,22,38,.05),0_8px_28px_rgba(11,22,38,.08)] hover:shadow-[0_2px_4px_rgba(11,22,38,.06),0_18px_44px_rgba(11,22,38,.16)] hover:border-[hsl(46_65%_52%/0.55)] transition-all duration-200`}
            >
              <button
                onClick={() => navigate(`/courses/${d.slug}`)}
                className="text-left"
              >
                <span className="font-display text-[2.6rem] leading-none text-gold mb-[0.4rem] block">"</span>
                <h3 className="font-display font-semibold text-[clamp(1.22rem,1.7vw,1.42rem)] leading-[1.3] mb-4 text-foreground">
                  {d.quote}
                </h3>
                <p className="text-foreground/65 text-[0.97rem] mb-[1.4rem]">{d.promiseShort}</p>
                <div className="border-t border-foreground/10 pt-[1.1rem] space-y-[0.55rem]">
                  <div className="flex items-baseline gap-[0.55rem] flex-wrap">
                    <small className="text-[0.68rem] font-semibold tracking-[0.13em] uppercase text-foreground/65">
                      Routes to
                    </small>
                    <span className="font-semibold text-[hsl(40_72%_30%)] text-[0.98rem] inline-flex items-center gap-[0.4rem]">
                      {d.route} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-[0.55rem] flex-wrap">
                    <span className="font-display font-semibold text-foreground text-[1.35rem] leading-none">
                      $75
                    </span>
                    <span className="text-foreground/60 text-[0.85rem]">· {d.time}</span>
                  </div>
                </div>
              </button>

              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="detail" className="border-b-0">
                  <AccordionTrigger className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-[hsl(40_72%_30%)] hover:no-underline py-3">
                    See what you'll build
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-[1.1rem]">
                      <div>
                        <p className="text-[0.7rem] font-semibold tracking-[0.13em] uppercase text-foreground/55 mb-1">
                          Situation
                        </p>
                        <p className="text-foreground/80 text-[0.93rem] leading-[1.5]">{d.situation}</p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold tracking-[0.13em] uppercase text-foreground/55 mb-1">
                          Promise
                        </p>
                        <p className="text-foreground/80 text-[0.93rem] leading-[1.5]">{d.promise}</p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] font-semibold tracking-[0.13em] uppercase text-foreground/55 mb-2">
                          What you build
                        </p>
                        <ul className="space-y-[0.6rem]">
                          {d.builds.map((b) => (
                            <li key={b.title} className="flex gap-2 text-[0.92rem]">
                              <span className="flex-none text-gold mt-[0.5em] w-[14px] h-[1.5px] bg-gold" />
                              <span className="text-foreground/80">
                                <strong className="text-foreground font-semibold">{b.title}</strong> — {b.desc}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-1 gap-[0.6rem] pt-1 text-[0.88rem] text-foreground/70">
                        <p>
                          <span className="font-semibold text-foreground">Time:</span> {d.time}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Who it's for:</span> {d.who}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>

        <p className="rv mt-[2.6rem] text-center text-foreground/65 text-[0.97rem]">
          Not sure where you are?{" "}
          <button onClick={onAudit} className="text-[hsl(40_72%_30%)] font-semibold underline underline-offset-4">
            Take the 5-minute AI Readiness &amp; Equity Audit
          </button>{" "}
          — it recommends the right door.
          <span className="block text-[0.83rem] mt-[0.3rem] text-foreground/65">
            Launching with our beta. Waitlist members get it first.
          </span>
        </p>

        {/* Launchpad prerequisite — quiet divider band below the routing section */}
        <div className="rv mt-[3rem] pt-[1.4rem] border-t border-foreground/10 text-center">
          <p className="text-foreground/60 text-[0.92rem]">
            <span className="text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[hsl(40_72%_30%)] mr-2">
              Foundations
            </span>
            Every path starts with a 20-minute baseline. You'll leave it with your district's AI Equity Audit score.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DoorsSection;
