"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Activity,
  Calendar,
  Settings,
  Zap,
  GraduationCap,
  Users,
  Library,
  BarChart2,
  LucideIcon,
  Circle,
} from "lucide-react";

import { TenantContext } from "@/lib/tenant";

// Map string icon names from Convex to Lucide components
const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  graduationCap: GraduationCap,
  users: Users,
  library: Library,
  barChart: BarChart2,
  home: Home,
  bookOpen: BookOpen,
  activity: Activity,
  calendar: Calendar,
  settings: Settings,
};

interface DashboardSidebarProps {
  tenant: NonNullable<TenantContext>;
  appVersion: string;
}

const PILLAR_LABELS: Record<string, string> = {
  recruit: "RECRUIT",
  train: "TRAIN",
  sell: "SELL",
  team: "TEAM",
  account: "ACCOUNT",
};

// Fixed order of pillars
const PILLAR_ORDER = ["recruit", "train", "sell", "team", "account"];

export function DashboardSidebar({
  tenant,
  appVersion,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { theme, enabledFeatures } = tenant;

  // Filter out resource-hub from dynamic features since we hardcode it
  const dynamicFeatures = enabledFeatures?.filter(
    (f) => f.key !== "resource-hub",
  );

  // Group dynamic features by pillar
  const featuresByPillar = React.useMemo(() => {
    const grouped: Record<string, typeof dynamicFeatures> = {};
    for (const feature of dynamicFeatures ?? []) {
      const pillar = feature.pillar;
      if (!grouped[pillar]) grouped[pillar] = [];
      grouped[pillar].push(feature);
    }
    return grouped;
  }, [dynamicFeatures]);

  const renderLink = (name: string, href: string, iconName: string) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    const Icon = iconMap[iconName] || Circle;

    return (
      <Link
        key={name}
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-zinc-800/80 text-white"
            : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-zinc-500"}`}
        />
        {name}
      </Link>
    );
  };

  const renderSectionHeader = (title: string) => (
    <div className="px-3 mb-2 mt-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
      {title}
    </div>
  );

  return (
    <aside
      className="hidden md:flex w-64 flex-col border-r shrink-0"
      style={{
        backgroundColor: theme?.sidebarColor || "#1c1917", // Default to zinc-950/900-ish
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand area (optional, currently handled by header but added for structural completeness or if header is changed later) */}
      <div className="p-4 pt-6" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {/* Workspace (Core) */}
        {renderSectionHeader("WORKSPACE")}
        <nav className="space-y-1">
          {renderLink("Dashboard", "/dashboard", "home")}
          {renderLink(
            "Resource Hub",
            "/dashboard/account/resource-hub",
            "bookOpen",
          )}
        </nav>

        {/* Dynamic Pillars */}
        {PILLAR_ORDER.map((pillar) => {
          const features = featuresByPillar[pillar];
          if (!features || features.length === 0) return null;

          return (
            <div key={pillar}>
              {renderSectionHeader(PILLAR_LABELS[pillar] || pillar)}
              <nav className="space-y-1">
                {features.map((feature) =>
                  renderLink(feature.label, feature.href, feature.icon),
                )}
              </nav>
            </div>
          );
        })}

        {/* Insights */}
        {renderSectionHeader("INSIGHTS")}
        <nav className="space-y-1">
          {renderLink("Activity log", "/dashboard/activity-log", "activity")}
          {renderLink(
            "Scheduled drips",
            "/dashboard/scheduled-drips",
            "calendar",
          )}
        </nav>
      </div>

      {/* Footer */}
      <div
        className="p-4 mt-auto border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <nav className="space-y-1 mb-4">
          {renderLink("Hub settings", "/dashboard/hub-settings", "settings")}
        </nav>
        <div className="px-3 text-[11px] text-zinc-500">
          AscendOS · v{appVersion}
        </div>
      </div>
    </aside>
  );
}
