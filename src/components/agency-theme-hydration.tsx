"use client";

import { useEffect, useLayoutEffect } from "react";
import { TenantContext } from "@/lib/tenant";
import { AGENCY_THEME_DOCUMENT_VARS } from "@/lib/agency-theme-css-vars";

interface AgencyThemeHydrationProps {
  tenant: TenantContext | null;
}

export function AgencyThemeHydration({ tenant }: AgencyThemeHydrationProps) {
  // We use useLayoutEffect to run synchronously before paint on client navigations
  useLayoutEffect(() => {
    if (!tenant?.agency || tenant.user?.role !== "RD") {
      // Clear all theme variables if we are not in an RD session with an agency
      const html = document.documentElement;
      AGENCY_THEME_DOCUMENT_VARS.forEach(v => {
        html.style.removeProperty(v);
      });
      // Also reset favicon to default if not an RD
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link && link.href !== window.location.origin + "/favicon.ico") {
        link.href = "/favicon.ico";
      }
      return;
    }

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
    } catch {
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
    
    AGENCY_THEME_DOCUMENT_VARS.forEach(v => {
      const val = html.style.getPropertyValue(v);
      if (val) themeVars[v] = val;
    });

    if (Object.keys(themeVars).length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(themeVars));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [tenant]);

  // Update favicon if the tenant has a custom one
  useEffect(() => {
    if (!tenant?.agency || tenant.user?.role !== "RD" || !tenant.theme?.faviconUrl) return;

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = tenant.theme.faviconUrl;
  }, [tenant?.theme?.faviconUrl, tenant?.agency, tenant?.user?.role]);

  return null;
}
