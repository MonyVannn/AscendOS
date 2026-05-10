"use client";

import * as React from "react";
import { TenantContext } from "@/lib/tenant";

export interface SettingsDraft {
  profile: {
    name: string;
    bookingLink: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    sidebarColor: string;
    textColor: string;

    sidebarBg?: string;
    sidebarItemText?: string;
    sidebarSectionLabel?: string;
    sidebarHoverBg?: string;
    sidebarActiveItemBg?: string;

    pageBg?: string;
    cardBg?: string;
    cardInnerBg?: string;
    borderColor?: string;

    headingText?: string;
    bodyText?: string;
    mutedText?: string;

    primaryForeground?: string;

    logoUrl?: string;
    faviconUrl?: string;
    fontFamily: string;
    borderRadius: string;
  };
}

interface SettingsContextValue {
  draft: SettingsDraft;
  setDraft: React.Dispatch<React.SetStateAction<SettingsDraft>>;
  isDirty: boolean;
  isSaving: boolean;
  saveDraft: () => Promise<void>;
  discardDraft: () => void;
  tenant: NonNullable<TenantContext>;
}

export const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
