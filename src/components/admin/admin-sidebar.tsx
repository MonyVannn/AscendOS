"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Webhook,
  Settings,
  FileText,
  LogOut,
  User,
} from "lucide-react";

import { TenantContext } from "@/lib/tenant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminSidebarProps {
  tenant: NonNullable<TenantContext>;
}

export function AdminSidebar({ tenant }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user: clerkUser, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const unprovisionedUsers = useQuery(
    api.admin.listUnprovisionedUsers,
    isAuthenticated ? ({ refreshNonce: 0 } as const) : "skip",
  );

  const operationsNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Agencies", href: "/admin/agencies", icon: Building2 },
    {
      name: "Assign Users",
      href: "/admin/assign",
      icon: UserPlus,
      badge: unprovisionedUsers?.length,
    },
    { name: "Webhook Logs", href: "/admin/webhooks", icon: Webhook },
  ];

  const systemNav = [
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Audit Trail", href: "/admin/audit", icon: FileText },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-zinc-950 text-zinc-300 border-r border-zinc-800">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
          A
        </div>
        <div className="">
          <span className="font-bold text-white text-lg tracking-tight">
            AscendOS
          </span>
          <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
            Control Plane
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3">
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Operations
          </div>
          <nav className="space-y-1">
            {operationsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/50 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-zinc-500"}`}
                    />
                    {item.name}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-600 hover:bg-blue-600 text-white border-transparent h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            System
          </div>
          <nav className="space-y-1">
            {systemNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/50 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-zinc-500"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-800/50">
        {isLoaded && clerkUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/50 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-9 w-9 border border-zinc-700 bg-zinc-800">
                  <AvatarImage
                    src={clerkUser.imageUrl}
                    alt={clerkUser.fullName || ""}
                  />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {clerkUser.firstName?.charAt(0) || ""}
                    {clerkUser.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-white truncate">
                    {clerkUser.fullName ||
                      clerkUser.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-xs text-zinc-500 truncate">
                    {clerkUser.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge
                  variant="outline"
                  className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] uppercase font-bold px-1.5 py-0"
                >
                  {tenant.user?.role === "SUPER_ADMIN"
                    ? "SUPER"
                    : tenant.user?.role}
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300"
            >
              <DropdownMenuLabel className="font-normal text-zinc-400">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {clerkUser.fullName}
                  </p>
                  <p className="text-xs leading-none text-zinc-500">
                    {clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <SignOutButton>
                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-zinc-800 rounded animate-pulse w-1/2" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
