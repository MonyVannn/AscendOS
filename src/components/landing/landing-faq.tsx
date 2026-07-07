"use client";

import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { LandingSection } from "./landing-section";

const FAQS = [
  {
    question: "What is AscendOS?",
    answer:
      "AscendOS is an agency hub that unifies recruiting, training, and sales operations into one platform. Each agency gets its own branded dashboard with the tools it needs enabled.",
  },
  {
    question: "Who is AscendOS built for?",
    answer:
      "Agency owners and operations leads running teams of producers or agents — especially those who want structured recruiting drips, field training programs, and shared sales resources without juggling multiple systems.",
  },
  {
    question: "Do I need GoHighLevel (GHL) to use AscendOS?",
    answer:
      "AscendOS is designed to connect to your GoHighLevel workflows for drips, webhooks, and email templates. Core features like the Resource Hub and dashboard work independently, but automation tools shine with a GHL connection.",
  },
  {
    question: "How does onboarding work for a new agency?",
    answer:
      "After your agency is provisioned, an admin assigns roles to your team members as they sign up. Your agency's tools, branding, and integrations are configured from the admin panel — no technical setup required on your end.",
  },
  {
    question: "Can I enable only certain tools?",
    answer:
      "Yes. Features are enabled per agency, so you can run Field Trainer without Beast Mode drips, or start with just the Resource Hub and add automation later.",
  },
  {
    question: "Is my agency's data isolated from other agencies?",
    answer:
      "Yes. AscendOS is multi-tenant by design — every agency's data, branding, and integrations are scoped to that agency and invisible to others.",
  },
  {
    question: "Can we customize branding for our agency?",
    answer:
      "Yes. Each agency can customize its dashboard theme, including colors and branding, so the hub feels like your own.",
  },
  {
    question: "How do I upgrade my plan?",
    answer:
      "Reach out to us and we'll enable the additional features for your agency — upgrades take effect without downtime or migration.",
  },
];

export function LandingFaq() {
  return (
    <LandingSection id="faq">
      <div className="container mx-auto max-w-3xl px-4 py-24 md:py-32">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="text-lg text-[var(--landing-onyx-muted)]">
            Everything agency owners ask before getting started.
          </p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-3">
          {FAQS.map((faq) => (
            <Accordion.Item
              key={faq.question}
              value={faq.question}
              className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--landing-oceanic-tint)]"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between px-6 py-4 text-left font-semibold">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-[var(--landing-oceanic)] transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="px-6 pb-5 text-[var(--landing-onyx-muted)]">
                  {faq.answer}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </LandingSection>
  );
}
