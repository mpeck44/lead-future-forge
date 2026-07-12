import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderInfo {
  status: string;
  course_slug: string | null;
  course_title: string | null;
  bundle_key: string | null;
  receipt_url: string | null;
}

const CheckoutReturn = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [info, setInfo] = useState<OrderInfo | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status, receipt_url, bundle_key, courses(slug, title)")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (cancelled) return;
      if (data) {
        setInfo({
          status: data.status as string,
          course_slug: (data.courses as any)?.slug ?? null,
          course_title: (data.courses as any)?.title ?? null,
          bundle_key: (data.bundle_key as string) ?? null,
          receipt_url: (data.receipt_url as string) ?? null,
        });
        if (data.status === "paid") return;
      }
      if (attempts < 15) {
        setAttempts((a) => a + 1);
        timer = setTimeout(poll, 1500);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, attempts]);

  const paid = info?.status === "paid";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Payment complete — The Leadership Forge</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main className="pt-24 container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            {paid ? (
              <>
                <CheckCircle2 className="h-14 w-14 text-primary mx-auto mb-4" />
                <h1 className="font-display text-3xl font-bold mb-3">You're enrolled</h1>
                <p className="font-body text-muted-foreground mb-6">
                  {info?.bundle_key
                    ? "Access to all three bundle courses is unlocked."
                    : info?.course_title
                      ? `Access to ${info.course_title} is unlocked.`
                      : "Access to your course is unlocked."}{" "}
                  A receipt is on its way to your inbox.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {info?.bundle_key ? (
                    <Button asChild size="lg">
                      <Link to="/my-courses">
                        Go to my courses <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    info?.course_slug && (
                      <Button asChild size="lg">
                        <Link to={`/course/${info.course_slug}`}>
                          Start the course <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )
                  )}
                  {info?.receipt_url && (
                    <Button asChild variant="outline" size="lg">
                      <a href={info.receipt_url} target="_blank" rel="noreferrer">
                        View receipt
                      </a>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <h1 className="font-display text-2xl font-bold mb-3">Finalizing your enrollment…</h1>
                <p className="font-body text-muted-foreground">
                  This usually takes a few seconds. Don't close this tab.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutReturn;
