import { LandingSection } from "./landing-section";

const STAT_BADGES = [
  "Multi-tenant by design",
  "GHL-connected workflows",
  "Per-agency branding",
];

export function LandingSocialProof() {
  return (
    <LandingSection className="border-b border-[var(--landing-oceanic)]/10">
      <div className="container mx-auto px-4 py-12">
        <p className="mb-6 text-center text-sm font-medium tracking-wider text-[var(--landing-onyx-muted)] uppercase">
          Trusted by growing agencies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {STAT_BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[var(--landing-oceanic)]/15 px-5 py-2 text-sm font-medium text-[var(--landing-onyx-muted)]"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
