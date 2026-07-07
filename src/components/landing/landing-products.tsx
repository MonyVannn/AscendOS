import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { LandingSection } from "./landing-section";

const MODULES = [
  {
    icon: Users,
    title: "Recruit",
    headline: "Recruit top talent",
    body: "Identify and onboard the right people with automated Beast Mode drips, onboarding automation, and full pipeline visibility.",
    bullets: ["Beast Mode drip automation", "Streamlined onboarding", "Pipeline visibility"],
  },
  {
    icon: ShieldCheck,
    title: "Train",
    headline: "Train agents faster",
    body: "Put every new agent on a structured Field Trainer curriculum with timeline tracking and trainer matching built in.",
    bullets: ["Field Trainer curriculum", "Timeline tracking", "Trainer matching"],
  },
  {
    icon: TrendingUp,
    title: "Sell",
    headline: "Equip your team to close",
    body: "Give producers a Resource Hub of templates, shareable assets, and email tools so every deal moves faster.",
    bullets: ["Resource Hub library", "Email templates", "Shareable assets"],
  },
];

export function LandingProducts() {
  return (
    <LandingSection id="products" variant="tint">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Everything your agency runs on
          </h2>
          <p className="text-lg text-[var(--landing-onyx-muted)]">
            Three pillars, one hub. Enable the tools your agency needs and skip
            the ones it doesn&apos;t.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {MODULES.map((mod) => (
            <div
              key={mod.title}
              className="flex flex-col rounded-3xl border border-black/5 bg-[var(--landing-wheat)] p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--landing-oceanic)] text-[var(--landing-wheat)]">
                <mod.icon className="h-6 w-6" />
              </div>
              <p className="mb-1 text-sm font-semibold tracking-wider text-[var(--landing-oceanic)] uppercase">
                {mod.title}
              </p>
              <h3 className="mb-3 text-2xl font-bold">{mod.headline}</h3>
              <p className="mb-6 text-[var(--landing-onyx-muted)]">{mod.body}</p>
              <ul className="mb-8 space-y-2 text-sm text-[var(--landing-onyx-muted)]">
                {mod.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-[var(--landing-oceanic)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center rounded-full bg-[var(--landing-nectarine)] px-5 py-2 text-sm font-semibold text-[var(--landing-onyx)] transition-opacity hover:opacity-85"
                >
                  Get Started
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center text-sm font-medium text-[var(--landing-oceanic)] hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
