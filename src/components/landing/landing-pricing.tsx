import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingSection } from "./landing-section";

const TIERS = [
  {
    name: "Starter",
    positioning: "For single-team agencies getting organized",
    features: [
      "Agency dashboard",
      "Resource Hub",
      "Email templates",
      "Team management",
    ],
    cta: { label: "Get Started", href: "/sign-in" },
    highlighted: false,
  },
  {
    name: "Growth",
    positioning: "For agencies scaling recruitment and training",
    features: [
      "Everything in Starter",
      "Beast Mode drip automation",
      "Field Trainer program",
      "Activity log & insights",
    ],
    cta: { label: "Get Started", href: "/sign-in" },
    highlighted: true,
  },
  {
    name: "Enterprise",
    positioning: "For multi-agency operations at custom scale",
    features: [
      "Everything in Growth",
      "Custom GHL integrations",
      "Dedicated onboarding",
      "Priority support & SLA",
    ],
    cta: { label: "Contact us", href: "mailto:hello@ascendos.app" },
    highlighted: false,
  },
];

export function LandingPricing() {
  return (
    <LandingSection id="pricing" variant="tint">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Plans that grow with your agency
          </h2>
          <p className="text-lg text-[var(--landing-onyx-muted)]">
            Start with the essentials and enable more tools as your team scales.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-3xl bg-[var(--landing-wheat)] p-8 shadow-sm",
                tier.highlighted
                  ? "border-2 border-[var(--landing-oceanic)] shadow-lg md:-translate-y-3"
                  : "border border-black/5",
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--landing-nectarine)] px-4 py-1 text-xs font-bold tracking-wide text-[var(--landing-onyx)] uppercase">
                  Most popular
                </span>
              )}
              <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
              <p className="mb-6 text-sm text-[var(--landing-onyx-muted)]">
                {tier.positioning}
              </p>
              <p className="mb-8 text-3xl font-bold text-[var(--landing-oceanic)]">
                Contact for pricing
              </p>
              <ul className="mb-10 space-y-3 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-[var(--landing-oceanic)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={cn(
                  "mt-auto inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-opacity hover:opacity-85",
                  tier.highlighted
                    ? "bg-[var(--landing-nectarine)] text-[var(--landing-onyx)]"
                    : "bg-[var(--landing-oceanic)] text-[var(--landing-wheat)]",
                )}
              >
                {tier.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
