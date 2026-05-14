"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SettingsContext, SettingsDraft } from "./settings-context";
import { TenantContext } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { SettingsLivePreview } from "./settings-live-preview";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { invalidateRdProfileCache } from "@/lib/rd-profile-cache";
import { buildAgencyThemeStyle } from "@/lib/agency-theme-css-vars";
import { resolveAgencyTheme } from "@/lib/agency-theme-resolve";

interface SettingsShellProps {
  tenant: NonNullable<TenantContext>;
  children: React.ReactNode;
}

function getInitialDraft(tenant: NonNullable<TenantContext>): SettingsDraft {
  const resolved = resolveAgencyTheme(tenant.theme) || {
    primaryColor: "#0075de",
    accentColor: "#097fe8",
    pageBg: "#f6f5f4",
    sidebarBg: "#1F1E1C",
    bodyText: "#111827",
    cardBg: "#ffffff",
    cardInnerBg: "#f4f4f5",
    borderColor: "#e4e4e7",
    headingText: "#111827",
    mutedText: "#71717a",
    sidebarItemText: "#a1a1aa",
    sidebarSectionLabel: "#71717a",
    sidebarHoverBg: "rgba(255, 255, 255, 0.05)",
    sidebarActiveItemBg: "rgba(255, 255, 255, 0.1)",
    primaryForeground: "#ffffff",
  };

  return {
    profile: {
      name: tenant.user.name || "",
      bookingLink: tenant.user.bookingLink || "",
    },
    theme: {
      primaryColor: resolved.primaryColor,
      accentColor: resolved.accentColor,
      backgroundColor: resolved.pageBg,
      sidebarColor: resolved.sidebarBg,
      textColor: resolved.bodyText,

      sidebarBg: resolved.sidebarBg,
      sidebarItemText: resolved.sidebarItemText,
      sidebarSectionLabel: resolved.sidebarSectionLabel,
      sidebarHoverBg: resolved.sidebarHoverBg,
      sidebarActiveItemBg: resolved.sidebarActiveItemBg,

      pageBg: resolved.pageBg,
      cardBg: resolved.cardBg,
      cardInnerBg: resolved.cardInnerBg,
      borderColor: resolved.borderColor,

      headingText: resolved.headingText,
      bodyText: resolved.bodyText,
      mutedText: resolved.mutedText,

      primaryForeground: resolved.primaryForeground,

      logoUrl: tenant.theme?.logoUrl || "",
      logoStorageId: tenant.theme?.logoStorageId,
      faviconUrl: tenant.theme?.faviconUrl || "",
      faviconStorageId: tenant.theme?.faviconStorageId,
      fontFamily: tenant.theme?.fontFamily || "Inter",
      borderRadius: tenant.theme?.borderRadius || "8px",
    },
  };
}

