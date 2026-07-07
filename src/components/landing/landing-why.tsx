import { LandingSection } from "./landing-section";
import { LandingBentoCard } from "./landing-bento-card";

export function LandingWhy() {
  return (
    <LandingSection id="why" className="overflow-hidden py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 max-w-3xl md:mb-16">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Why AscendOS?
          </h2>
          <p className="text-lg text-[var(--landing-onyx-muted)]">
            Replace scattered spreadsheets and manual follow-ups with one unified hub. We built AscendOS so owners can empower their teams to recruit, train, and sell with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Card 1 */}
          <LandingBentoCard
            label="Automation Forms"
            headline="Submit once."
            imageSrc="/landing/form.jpg"
            imageAlt="Field Trainer form in AscendOS"
            imageWidth={2010}
            imageHeight={1506}
            accentClass="bg-[var(--landing-bento-nectarine)]"
            className="h-[380px] md:h-[420px]"
          />

          {/* Bottom Row - Left Card */}
          <LandingBentoCard
            label="Agency Dashboard"
            headline="Your team at a glance."
            imageSrc="/landing/dashboard.jpg"
            imageAlt="AscendOS agency dashboard"
            imageWidth={2174}
            imageHeight={1180}
            accentClass="bg-[var(--landing-bento-oceanic)]"
            className="h-[380px] md:h-[420px]"
          />

          {/* Bottom Row - Right Card */}
          <LandingBentoCard
            label="Activity Log"
            headline="Every action, tracked."
            imageSrc="/landing/logs.jpg"
            imageAlt="AscendOS activity log"
            imageWidth={1440}
            imageHeight={1268}
            accentClass="bg-[var(--landing-bento-wheat)]"
            className="h-[380px] md:h-[420px]"
          />
        </div>
      </div>
    </LandingSection>
  );
}
