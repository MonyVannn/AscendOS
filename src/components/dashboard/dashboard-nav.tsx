"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart2,
  BookOpen,
  Calendar,
  Circle,
  GraduationCap,
  Home,
  Library,
  LucideIcon,
  Settings,
  Users,
  Zap,
} from "lucide-react";

import { TenantContext } from "@/lib/tenant";

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

const PILLAR_LABELS: Record<string, string> = {
  recruit: "RECRUIT",
  train: "TRAIN",
  sell: "SELL",
  team: "TEAM",
  account: "ACCOUNT",
};

const PILLAR_ORDER = ["recruit", "train", "sell", "team", "account"];

export interface DashboardNavProps {
  tenant: NonNullable<TenantContext>;
  appVersion: string;
  /** Called after a nav link is activated (e.g. close mobile sheet). */
  onLinkNavigate?: () => void;
}

export function DashboardNav({
  tenant,
  appVersion,
  onLinkNavigate,
}: DashboardNavProps) {
  const pathname = usePathname();
  const { enabledFeatures } = tenant;

  const dynamicFeatures = enabledFeatures?.filter(
    (f) => f.key !== "resource-hub",
  );

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
        onClick={() => onLinkNavigate?.()}
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
    <div className="px-3 mb-2 mt-6 first:mt-0 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
      {title}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 pt-4 space-y-1">
        {renderSectionHeader("WORKSPACE")}
        <nav className="space-y-1">
          {renderLink("Dashboard", "/dashboard", "home")}
          {renderLink(
            "Resource Hub",
            "/dashboard/account/resource-hub",
            "bookOpen",
          )}
        </nav>

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

      <div
        className="p-4 mt-auto border-t shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <nav className="space-y-1 mb-4">
          {renderLink("Hub settings", "/dashboard/hub-settings", "settings")}
        </nav>
        <div className="px-3 text-[11px] text-zinc-500">
          AscendOS · v{appVersion}
        </div>
      </div>
    </div>
  );
}