export function SettingsShell({ tenant, children }: SettingsShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [draft, setDraft] = React.useState<SettingsDraft>(() => getInitialDraft(tenant));
  const [initialDraft, setInitialDraft] = React.useState<SettingsDraft>(() => getInitialDraft(tenant));
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);
  
  const updateMyProfile = useMutation(api.settings.updateMyProfile);
  const updateMyAgencyTheme = useMutation(api.settings.updateMyAgencyTheme);

  const isDirty = React.useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(initialDraft);
  }, [draft, initialDraft]);

  const discardDraft = React.useCallback(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const saveDraft = React.useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      // Validate booking link if present
      if (draft.profile.bookingLink && !draft.profile.bookingLink.startsWith("https://")) {
        throw new Error("Booking link must start with https://");
      }
      
      const isProfileDirty = JSON.stringify(draft.profile) !== JSON.stringify(initialDraft.profile);
      const isThemeDirty = JSON.stringify(draft.theme) !== JSON.stringify(initialDraft.theme);

      if (isProfileDirty) {
        await updateMyProfile({
          name: draft.profile.name.trim(),
          bookingLink: draft.profile.bookingLink.trim(),
        });
        invalidateRdProfileCache(tenant.user._id);
      }
      
      if (isThemeDirty) {
        const result = await updateMyAgencyTheme({
          primaryColor: draft.theme.primaryColor,
          accentColor: draft.theme.accentColor,
          backgroundColor: draft.theme.backgroundColor,
          sidebarColor: draft.theme.sidebarColor,
          textColor: draft.theme.textColor,
          
          sidebarBg: draft.theme.sidebarBg || undefined,
          sidebarItemText: draft.theme.sidebarItemText || undefined,
          sidebarSectionLabel: draft.theme.sidebarSectionLabel || undefined,
          sidebarHoverBg: draft.theme.sidebarHoverBg || undefined,
          sidebarActiveItemBg: draft.theme.sidebarActiveItemBg || undefined,

          pageBg: draft.theme.pageBg || undefined,
          cardBg: draft.theme.cardBg || undefined,
          cardInnerBg: draft.theme.cardInnerBg || undefined,
          borderColor: draft.theme.borderColor || undefined,

          headingText: draft.theme.headingText || undefined,
          bodyText: draft.theme.bodyText || undefined,
          mutedText: draft.theme.mutedText || undefined,

          primaryForeground: draft.theme.primaryForeground || undefined,

          logoUrl: draft.theme.logoUrl || undefined,
          logoStorageId: draft.theme.logoStorageId,
          faviconUrl: draft.theme.faviconUrl || undefined,
          faviconStorageId: draft.theme.faviconStorageId,
          fontFamily: draft.theme.fontFamily,
          borderRadius: draft.theme.borderRadius,
        });

        if (result.theme && tenant?.agency) {
          try {
            const cacheKey = `theme:${tenant.agency._id}`;
            const themeStyle = buildAgencyThemeStyle(result.theme, "RD");
            localStorage.setItem(cacheKey, JSON.stringify(themeStyle));
          } catch {
            // Ignore localStorage errors
          }
        }
      }

      setInitialDraft(draft);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      
      if (isThemeDirty) {
        // Theme changes affect layout vars, Next.js refresh to re-render server components
        router.refresh();
      }
    } catch (e: unknown) {
      console.error("Save failed:", e);
      const err = e as Error;
      alert(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [draft, initialDraft, isDirty, updateMyProfile, updateMyAgencyTheme, tenant, router]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDraft();
      } else if (e.key === "Escape") {
        discardDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDraft, discardDraft]);

  const isProfile = pathname.includes("/settings/profile");
  
  return (
    <SettingsContext.Provider value={{ draft, setDraft, setInitialDraft, isDirty, isSaving, saveDraft, discardDraft, tenant }}>
      <div className="flex flex-col h-full  dark:bg-zinc-950  overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1">
              Settings · {isProfile ? "Profile" : "Appearance"}
            </div>
            <h1 className="text-xl font-bold">{isProfile ? "Profile" : "Appearance"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm font-medium bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
                <span className="text-xs opacity-60 hidden sm:inline ml-1 font-mono tracking-tighter">Esc to discard</span>
              </div>
            )}
            {showSaved && !isDirty && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Saved
              </div>
            )}
            <Button
              onClick={saveDraft}
              disabled={!isDirty || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] transition-all"
            >
              {isSaving ? "Saving..." : "Save changes"}
              <span className="ml-2 text-[10px] opacity-60 font-mono tracking-tighter hidden sm:inline bg-white/10 px-1 py-0.5 rounded">⌘S</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main content + Sub-nav */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className="flex px-6 pt-6 pb-2 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 space-x-6 shrink-0">
              <Link 
                href="/dashboard/settings/profile"
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${isProfile ? "border-blue-600 text-zinc-900 dark:text-white" : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Profile
              </Link>
              <Link 
                href="/dashboard/settings/appearance"
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${!isProfile ? "border-blue-600 text-zinc-900 dark:text-white" : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Appearance
              </Link>
            </div>
            <div className="px-6 pb-12 max-w-2xl w-full">
              {children}
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="w-[380px] shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 hidden lg:block overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Live Preview</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                {isDirty ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-amber-600 dark:text-amber-500">Unsaved</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-500">Synced</span>
                  </>
                )}
              </div>
            </div>
            <SettingsLivePreview isProfile={isProfile} />
          </div>
        </div>
      </div>
    </SettingsContext.Provider>
  );
}
