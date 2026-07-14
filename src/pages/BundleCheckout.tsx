import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, X } from "lucide-react";
import { StripeEmbeddedCheckoutView } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { COMPLETE_PATH, formatCents } from "@/lib/bundles";
import { toast } from "sonner";

const SITE_URL = "https://www.edleaderforge.com";

const BUNDLE_COURSES = [
  {
    slug: "fluency",
    title: "Fluency",
    blurb: "Confident, daily use of AI tools for leadership work — communication, planning, stakeholder engagement.",
  },
  {
    slug: "strategy",
    title: "Strategy",
    blurb: "Leave with a 3-year AI strategic roadmap structured for your board.",
  },
  {
    slug: "action",
    title: "Action",
    blurb: "Design and launch AI pilots with measurable outcomes and an implementation plan.",
  },
];

const BundleCheckout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      if (!user) {
        setReady(true);
        return;
      }
      const { data } = await supabase
        .from("enrollments")
        .select("courses(slug)")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (cancelled) return;
      const slugs = (data ?? [])
        .map((row: any) => row.courses?.slug)
        .filter((s: string | null): s is string => !!s);
      setEnrolledSlugs(slugs);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const alreadyOwnsSome = enrolledSlugs.some((s) => COMPLETE_PATH.courseSlugs.includes(s));

  const handleBuy = () => {
    if (!user) {
      navigate("/auth?redirect=/bundle");
      return;
    }
    if (!paymentsConfigured()) {
      toast.error("Payments are not configured yet. Please check back shortly.");
      return;
    }
    if (alreadyOwnsSome) {
      toast.error("You already own one of the bundle courses — buy the remaining ones individually.");
      return;
    }
    setCheckoutOpen(true);
  };

  const url = `${SITE_URL}/bundle`;
  const title = "Complete Path bundle — $197 | The Leadership Forge";
  const description =
    "Bundle Fluency, Strategy, and Action. Save $40 vs. buying separately. Lifetime access to all three courses.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
      </Helmet>
      <PaymentTestModeBanner />
      <Header />

      {checkoutOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center overflow-y-auto p-4 pt-10"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-background rounded-lg max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="font-display text-lg font-semibold">Buy the Complete Path</div>
                <div className="font-body text-sm text-muted-foreground">
                  Secure checkout powered by Stripe
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <StripeEmbeddedCheckoutView
                bundleKey={COMPLETE_PATH.key}
                returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          </div>
        </div>
      )}

      <main className="pt-20 lg:pt-24">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-body text-sm text-primary">
              Save $40 — best value
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              The Complete Path
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-6">
              Fluency, Strategy, and Action bundled together. The full leadership arc — from
              confident daily use, to a board-ready 3-year roadmap, to shipped pilots with
              measurable outcomes.
            </p>
            <div className="flex flex-wrap items-baseline gap-3 mb-8">
              <div className="font-display text-4xl font-bold">
                {formatCents(COMPLETE_PATH.priceCents)}
              </div>
              <div className="font-body text-muted-foreground line-through">
                {formatCents(COMPLETE_PATH.individualCents)}
              </div>
              <div className="font-body text-sm text-primary">
                one-time · lifetime access
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleBuy} disabled={!ready}>
                Buy the bundle — $197<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/courses">Compare individual courses</Link>
              </Button>
            </div>
            {alreadyOwnsSome && ready && (
              <p className="mt-4 font-body text-sm text-muted-foreground">
                You already own one of the bundle courses. The bundle is only available to new
                buyers of all three — purchase the remaining courses individually instead.
              </p>
            )}
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-8">What's included</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {BUNDLE_COURSES.map((c) => (
                <Card key={c.slug}>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-2">{c.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">{c.blurb}</p>
                    <Link
                      to={`/courses/${c.slug}`}
                      className="font-body text-sm text-primary hover:underline"
                    >
                      Course details →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 rounded-lg border bg-card p-6">
              <h3 className="font-display text-xl font-semibold mb-4">Why bundle?</h3>
              <ul className="space-y-3 font-body">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Save $40 vs. buying the three courses separately.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Lifetime access — take them in the order that fits your calendar.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>The complete practitioner arc: daily fluency → strategic roadmap → shipped pilots.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BundleCheckout;
