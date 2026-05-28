import * as React from "react";
import Link from "next/link";
import { Building2, PlusCircle, UserPlus, ShieldAlert, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminQuickActions({ unprovisionedCount }: { unprovisionedCount: number }) {
  const actions = [
    {
      label: "New Agency",
      href: "/admin/agencies/new",
      icon: PlusCircle,
      description: "Provision a new tenant workspace",
    },
    {
      label: "Assign Users",
      href: "/admin/assign",
      icon: UserPlus,
      description: "Map Clerk users to agencies",
      badge: unprovisionedCount > 0 ? unprovisionedCount : undefined,
    },
    {
      label: "All Agencies",
      href: "/admin/agencies",
      icon: Building2,
      description: "Manage existing tenants",
    },
    {
      label: "Platform Admins",
      href: "/admin/platform-admins",
      icon: ShieldAlert,
      description: "Manage super admin access",
    },
    {
      label: "Webhook Logs",
      href: "/admin/webhooks",
      icon: Webhook,
      description: "View global submission history",
    },
  ];

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <action.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {action.label}
                </span>
                {action.badge !== undefined && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-transparent h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px]">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}