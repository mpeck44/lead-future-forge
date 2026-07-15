import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import FooterV2 from "@/components/landing/FooterV2";
import { Mail } from "lucide-react";

const pageUrl = "https://edleaderforge.com/privacy-terms";

const PrivacyTerms = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy &amp; Terms of Service | The Leadership Forge</title>
        <meta name="description" content="Privacy Policy and Terms of Service for The Leadership Forge — professional development for K-12 educational leaders. Operated by Peck Education LLC." />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Privacy Policy &amp; Terms of Service — The Leadership Forge" />
        <meta property="og:description" content="Read the Privacy Policy and Terms of Service for The Leadership Forge." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://edleaderforge.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy & Terms of Service",
          "url": pageUrl,
          "isPartOf": {
            "@type": "WebSite",
            "name": "The Leadership Forge",
            "url": "https://edleaderforge.com/"
          }
        })}</script>
      </Helmet>

      <Header />

      <main className="pt-24 lg:pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Privacy Policy &amp; Terms of Service
              </h1>
              <p className="font-body text-muted-foreground">
                Effective Date: June 1, 2026
              </p>
            </header>

            <nav
              aria-label="Legal document sections"
              className="sticky top-20 z-30 bg-background/95 backdrop-blur-sm border-y border-border py-4 mb-12"
            >
              <ul className="flex flex-wrap gap-4 font-body text-sm">
                <li>
                  <a
                    href="#privacy-policy"
                    onClick={(e) => handleAnchorClick(e, "privacy-policy")}
                    className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms-of-service"
                    onClick={(e) => handleAnchorClick(e, "terms-of-service")}
                    className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </nav>

            <article id="privacy-policy" className="mb-16 scroll-mt-28">
              <div className="prose prose-stone max-w-none font-body">
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Privacy Policy</h2>
                <p className="text-muted-foreground mb-6">The Leadership Forge</p>

                <p className="mb-6">
                  At The Leadership Forge, we are committed to protecting your privacy while providing valuable professional development for K-12 educational leaders.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Information We Collect</h3>
                <p className="mb-3">We collect information you provide when you:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Create an account or enroll in a course</li>
                  <li>Complete the AI Readiness &amp; Equity Audit</li>
                  <li>Enroll in or access courses</li>
                  <li>Contact us for support</li>
                </ul>
                <p className="mb-6">
                  This may include your name, email address, professional title, school/district affiliation, and responses to audit or course activities.
                </p>
                <p className="mb-6">
                  We also automatically collect basic usage data (pages visited, time spent, device type) through Google Analytics to improve the platform.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">How We Use Your Information</h3>
                <ul className="list-disc pl-6 space-y-1 mb-6">
                  <li>To deliver and personalize your learning experience</li>
                  <li>To generate your AI Readiness &amp; Equity Audit results and recommended pathways</li>
                  <li>To communicate important updates, course access, and platform changes</li>
                  <li>To improve our courses and platform based on usage patterns</li>
                  <li>To respond to your inquiries</li>
                </ul>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Sharing Your Information</h3>
                <p className="mb-3">We do not sell your personal information.</p>
                <p className="mb-3">We may share data only in these limited cases:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>With service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements</li>
                  <li>When required by law</li>
                  <li>In the event of a business transfer (merger, acquisition)</li>
                </ul>
                <p className="mb-6">
                  District-level or aggregated data (never individual identifiable information) may be used in anonymized research or reporting.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Data Security</h3>
                <p className="mb-6">
                  We use industry-standard security measures to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Your Rights</h3>
                <p className="mb-3">You can:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Access, correct, or delete your personal information</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request export of your data</li>
                  <li>
                    Contact us at{" "}
                    <a href="mailto:contact@peckeducation.com" className="text-burnt-orange hover:underline">
                      contact@peckeducation.com
                    </a>{" "}
                    to exercise these rights.
                  </li>
                </ul>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Children’s Privacy</h3>
                <p className="mb-6">
                  This platform is intended for adult educational leaders. We do not knowingly collect data from children under 13.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Cookies and Tracking</h3>
                <p className="mb-6">
                  We use essential cookies for site functionality and analytics cookies (Google Analytics) to understand usage. You can manage cookie preferences through your browser settings.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Changes to This Policy</h3>
                <p className="mb-6">
                  We may update this Privacy Policy occasionally. We will notify you of material changes via email or on the platform.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">Contact Us</h3>
                <p className="mb-2">Questions about this Privacy Policy?</p>
                <p className="mb-1">
                  Email:{" "}
                  <a href="mailto:contact@peckeducation.com" className="text-burnt-orange hover:underline inline-flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    contact@peckeducation.com
                  </a>
                </p>
                <p className="text-muted-foreground">The Leadership Forge – Built by Peck Education LLC</p>
              </div>
            </article>

            <article id="terms-of-service" className="scroll-mt-28">
              <div className="prose prose-stone max-w-none font-body">
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Terms of Service</h2>
                <p className="text-muted-foreground mb-6">The Leadership Forge</p>

                <p className="mb-6">
                  Welcome to The Leadership Forge. By accessing or using our platform, you agree to these Terms of Service.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">1. Acceptance of Terms</h3>
                <p className="mb-6">
                  These Terms govern your use of The Leadership Forge website, courses, tools, and services (collectively, the “Platform”). The Platform is operated by Peck Education LLC.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">2. Who Can Use the Platform</h3>
                <p className="mb-6">
                  The Leadership Forge is designed for K-12 educational leaders, administrators, and related professionals. By using the Platform, you represent that you are at least 18 years old and are using it in a professional capacity.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">3. User Accounts and Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1 mb-6">
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You agree to provide accurate and complete information when creating an account or completing forms (such as the AI Readiness Audit).</li>
                  <li>You are responsible for all activity that occurs under your account.</li>
                </ul>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">4. Use of the Platform</h3>
                <p className="mb-3">You may use the Platform only for lawful, professional purposes. You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1 mb-6">
                  <li>Share login credentials with others</li>
                  <li>Attempt to gain unauthorized access to any part of the Platform</li>
                  <li>Copy, modify, or distribute course content without permission (except for your personal, professional use of generated artifacts)</li>
                  <li>Use the Platform in a way that violates applicable laws or infringes on others’ rights</li>
                </ul>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">5. Intellectual Property</h3>
                <p className="mb-3">
                  The Platform and its original content, features, and functionality are owned by Peck Education LLC and protected by copyright and other intellectual property laws.
                </p>
                <p className="mb-6">
                  You retain ownership of any artifacts or documents you create using the tools (e.g., your 3-Year Roadmap, Governance Framework, etc.). We grant you a limited license to use them for your professional work.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">6. Payments and Refunds</h3>
                <ul className="list-disc pl-6 space-y-1 mb-6">
                  <li>Course fees are listed on the Platform.</li>
                  <li>All sales are final unless otherwise stated. Refunds may be considered on a case-by-case basis for technical issues.</li>
                </ul>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">7. Termination</h3>
                <p className="mb-6">
                  We may suspend or terminate your access to the Platform at our discretion if you violate these Terms.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">8. Disclaimers</h3>
                <p className="mb-6">
                  The Platform is provided “as is.” While we strive for accuracy and usefulness, we do not guarantee specific outcomes or results from using our courses or tools. Educational leadership decisions remain your responsibility.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">9. Limitation of Liability</h3>
                <p className="mb-6">
                  To the fullest extent permitted by law, Peck Education LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">10. Changes to Terms</h3>
                <p className="mb-6">
                  We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new Terms.
                </p>

                <h3 className="font-display text-xl font-semibold text-foreground mt-8 mb-3">11. Governing Law</h3>
                <p className="mb-6">
                  These Terms are governed by the laws of the State of Pennsylvania, United States.
                </p>
              </div>
            </article>

            <p className="mt-16 text-sm text-muted-foreground font-body border-t border-border pt-6">
              This page is maintained by Peck Education LLC to answer common privacy and legal questions about The Leadership Forge. The information here is not legal advice and may be updated periodically.
            </p>
          </div>
        </div>
      </main>

      <FooterV2 />
    </div>
  );
};

export default PrivacyTerms;
