import React from "react";
import { TenantContext } from "./tenant";
import { resolveAgencyTheme } from "./agency-theme-resolve";

// Helper to determine contrasting text color (black or white) based on hex background
export function getContrastingForeground(hexColor: string): string {
  // Remove hash if present
  const hex = hexColor.replace(/^#/, '');
  
  // Parse RGB
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return "#ffffff"; // Default to white if invalid hex
  }

  // Calculate relative luminance (simplified)
  // Using sRGB luminance formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function buildAgencyThemeStyle(
  theme: Partial<NonNullable<TenantContext>["theme"]> | undefined,
  role?: string
): React.CSSProperties {
  // If no theme or not an RD, we don't apply overrides.
  // The system will fall back to globals.css defaults.
  if (!theme || !theme.primaryColor || role !== "RD") return {};
  
  const resolved = resolveAgencyTheme(theme);
  if (!resolved) return {};
  
  const accentForeground = getContrastingForeground(resolved.accentColor);
  const sidebarPrimaryForeground = getContrastingForeground(resolved.primaryColor);

  return {
    "--background": resolved.pageBg,
    "--foreground": resolved.bodyText,
    "--card": resolved.cardBg,
    "--card-foreground": resolved.bodyText,
    "--muted": resolved.cardInnerBg,
    "--muted-foreground": resolved.mutedText,
    "--border": resolved.borderColor,
    "--input": resolved.borderColor,
    "--primary": resolved.primaryColor,
    "--primary-foreground": resolved.primaryForeground,
    "--accent": resolved.accentColor,
    "--accent-foreground": accentForeground,
    "--sidebar": resolved.sidebarBg,
    "--sidebar-foreground": resolved.sidebarItemText,
    "--sidebar-primary": resolved.primaryColor,
    "--sidebar-primary-foreground": sidebarPrimaryForeground,
    "--sidebar-accent": resolved.sidebarActiveItemBg,
    "--sidebar-accent-foreground": resolved.primaryColor,
    "--sidebar-border": resolved.borderColor,
    "--agency-heading-text": resolved.headingText,
    "--radius": theme.borderRadius || "8px",
    "--font-sans": getFontStack(theme.fontFamily || "Inter"),
  } as React.CSSProperties;
}

export function getFontStack(fontFamily: string): string {
  switch (fontFamily) {
    case "Inter":
      return "var(--font-inter), sans-serif";
    case "DM Sans":
      return "var(--font-dm-sans), sans-serif";
    case "Geist":
      return "var(--font-geist-sans), sans-serif";
    case "system-ui":
    default:
      return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";
  }
}

