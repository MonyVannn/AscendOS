import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingSection } from "./landing-section";

export function LandingCta() {
  return (
    <LandingSection variant="nectarine">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center md:py-20">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to ascend your agency?
        </h2>
        <Link
          href="/sign-in"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--landing-onyx)] px-8 text-lg font-semibold text-[var(--landing-wheat)] transition-opacity hover:opacity-85"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </LandingSection>
  );
}
