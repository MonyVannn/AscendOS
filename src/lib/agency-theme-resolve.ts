import { TenantContext } from "./tenant";
import { getContrastingForeground } from "./agency-theme-css-vars";

export type Theme = Partial<NonNullable<TenantContext>["theme"]>;

export function resolveAgencyTheme(theme: Theme | undefined | null) {
  if (!theme) return null;

  // Derive legacy defaults if missing
  const pageBg = theme.pageBg || theme.backgroundColor || "#f6f5f4";
  const cardBg = theme.cardBg || "#ffffff";
  const cardInnerBg = theme.cardInnerBg || "#f4f4f5";
  const borderColor = theme.borderColor || "#e4e4e7";

  const headingText = theme.headingText || theme.textColor || "#111827";
  const bodyText = theme.bodyText || theme.textColor || "#111827";
  const mutedText = theme.mutedText || "#71717a";

  const sidebarBg = theme.sidebarBg || theme.sidebarColor || "#1F1E1C";
  const sidebarItemText = theme.sidebarItemText || "#a1a1aa";
  const sidebarSectionLabel = theme.sidebarSectionLabel || "#71717a";
  
  // By default, derive hover and active backgrounds from primary color or light/dark contrast
  const sidebarHoverBg = theme.sidebarHoverBg || "rgba(255, 255, 255, 0.05)";
  const sidebarActiveItemBg = theme.sidebarActiveItemBg || "rgba(255, 255, 255, 0.1)";

  const primaryColor = theme.primaryColor || "#0075de";
  const primaryForeground = theme.primaryForeground || getContrastingForeground(primaryColor);
  const accentColor = theme.accentColor || "#097fe8";

  return {
    ...theme,
    pageBg,
    cardBg,
    cardInnerBg,
    borderColor,
    headingText,
    bodyText,
    mutedText,
    sidebarBg,
    sidebarItemText,
    sidebarSectionLabel,
    sidebarHoverBg,
    sidebarActiveItemBg,
    primaryColor,
    primaryForeground,
    accentColor,
  };
}
