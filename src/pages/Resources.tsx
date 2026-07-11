import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";

type Category = "governance" | "strategy" | "classroom" | "leadership";

interface ResourceRow {
  id: string;
  slug: string;
  title: string;
  dek: string;
  cover_image_url: string | null;
  category: Category;
  published_at: string | null;
  read_time_min: number | null;
}

const SITE_URL = "https://edleaderforge.com";

const CATEGORY_LABELS: Record<Category, string> = {
  governance: "Governance",
  strategy: "Strategy",
  classroom: "Classroom",
  leadership: "Leadership",
};

const CATEGORIES: Category[] = ["governance", "strategy", "classroom", "leadership"];

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") as Category | null;
  const [posts, setPosts] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("resources")
        .select("id, slug, title, dek, cover_image_url, category, published_at, read_time_min")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (cancelled) return;
      setPosts((data as ResourceRow[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;
  const url = `${SITE_URL}/resources`;
  const description =
    "Practical articles on school district AI policy, AI for principals and superintendents, K-12 AI governance, and district AI strategy — from a practicing K-12 Director of Technology.";

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "K-12 AI Leadership Resources — The Leadership Forge",
    description,
    url,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>K-12 AI Leadership Resources: District AI Policy & Strategy | The Leadership Forge</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="K-12 AI Leadership Resources — District AI Policy & Strategy" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="pt-20 lg:pt-24">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <nav className="font-body text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Resources</span>
            </nav>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              K-12 AI Leadership Resources
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl">
              Field notes on school district AI policy, AI for principals and
              superintendents, K-12 AI governance, and the district AI strategy
              decisions actually sitting on a leader's desk.
            </p>
          </div>
        </section>

        <section className="py-8 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
                  !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70 text-foreground"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSearchParams({ category: c })}
                  className={`px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
                    activeCategory === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/70 text-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-body text-muted-foreground mb-4">
                  {activeCategory
                    ? `No posts yet in ${CATEGORY_LABELS[activeCategory]}.`
                    : "Resources are coming soon. Check back shortly."}
                </p>
                {activeCategory && (
                  <Button variant="outline" onClick={() => setSearchParams({})}>
                    See all resources
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((p) => (
                  <Link key={p.id} to={`/resources/${p.slug}`} className="group block">
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      {p.cover_image_url && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={p.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="capitalize">
                            {CATEGORY_LABELS[p.category]}
                          </Badge>
                          {p.read_time_min && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {p.read_time_min} min read
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {p.title}
                        </h2>
                        {p.dek && (
                          <p className="font-body text-sm text-muted-foreground line-clamp-3">{p.dek}</p>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-sm font-body text-primary">
                          Read article
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
