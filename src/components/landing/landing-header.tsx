import Link from "next/link";

const NAV_LINKS = [
  { label: "Product", href: "#products" },
  { label: "About", href: "#why" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--landing-oceanic)]/10 bg-[var(--landing-wheat)]/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--landing-oceanic)] text-sm font-bold text-[var(--landing-wheat)]">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--landing-onyx)]">
            AscendOS
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--landing-onyx-muted)] transition-colors hover:text-[var(--landing-onyx)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--landing-onyx-muted)] transition-colors hover:text-[var(--landing-onyx)]"
          >
            Log in
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-[var(--landing-nectarine)] px-5 py-2 text-sm font-semibold text-[var(--landing-onyx)] transition-opacity hover:opacity-85"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
