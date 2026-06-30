import { Link } from "react-router-dom";

const links = [
  { label: "Which one is you?", href: "#doors" },
  { label: "Pathway", href: "#pathway" },
  { label: "Waitlist", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy & Terms", href: "/privacy-terms" },
];

const FooterV2 = () => (
  <footer className="bg-navy text-white/60 py-[2.8rem] text-[0.86rem]">
    <div className="w-[min(1120px,100%-2.5rem)] mx-auto flex flex-col gap-[1.1rem] md:flex-row md:justify-between md:items-center">
      <div>
        <div className="font-display text-[1.05rem] text-white">
          Leadership <em className="not-italic italic text-gold">Forge</em>
        </div>
        <p className="mt-1">Built by a practicing K-12 Director of Technology. A PEKK Education program.</p>
      </div>
      <ul className="flex flex-wrap gap-[1.6rem] list-none">
        {links.map((l) => {
          const isInternal = l.href.startsWith("/");
          return (
            <li key={l.href}>
              {isInternal ? (
                <Link
                  to={l.href}
                  className="hover:text-[hsl(43_72%_66%)] transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="hover:text-[hsl(43_72%_66%)] transition-colors">
                  {l.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <div className="md:text-right">© 2026 PEKK Education LLC</div>
    </div>
  </footer>
);

export default FooterV2;
