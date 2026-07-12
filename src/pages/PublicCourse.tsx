import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Award, Users, CheckCircle2, BookOpen, X } from "lucide-react";
import { ROLE_OPTIONS } from "@/lib/roleOptions";
import { StripeEmbeddedCheckoutView } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  estimated_hours: number | null;
  path_type: string | null;
  audit_category: string | null;
  role_fit: string[] | null;
  requires_foundations: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  sequence_order: number;
}

const COURSE_FAQS: Record<string, { q: string; a: string }[]> = {
  foundations: [
    { q: "Do I need any AI background to start?", a: "No. The Launchpad assumes zero technical or AI background. It establishes the shared language every other course in the pathway builds on." },
    { q: "How long will it take?", a: "Roughly four hours of focused work, broken into short modules. Most leaders finish in two weeks at a module every few days." },
    { q: "What do I leave with?", a: "A completed AI Equity Audit, a personal readiness profile, and a recommended next course matched to your district's largest gap." },
  ],
  fluency: [
    { q: "Is this hands-on?", a: "Yes. You'll work directly in AI tools, building a personal workflow you can use the next day for communication, planning, and stakeholder engagement." },
    { q: "Do I need to be technical?", a: "No. Fluency is about confident leadership use of the tools, not engineering. Every exercise is grounded in real district leadership tasks." },
    { q: "How long will it take?", a: "About six hours of focused work, paced over two to three weeks." },
  ],
  strategy: [
    { q: "Will I leave with something I can show my board?", a: "Yes. The course ends in a 3-year AI strategic roadmap built around your district's priorities, structured for board presentation." },
    { q: "Do I need to finish Foundations first?", a: "Yes. Chart the Course assumes the shared language and readiness profile from The Launchpad." },
    { q: "Who should take this?", a: "Superintendents, assistant superintendents, technology and curriculum directors, and principals leading district-level AI planning." },
  ],
  action: [
    { q: "What do I build?", a: "A complete pilot design document, a 90-day launch plan, a board communication, and an implementation playbook for change management." },
    { q: "Is this only for tech directors?", a: "No. The course is built for any district leader moving an AI initiative from plan to pilot — including principals, curriculum directors, and superintendents." },
    { q: "Do I need to finish Foundations and Strategy first?", a: "Foundations is required. Strategy is strongly recommended — Ship It assumes you have a roadmap to execute against." },
  ],
};

const SITE_URL = "https://edleaderforge.com";

const COURSE_SEO: Record<string, { title: string; description: string }> = {
  foundations: {
    title: "K-12 AI Foundations Course — The Launchpad | The Leadership Forge",
    description:
      "Free AI foundations course for K-12 district leaders. Complete the AI Equity Audit and get a personal readiness profile in about four hours.",
  },
  fluency: {
    title: "K-12 AI Fluency for Leaders — Command the Tools | The Leadership Forge",
    description:
      "Hands-on AI fluency for superintendents, principals, and district leaders. Build a personal AI workflow you can use the next day.",
  },
  strategy: {
    title: "K-12 AI Strategy Course — Chart the Course | The Leadership Forge",
    description:
      "Build a board-ready 3-year AI strategic roadmap for your school district. For superintendents, tech and curriculum directors.",
  },
  action: {
    title: "K-12 AI Pilot Design — Ship It | The Leadership Forge",
    description:
      "Design and launch AI pilots with measurable outcomes. Leave with a pilot design, board communication, and 90-day launch plan for your district.",
  },
};

const formatRole = (role: string) =>
  ROLE_OPTIONS.find((r) => r.value === role)?.label || role.replace(/_/g, " ");

