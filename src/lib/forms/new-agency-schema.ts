import type { input } from "zod";
import { z } from "zod";

export const availableFeatures = [
  "beast-mode-drip",
  "field-trainer",
  "onboarding-drip",
  "resource-hub",
  "agent-gradebook",
] as const;

const emptyOrUrl = (message: string) =>
  z.union([
    z.literal(""),
    z.string().trim().min(1).url(message),
  ]);

export const agencyThemeSchema = z.object({
  primaryColor: z.string().trim(),
  accentColor: z.string().trim(),
  backgroundColor: z.string().trim(),
  sidebarColor: z.string().trim(),
  textColor: z.string().trim().optional(), // Adding this here just to match other schemas, but optional
  
  sidebarBg: z.string().trim().optional(),
  sidebarItemText: z.string().trim().optional(),
  sidebarSectionLabel: z.string().trim().optional(),
  sidebarHoverBg: z.string().trim().optional(),
  sidebarActiveItemBg: z.string().trim().optional(),

  pageBg: z.string().trim().optional(),
  cardBg: z.string().trim().optional(),
  cardInnerBg: z.string().trim().optional(),
  borderColor: z.string().trim().optional(),

  headingText: z.string().trim().optional(),
  bodyText: z.string().trim().optional(),
  mutedText: z.string().trim().optional(),

  primaryForeground: z.string().trim().optional(),

  logoUrl: emptyOrUrl("Must be a valid URL"),
  faviconUrl: emptyOrUrl("Must be a valid URL"),
  fontFamily: z.string().trim(),
  borderRadius: z.string().trim(),
  dashboardTitle: z.string().trim(),
});

export const newAgencySchema = z.object({
  name: z
    .string()
    .trim()
    .refine((v) => v.length > 0, { message: "Required" }),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length > 0, { message: "Required" })
    .refine((v) => /^[a-z0-9-]+$/.test(v), {
      message: "Use lowercase letters, numbers, and hyphens only.",
    }),
  ghlLocationId: z
    .string()
    .trim()
    .refine((v) => v.length > 0, { message: "Required" }),
  ghlWebhookUrl: emptyOrUrl("Must be a valid URL"),
  ghlAccessToken: z
    .string()
    .trim()
    .refine((v) => v.length > 0, { message: "Required" }),
  featureKeys: z.array(z.enum(availableFeatures)),
  theme: agencyThemeSchema.optional(),
});

export type NewAgencyFormValues = z.infer<typeof newAgencySchema>;

/** Form state shape validated by TanStack (`StandardSchemaV1`) — matches Zod parse input. */
export type NewAgencyFormInput = input<typeof newAgencySchema>;
