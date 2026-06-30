import { Mail, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-charcoal flex items-center justify-center">
                <span className="text-burnt-orange font-display font-bold text-lg">LF</span>
              </div>
              <span className="font-display font-semibold text-lg">The Leadership Forge</span>
            </div>
            <p className="font-body text-white/50 max-w-md leading-relaxed">
              A professional development system helping K-12 leaders navigate AI transformation with clarity, strategy, and deliverables.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="font-body text-white/50 hover:text-burnt-orange transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#outcomes" className="font-body text-white/50 hover:text-burnt-orange transition-colors">
                  Impact &amp; Outcomes
                </a>
              </li>
              <li>
                <a href="mailto:hello@theleadershipforge.com" className="font-body text-white/50 hover:text-burnt-orange transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy-terms" className="font-body text-white/50 hover:text-burnt-orange transition-colors">
                  Privacy &amp; Terms
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@theleadershipforge.com"
                  className="font-body text-white/50 hover:text-burnt-orange transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Get in Touch</span>
                </a>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-burnt-orange transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-sm text-white/40">© {currentYear} The Leadership Forge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy-terms" className="font-body text-sm text-white/40 hover:text-burnt-orange transition-colors">
              Privacy &amp; Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
