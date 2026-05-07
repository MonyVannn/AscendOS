import React from "react";
import { TenantContext } from "./tenant";

export function getAgencyThemeCssVars(theme: NonNullable<TenantContext>["theme"]): React.CSSProperties {
  if (!theme) return {};
  
  return {
    "--agency-primary": theme.primaryColor,
    "--agency-accent": theme.accentColor,
    "--agency-background": theme.backgroundColor,
    "--agency-sidebar": theme.sidebarColor,
    "--agency-text": theme.textColor,
    "--agency-radius": theme.borderRadius,
    "--agency-font": theme.fontFamily.toLowerCase().includes("sans") 
      ? "var(--font-sans), sans-serif" 
      : theme.fontFamily,
  } as React.CSSProperties;
}
