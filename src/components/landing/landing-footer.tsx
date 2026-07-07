import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Recruit", href: "#products" },
      { label: "Train", href: "#products" },
      { label: "Sell", href: "#products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#why" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/sign-in" },
      { label: "Terms", href: "/sign-in" },
      { label: "Log in", href: "/sign-in" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-[var(--landing-onyx)] py-16 text-[var(--landing-wheat)]">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--landing-nectarine)] text-xs font-bold text-[var(--landing-onyx)]">
                A
              </div>
              <span className="text-lg font-bold">AscendOS</span>
            </div>
            <p className="text-sm text-[var(--landing-wheat)]/60">Agency Hub</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-[var(--landing-wheat)]/50 uppercase">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {column.links.map((link) =>
                  link.href.startsWith("#") ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[var(--landing-wheat)]/70 transition-colors hover:text-[var(--landing-wheat)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[var(--landing-wheat)]/70 transition-colors hover:text-[var(--landing-wheat)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--landing-wheat)]/10 pt-8">
          <p className="text-sm text-[var(--landing-wheat)]/50">
            &copy; {new Date().getFullYear()} AscendOS &middot; Agency Hub. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
