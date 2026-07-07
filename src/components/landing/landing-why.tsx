import { Layers, Workflow, Sparkles } from "lucide-react";
import { LandingSection } from "./landing-section";

const VALUE_PILLARS = [
  {
    icon: Layers,
    title: "Built for agency workflows",
    body: "Recruiting drips, field training, and resource sharing — not generic CRM clutter you have to bend into shape.",
  },
  {
    icon: Workflow,
    title: "Integrates with GoHighLevel",
    body: "Drips, webhooks, and templates live where your team already works. No rip-and-replace migration.",
  },
  {
    icon: Sparkles,
    title: "Grows with your team",
    body: "Enable features per agency, customize branding, and add tools as your operation scales.",
  },
];

export function LandingWhy() {
  return (
    <LandingSection id="why">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Why AscendOS?
            </h2>
            <p className="mb-6 text-lg text-[var(--landing-onyx-muted)]">
              Growing agencies run on scattered spreadsheets, manual follow-ups,
              and ad-hoc training. AscendOS replaces that patchwork with one hub
              where every agency gets its own branded dashboard, its own enabled
              tools, and its own view of what matters.
            </p>
            <p className="text-lg text-[var(--landing-onyx-muted)]">
              We built AscendOS so owners and ops leads can empower their teams
              to recruit, train, and sell with confidence — without babysitting
              a dozen disconnected systems.
            </p>
          </div>

          <div className="space-y-6">
            {VALUE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="flex gap-5 rounded-2xl border-l-4 border-[var(--landing-oceanic)] bg-[var(--landing-oceanic-tint)] p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--landing-oceanic)] text-[var(--landing-wheat)]">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold">{pillar.title}</h3>
                  <p className="text-sm text-[var(--landing-onyx-muted)]">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
