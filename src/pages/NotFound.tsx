import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 Not Found — EdLeaderForge</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to EdLeaderForge to explore AI leadership courses for K-12 administrators." />
        <meta name="robots" content="noindex,follow" />
        <meta property="og:title" content="404 Not Found — EdLeaderForge" />
        <meta property="og:description" content="The page you're looking for doesn't exist on EdLeaderForge." />
        <link rel="canonical" href={`https://edleaderforge.com${location.pathname}`} />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
