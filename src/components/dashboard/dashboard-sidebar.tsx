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
  return (
    <aside className="hidden md:flex w-64 flex-col border-r shrink-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
      <DashboardNav tenant={tenant} appVersion={appVersion} />
    </aside>
  );
}
