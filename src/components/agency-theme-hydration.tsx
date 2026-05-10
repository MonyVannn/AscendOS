"use client";

import { useEffect, useLayoutEffect } from "react";
import { TenantContext } from "@/lib/tenant";

interface AgencyThemeHydrationProps {
  tenant: TenantContext | null;
}

export function AgencyThemeHydration({ tenant }: AgencyThemeHydrationProps) {
  // We use useLayoutEffect to run synchronously before paint on client navigations
  useLayoutEffect(() => {
    if (!tenant?.agency || tenant.user?.role !== "RD") return;

    const cacheKey = `theme:${tenant.agency._id}`;
    
    // On mount, if we have a cached theme, apply it immediately to prevent flicker
    // The server-rendered HTML already has the correct theme from the initial request,
    // but on client-side navigations, this ensures the theme is applied before the
    // server component payload arrives.
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const themeVars = JSON.parse(cached);
        const html = document.documentElement;
        
        // Only apply if the server hasn't already applied the exact same theme
        // We can check one variable as a proxy
        if (html.style.getPropertyValue("--primary") !== themeVars["--primary"]) {
          Object.entries(themeVars).forEach(([key, value]) => {
            html.style.setProperty(key, value as string);
          });
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [tenant]);

  // We use useEffect to save the current theme to cache after render
  useEffect(() => {
    if (!tenant?.agency || tenant.user?.role !== "RD") return;

    const cacheKey = `theme:${tenant.agency._id}`;
    
    // Read the actual computed values from the HTML element
    // This ensures we cache exactly what the server rendered
    const html = document.documentElement;
    const themeVars: Record<string, string> = {};
    
    const varsToCache = [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--muted",
      "--muted-foreground",
      "--border",
      "--input",
      "--primary",
      "--primary-foreground",
      "--accent",
      "--accent-foreground",
      "--sidebar",
      "--sidebar-foreground",
      "--sidebar-primary",
      "--sidebar-primary-foreground",
      "--sidebar-accent",
      "--sidebar-accent-foreground",
      "--sidebar-border",
      "--agency-heading-text",
      "--radius",
      "--font-sans"
    ];

    varsToCache.forEach(v => {
      const val = html.style.getPropertyValue(v);
      if (val) themeVars[v] = val;
    });

    if (Object.keys(themeVars).length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(themeVars));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [tenant]);

  return null;
}
