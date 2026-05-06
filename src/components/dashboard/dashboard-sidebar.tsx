"use client";

import * as React from "react";

import { TenantContext } from "@/lib/tenant";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

interface DashboardSidebarProps {
  tenant: NonNullable<TenantContext>;
  appVersion: string;
}

export function DashboardSidebar({
  tenant,
  appVersion,
}: DashboardSidebarProps) {
  const { theme } = tenant;

  return (
    <aside
      className="hidden md:flex w-64 flex-col border-r shrink-0"
      style={{
        backgroundColor: theme?.sidebarColor || "#1c1917",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <DashboardNav tenant={tenant} appVersion={appVersion} />
    </aside>
  );
}
