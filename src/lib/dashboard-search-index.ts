import { TenantContext } from "@/lib/tenant";

export type NavSearchItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  pillar?: string;
  description?: string;
};

const STATIC_NAV_ITEMS: NavSearchItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home", pillar: "WORKSPACE" },
  { id: "resource-hub", label: "Resource Hub", href: "/dashboard/account/resource-hub", icon: "bookOpen", pillar: "WORKSPACE" },
  { id: "timeline", label: "Field Trainer timeline", href: "/dashboard/field-trainer-timeline", icon: "columns", pillar: "INSIGHTS" },
  { id: "activity", label: "Activity log", href: "/dashboard/activity-log", icon: "activity", pillar: "INSIGHTS" },
  { id: "drips", label: "Scheduled drips", href: "/dashboard/scheduled-drips", icon: "calendar", pillar: "INSIGHTS" },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings", pillar: "WORKSPACE" },
];

export function buildNavSearchIndex(tenant: NonNullable<TenantContext>): NavSearchItem[] {
  const dynamicFeatures = tenant.enabledFeatures?.filter(
    (f) => f.key !== "resource-hub"
  ) || [];

  const dynamicItems: NavSearchItem[] = dynamicFeatures.map((f) => ({
    id: f.key,
    label: f.label,
    href: f.href,
    icon: f.icon,
    pillar: f.pillar,
  }));

  return [...STATIC_NAV_ITEMS, ...dynamicItems];
}
