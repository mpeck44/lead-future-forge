import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

type Category = "governance" | "strategy" | "classroom" | "leadership";

interface ResourceFull {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body_html: string;
  cover_image_url: string | null;
  category: Category;
  published_at: string | null;
  read_time_min: number | null;
  author_name: string;
  updated_at: string;
}

interface RelatedRow {
  id: string;
  slug: string;
  title: string;
  dek: string;
  category: Category;
  cover_image_url: string | null;
  read_time_min: number | null;
}

const SITE_URL = "https://lead-future-forge.lovable.app";

const CATEGORY_LABELS: Record<Category, string> = {
  governance: "Governance",
  strategy: "Strategy",
  classroom: "Classroom",
  leadership: "Leadership",
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
};

const ResourceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ResourceFull | null>(null);
  const [related, setRelated] = useState<RelatedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("id, slug, title, dek, body_html, cover_image_url, category, published_at, read_time_min, author_name, updated_at")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data as ResourceFull);
      const { data: rel } = await supabase
        .from("resources")
        .select("id, slug, title, dek, category, cover_image_url, read_time_min")
        .eq("status", "published")
        .eq("category", (data as ResourceFull).category)
        .neq("id", (data as ResourceFull).id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (cancelled) return;
      setRelated((rel as RelatedRow[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Article not found</h1>
          <Button asChild>
            <Link to="/resources">Browse all resources</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `${SITE_URL}/resources/${post.slug}`;
  const description = post.dek || `${post.title} — by ${post.author_name} on The Leadership Forge.`;
  const ogImage = post.cover_image_url || `${SITE_URL}/og-image.jpg`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: ogImage,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author_name,
      jobTitle: "K-12 Director of Technology",
    },
    publisher: {
      "@type": "Organization",
      name: "The Leadership Forge",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: CATEGORY_LABELS[post.category],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const sanitized = sanitizeHtml(post.body_html || "");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | The Leadership Forge</title>
        <meta name="description" content={description.slice(0, 158)} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description.slice(0, 158)} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:author" content={post.author_name} />
        <meta property="article:section" content={CATEGORY_LABELS[post.category]} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="pt-20 lg:pt-24">
        <article>
          <header className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
              <nav className="font-body text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-foreground">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/resources" className="hover:text-foreground">Resources</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{post.title}</span>
              </nav>
              <div className="mb-4">
                <Badge variant="secondary">{CATEGORY_LABELS[post.category]}</Badge>
              </div>
              <h1 className="font-display text-3xl lg:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
              {post.dek && (
                <p className="font-body text-lg text-muted-foreground mb-6">{post.dek}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-body">
                <span>By {post.author_name}</span>
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                {post.read_time_min && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.read_time_min} min read
                  </span>
                )}
              </div>
            </div>
          </header>

          {post.cover_image_url && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl -mt-4 lg:-mt-6 mb-8">
              <img
                src={post.cover_image_url}
                alt=""
                className="w-full rounded-lg shadow-md aspect-[16/9] object-cover"
              />
            </div>
          )}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-8 lg:py-12">
            <div
              className="prose prose-slate max-w-none font-body prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </div>
        </article>

        {related.length > 0 && (
          <section className="py-12 bg-muted/30 border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
              <h2 className="font-display text-2xl font-bold mb-6">More from {CATEGORY_LABELS[post.category]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link key={r.id} to={`/resources/${r.slug}`} className="group block">
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      {r.cover_image_url && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img src={r.cover_image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-display text-base font-semibold mb-2 group-hover:text-primary">{r.title}</h3>
                        {r.dek && <p className="font-body text-xs text-muted-foreground line-clamp-2">{r.dek}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <Button asChild variant="outline">
              <Link to="/resources">
                Back to all resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceDetail;
