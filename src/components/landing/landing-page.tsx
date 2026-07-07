import "./landing-colors.css";

import { LandingHeader } from "./landing-header";
import { LandingTrustStrip } from "./landing-trust-strip";
import { LandingHero } from "./landing-hero";
import { LandingSocialProof } from "./landing-social-proof";
import { LandingProducts } from "./landing-products";
import { LandingWhy } from "./landing-why";
import { LandingPricing } from "./landing-pricing";
import { LandingFaq } from "./landing-faq";
import { LandingCta } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <div className="landing-page flex min-h-screen flex-col bg-[var(--landing-wheat)] font-sans text-[var(--landing-onyx)]">
      <LandingHeader />
      <LandingTrustStrip />
      <main className="flex-1">
        <LandingHero />
        <LandingSocialProof />
        <LandingProducts />
        <LandingWhy />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
