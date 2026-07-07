import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingSection } from "./landing-section";

export function LandingHero() {
  return (
    <LandingSection variant="oceanic" className="overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff6e910_1px,transparent_1px),linear-gradient(to_bottom,#fff6e910_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <div className="mb-8 inline-flex items-center rounded-full border border-[var(--landing-wheat)]/20 bg-[var(--landing-wheat)]/10 px-4 py-1.5 text-sm text-[var(--landing-wheat)]">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--landing-nectarine)]" />
          The operating system for high-performing agencies
        </div>

        <h1 className="mb-8 text-5xl font-bold tracking-tight text-balance md:text-7xl">
          Scale your agency
          <br className="hidden md:block" /> without the{" "}
          <span className="text-[var(--landing-nectarine)]">chaos.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl text-balance text-[var(--landing-wheat-muted)]">
          AscendOS unifies recruiting, training, and sales into one hub —
          automated drips, structured field training, and shared resources,
          connected to the GoHighLevel workflows you already run.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--landing-nectarine)] px-8 text-lg font-semibold text-[var(--landing-onyx)] transition-opacity hover:opacity-85 sm:w-auto"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a
            href="#products"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[var(--landing-wheat)]/30 px-8 text-lg font-medium text-[var(--landing-wheat)] transition-colors hover:bg-[var(--landing-wheat)]/10 sm:w-auto"
          >
            See how it works
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
