"use client";

import * as React from "react";
import { useSettings } from "./settings-context";
import { getFontStack } from "@/lib/agency-theme-css-vars";

interface SettingsLivePreviewProps {
  isProfile: boolean;
}

export function SettingsLivePreview({ isProfile }: SettingsLivePreviewProps) {
  const { draft, tenant } = useSettings();
  const { theme, profile } = draft;

  const email = tenant.user.email || "";

  return (
    <div className="space-y-6">
      {/* Mini Hub Preview */}
      <div 
        className="rounded-xl border shadow-sm overflow-hidden bg-white flex flex-col"
        style={{ 
          fontFamily: getFontStack(theme.fontFamily),
          borderRadius: theme.borderRadius === "9999px" ? "1rem" : theme.borderRadius // Cap pill radius for outer container
        }}
      >
        {/* Browser Chrome */}
        <div className="h-8 bg-zinc-100 flex items-center px-3 gap-1.5 border-b shrink-0">
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
        </div>

        <div className="flex h-64">
          {/* Sidebar */}
          <div 
            className="w-1/3 border-r p-3 flex flex-col"
            style={{ backgroundColor: theme.sidebarBg, color: theme.sidebarItemText, borderColor: theme.borderColor }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-6 h-6 rounded flex items-center justify-center shrink-0 font-bold text-[10px]"
                style={{ backgroundColor: theme.primaryColor, color: theme.primaryForeground }}
              >
                {theme.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={theme.logoUrl} alt="Logo" className="w-full h-full object-cover rounded" />
                ) : (
                  tenant.agency?.name?.substring(0, 2).toUpperCase() || "AG"
                )}
              </div>
              <div className="text-xs font-semibold truncate opacity-90" style={{ color: theme.headingText }}>{tenant.agency?.name}</div>
            </div>
            
            <div className="space-y-1">
              <div className="h-6 rounded flex items-center px-2" style={{ backgroundColor: theme.sidebarActiveItemBg }}>
                <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: theme.primaryColor }} />
                <span className="text-[10px] font-medium" style={{ color: theme.primaryColor }}>Recruit</span>
              </div>
              <div className="h-6 rounded flex items-center px-2 opacity-70" style={{ backgroundColor: theme.sidebarHoverBg }}>
                <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: theme.sidebarItemText }} />
                <span className="text-[10px]">Dashboard</span>
              </div>
              <div className="h-6 rounded flex items-center px-2 opacity-70" style={{ backgroundColor: theme.sidebarHoverBg }}>
                <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: theme.sidebarItemText }} />
                <span className="text-[10px]">Settings</span>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div 
            className="w-2/3 p-4 flex flex-col"
            style={{ backgroundColor: theme.pageBg, color: theme.bodyText }}
          >
            <h4 className="font-bold text-sm mb-1" style={{ color: theme.headingText }}>{tenant.agency?.name}</h4>
            <p className="text-[9px] mb-4" style={{ color: theme.mutedText }}>3 active drips · 142 leads</p>

            <div className="flex gap-2 mb-auto">
              <div className="flex-1 p-2 rounded" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, borderWidth: 1 }}>
                <div className="text-[8px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.mutedText }}>Leads</div>
                <div className="text-sm font-bold" style={{ color: theme.headingText }}>142</div>
              </div>
              <div className="flex-1 p-2 rounded" style={{ backgroundColor: theme.cardInnerBg, borderColor: theme.borderColor, borderWidth: 1 }}>
                <div className="text-[8px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.mutedText }}>Fired</div>
                <div className="text-sm font-bold" style={{ color: theme.headingText }}>47</div>
              </div>
            </div>

            <div 
              className="h-7 px-3 mt-4 text-[10px] font-medium flex items-center justify-center self-start shadow-sm"
              style={{ 
                backgroundColor: theme.primaryColor, 
                color: theme.primaryForeground,
                borderRadius: theme.borderRadius
              }}
            >
              Send drip &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Payload Preview */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Form Payload</span>
          <span className="text-[9px] font-bold tracking-wider text-emerald-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
            {isProfile ? "PATCH /RD" : "PATCH /THEME"}
          </span>
        </div>
        <div className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
          {isProfile ? (
            <>
              <div><span className="text-zinc-500">name:</span> <span className="text-amber-300">&quot;{profile.name}&quot;</span></div>
              <div><span className="text-zinc-500">email:</span> <span className="text-amber-300">&quot;{email}&quot;</span></div>
              <div>
                <span className="text-zinc-500">booking:</span>{" "}
                <span className="text-emerald-400">&quot;{profile.bookingLink.substring(0, 30)}{profile.bookingLink.length > 30 ? "..." : ""}&quot;</span>
              </div>
            </>
          ) : (
            <>
              <div><span className="text-zinc-500">primaryColor:</span> <span className="text-amber-300">&quot;{theme.primaryColor}&quot;</span></div>
              <div><span className="text-zinc-500">pageBg:</span> <span className="text-amber-300">&quot;{theme.pageBg}&quot;</span></div>
              <div><span className="text-zinc-500">sidebarBg:</span> <span className="text-amber-300">&quot;{theme.sidebarBg}&quot;</span></div>
              <div><span className="text-zinc-500">fontFamily:</span> <span className="text-amber-300">&quot;{theme.fontFamily}&quot;</span></div>
              <div><span className="text-zinc-500">borderRadius:</span> <span className="text-amber-300">&quot;{theme.borderRadius}&quot;</span></div>
              <div className="text-zinc-600 italic mt-2">{`// + ${Object.keys(theme).length - 5} other fields`}</div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