const PublicCourse = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<{ amount_cents: number; currency: string } | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("id, title, description, slug, estimated_hours, path_type, audit_category, role_fit, requires_foundations")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (cancelled) return;
      if (error || !courseData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCourse(courseData as Course);
      const [modRes, prodRes, enrollRes] = await Promise.all([
        supabase
          .from("modules")
          .select("id, title, description, sequence_order")
          .eq("course_id", courseData.id)
          .order("sequence_order"),
        supabase
          .from("products")
          .select("amount_cents, currency")
          .eq("course_id", courseData.id)
          .eq("active", true)
          .maybeSingle(),
        user
          ? supabase
              .from("enrollments")
              .select("id")
              .eq("user_id", user.id)
              .eq("course_id", courseData.id)
              .eq("status", "active")
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      if (cancelled) return;
      setModules((modRes.data as Module[]) || []);
      setProduct((prodRes.data as any) || null);
      setAlreadyEnrolled(!!enrollRes?.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Course not found</h1>
          <p className="font-body text-muted-foreground mb-6">This course may have been renamed or is no longer published.</p>
          <Button asChild><Link to="/courses">Browse all courses</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16">
          <div className="animate-pulse max-w-3xl mx-auto space-y-4">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `${SITE_URL}/courses/${course.slug}`;
  const seo = COURSE_SEO[course.slug];
  const titleTag = seo?.title || `${course.title} — The Leadership Forge`;
  const description =
    seo?.description ||
    (course.description || "").split("\n")[0].slice(0, 158) ||
    "AI professional development for K-12 district leaders. Build artifacts you can use in your district.";
  const faqs = COURSE_FAQS[course.slug] || [];

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: "The Leadership Forge",
      url: SITE_URL,
    },
    hasCourseInstance: course.estimated_hours
      ? {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${course.estimated_hours}H`,
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE_URL}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: url },
    ],
  };

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const isPaid = !!product && product.amount_cents > 0;
  const priceLabel = product
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency.toUpperCase(), maximumFractionDigits: 0 }).format(product.amount_cents / 100)
    : null;

  const handlePrimaryCta = async () => {
    if (!user) {
      // Preserve intent to return to this course after auth
      navigate(`/auth?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`);
      return;
    }
    if (alreadyEnrolled) {
      navigate(`/course/${course.slug}`);
      return;
    }
    if (isPaid) {
      if (!paymentsConfigured()) {
        toast.error("Checkout isn't available yet. Please contact us to enroll.");
        return;
      }
      setCheckoutOpen(true);
      return;
    }
    // Free course — enroll directly
    try {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: course.id,
        status: "active",
        amount_paid: 0,
      });
      if (error && error.code !== "23505") throw error;
      setAlreadyEnrolled(true);
      toast.success("You're enrolled.");
      navigate(`/course/${course.slug}`);
    } catch (e) {
      toast.error("Could not enroll. Please try again.");
    }
  };

  const primaryLabel = !user
    ? "Sign in to enroll"
    : alreadyEnrolled
      ? "Go to course"
      : isPaid
        ? `Enroll — ${priceLabel}`
        : "Enroll free";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{titleTag}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={titleTag} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>
      <PaymentTestModeBanner />
      <Header />
      {checkoutOpen && course && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center overflow-y-auto p-4 pt-10"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-background rounded-lg max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="font-display text-lg font-semibold">Enroll in {course.title}</div>
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
                courseId={course.id}
                returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          </div>
        </div>
      )}
      <main className="pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <nav className="font-body text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/courses" className="hover:text-foreground">Courses</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{course.title}</span>
            </nav>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.path_type && <Badge variant="secondary">{course.path_type}</Badge>}
              {course.requires_foundations && <Badge variant="outline">Requires Foundations</Badge>}
              {course.audit_category && (
                <Badge variant="outline" className="capitalize">{course.audit_category} track</Badge>
              )}
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {course.title}
            </h1>
            {course.description && (
              <p className="font-body text-lg text-muted-foreground whitespace-pre-line mb-6">
                {course.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              {course.estimated_hours && (
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.estimated_hours} hours</span>
              )}
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />Self-paced</span>
              <span className="flex items-center gap-1"><Award className="h-4 w-4" />Certificate</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handlePrimaryCta}>
                {primaryLabel}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/courses">See all courses</Link>
              </Button>
            </div>
            {["fluency", "strategy", "action"].includes(course.slug) && !alreadyEnrolled && (
              <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display font-semibold">Want the complete path?</div>
                  <div className="font-body text-sm text-muted-foreground">
                    Bundle Fluency + Strategy + Action for $197 — save $40 vs. buying separately.
                  </div>
                </div>
                <Button asChild variant="secondary">
                  <Link to="/bundle">See the bundle</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Module outline */}
        {modules.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2">What's inside</h2>
              <p className="font-body text-muted-foreground mb-8">
                {modules.length} module{modules.length === 1 ? "" : "s"} — every module ends in something you can use in your district.
              </p>
              <ol className="space-y-4">
                {modules.map((m) => (
                  <li key={m.id}>
                    <Card>
                      <CardContent className="p-5 flex gap-4">
                        <div className="font-display text-2xl text-primary font-bold w-10 shrink-0">
                          {String(m.sequence_order).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold mb-1">{m.title}</h3>
                          {m.description && (
                            <p className="font-body text-sm text-muted-foreground">{m.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Who it's for */}
        {course.role_fit && course.role_fit.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">Who this is for</h2>
              <p className="font-body text-muted-foreground mb-6">
                Built for the full K-12 district leadership team. Resources inside the course are segmented by role, so each leader leaves with deliverables for their own seat.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.role_fit.map((r) => (
                  <li key={r} className="flex items-center gap-2 font-body">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="capitalize">{formatRole(r)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-8">Frequently asked</h2>
              <dl className="space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="font-display text-lg font-semibold mb-2">{f.q}</dt>
                    <dd className="font-body text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Card className="bg-primary text-primary-foreground p-8 lg:p-10 text-center">
              <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-90" />
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-3">
                Ready to start {course.title}?
              </h2>
              <p className="font-body text-primary-foreground/80 mb-6">
                Stop reading about AI. Start building tools you can actually use.
              </p>
              <Button variant="secondary" size="lg" onClick={handlePrimaryCta}>
                {primaryLabel}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PublicCourse;
