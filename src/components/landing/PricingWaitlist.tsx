import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email().max(255),
});

const PricingWaitlist = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError("Enter a valid email address — district or personal both work.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("upsert_waitlist_lead", {
      _email: result.data.email,
      _full_name: result.data.email.split("@")[0],
      _role: "other",
      _source: "pricing-waitlist",
    });
    setSubmitting(false);
    if (rpcError) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSuccess(true);
  };

  return (
    <section id="pricing" className="py-[5.5rem] md:py-[7.5rem] bg-navy text-white/85 text-center">
      <div className="w-[min(820px,100%-2.5rem)] mx-auto">
        <span className="rv inline-flex items-center gap-2 text-[0.74rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)]">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Pricing
        </span>
        <h2 className="rv font-display font-semibold text-[clamp(1.85rem,4.2vw,2.7rem)] leading-[1.12] text-white mt-[0.85rem]">
          One price per course. No tiers, no upsells.
        </h2>

        <div className="rv font-display font-semibold text-white leading-none mt-[1.1rem] mb-[0.3rem] text-[clamp(3.4rem,8vw,5rem)]">
          <sup className="text-[0.38em] -top-[1.1em] relative text-[hsl(43_72%_66%)]">$</sup>79
        </div>
        <p className="text-white/60 text-base mb-[0.9rem]">per course</p>
        <div className="inline-block text-[0.92rem] text-[hsl(43_72%_66%)] border border-[hsl(46_65%_52%/0.4)] rounded-full px-[1.05rem] py-[0.4rem] mb-[2.8rem]">
          Less than a single ISTE conference registration.
        </div>

        <div className="rv max-w-[520px] mx-auto">
          <h3 className="font-display text-[1.35rem] text-white mb-2">Join the waitlist</h3>
          <p className="text-white/60 text-[0.95rem] mb-6">
            Be first in when the doors open — and get the AI Readiness &amp; Equity Audit before anyone else.
          </p>

          {success ? (
            <div className="border-[1.5px] border-[hsl(46_65%_52%/0.5)] rounded-lg px-6 py-[1.4rem] text-white/85 text-left">
              <strong className="text-[hsl(43_72%_66%)]">You're on the list.</strong> Watch your inbox — beta access and the Readiness Audit go to waitlist members first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-[0.7rem]">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourdistrict.org"
                autoComplete="email"
                className="flex-1 bg-white/[0.06] border-[1.5px] border-white/15 text-white placeholder:text-white/60 rounded-[10px] px-[1.1rem] py-[1.6rem] focus-visible:ring-gold focus-visible:border-gold"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="gold-hover bg-gold text-navy hover:bg-gold font-body font-semibold px-[1.6rem] py-[1.6rem] text-base rounded-[10px]"
              >
                {submitting ? "Joining..." : "Join the waitlist"}
              </Button>
            </form>
          )}

          {error && <p className="text-[#F2B8B5] text-[0.86rem] mt-[0.55rem] text-left">{error}</p>}

          <p className="mt-[1.4rem] text-[0.86rem] text-white/60">
            Institutional / team pricing available.
          </p>
        </div>

        <div className="rv max-w-[640px] mx-auto mt-[3.2rem] border-dashed-gold rounded-lg px-[1.5rem] py-[1.3rem] text-left">
          <span className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[hsl(43_72%_66%)] mb-[0.5rem]">
            <span className="w-2 h-2 rounded-full bg-gold" />
            The advanced track
          </span>
          <h3 className="font-display text-white text-[1.15rem] leading-[1.3] mb-[0.4rem]">
            After the courses: Leaders Make the Future
          </h3>
          <p className="text-white/70 text-[0.93rem] leading-[1.55] mb-[0.9rem]">
            The advanced track — ten leadership capacities built for the next decade, not the next quarter.
          </p>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/45 border border-white/15 rounded-[6px] px-[0.9rem] py-[0.45rem] cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingWaitlist;
