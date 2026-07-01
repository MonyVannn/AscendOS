"use client";

import * as React from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Bell, ChevronDown, HelpCircle, Menu, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardCommandMenu } from "@/components/dashboard/dashboard-command-menu";
import { TenantContext } from "@/lib/tenant";
import { ROLE_LABELS, UserRole } from "@/lib/roles";

interface DashboardHeaderProps {
  tenant: NonNullable<TenantContext>;
  appVersion: string;
}

export function DashboardHeader({ tenant, appVersion }: DashboardHeaderProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const { agency, theme, ghlConnected, user: dbUser } = tenant;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [mobileCommandOpen, setMobileCommandOpen] = React.useState(false);

  const title = agency?.name;
  const subtitle = `${agency?.name} · Admin Hub`;

  // Platform specific shortcut hint
  const [shortcutPrefix, setShortcutPrefix] = React.useState("⌘");
  React.useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      if (navigator.platform.toLowerCase().includes("win")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShortcutPrefix("Ctrl");
      }
    }
  }, []);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Prefer inline on desktop, dialog on mobile
        if (window.innerWidth >= 768) {
          setCommandOpen((open) => !open);
        } else {
          setMobileCommandOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="border-b bg-background px-4 md:px-8 py-3 flex items-center justify-between min-h-[64px]">
      {/* Left: Brand + mobile nav */}
      <div className="flex items-center gap-2 min-w-0">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 text-muted-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            showClose
            className="flex h-full max-h-[100dvh] flex-col gap-0 p-0 shadow-xl ring-1 ring-white/5 bg-sidebar text-sidebar-foreground border-sidebar-border"
          >
            <SheetTitle className="sr-only">Primary navigation</SheetTitle>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
              <DashboardNav
                tenant={tenant}
                appVersion={appVersion}
                onLinkNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary font-bold text-primary-foreground">
            {theme?.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={theme.logoUrl}
                alt={`${agency?.name ?? "Agency"} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              agency?.name?.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Middle: Search */}
      <div className="hidden md:flex relative max-w-md w-full ml-8 mr-auto">
        <DashboardCommandMenu 
          tenant={tenant} 
          open={commandOpen} 
          onOpenChange={setCommandOpen} 
          variant="inline"
        />
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={() => setMobileCommandOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Badge
          variant="outline"
          className={`hidden md:inline-flex gap-1.5 ${
            ghlConnected
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 py-3"
              : "bg-muted text-muted-foreground py-3"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ghlConnected ? "bg-green-500" : "bg-muted-foreground"
            }`}
          />
          {ghlConnected ? "GHL connected" : "GHL disconnected"}
        </Badge>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex text-muted-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>

        {isLoaded && clerkUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="pl-2 pr-1 gap-2 h-10 rounded-full hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarImage
                    src={clerkUser.imageUrl}
                    alt={clerkUser.fullName || ""}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {dbUser.name ? (
                      dbUser.name.split(" ").map(n => n.charAt(0)).slice(0, 2).join("").toUpperCase()
                    ) : (
                      <>{clerkUser.firstName?.charAt(0) || ""}{clerkUser.lastName?.charAt(0) || ""}</>
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">
                    {dbUser.name || clerkUser.fullName ||
                      clerkUser.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dbUser.role ? ROLE_LABELS[dbUser.role as UserRole] : "Member"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {dbUser.name || clerkUser.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile" className="cursor-pointer w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/appearance" className="cursor-pointer w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOutButton>
                <DropdownMenuItem className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        )}
      </div>

      <DashboardCommandMenu 
        tenant={tenant} 
        open={mobileCommandOpen} 
        onOpenChange={setMobileCommandOpen} 
        variant="dialog"
      />
    </header>
  );
}
