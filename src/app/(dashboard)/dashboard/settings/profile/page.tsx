"use client";

import * as React from "react";
import { useSettings } from "@/components/settings/settings-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileSettingsPage() {
  const { draft, setDraft, tenant } = useSettings();

  const handleTestLink = () => {
    if (draft.profile.bookingLink) {
      window.open(draft.profile.bookingLink.trim(), "_blank", "noopener,noreferrer");
    }
  };

  const isValidUrl = draft.profile.bookingLink.startsWith("https://") || draft.profile.bookingLink === "";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-base font-bold mb-1">Your profile</h2>
        <p className="text-sm text-zinc-500">
          How you appear to your team and how AscendOS reaches you. Your email is managed by Clerk SSO and can&apos;t be changed here.
        </p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold">
            Display name <span className="ml-2 text-[10px] tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>
          </label>
          <Input 
            value={draft.profile.name}
            onChange={(e) => setDraft(s => ({ ...s, profile: { ...s.profile, name: e.target.value } }))}
            placeholder="e.g. Marcus Hayward"
            className="max-w-md"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold">
            Email address 
            <span className="ml-2 text-[10px] tracking-wider text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              Managed by Clerk
            </span>
          </label>
          <Input 
            value={tenant.user.email || ""}
            disabled
            className="max-w-md bg-zinc-50 text-zinc-500 cursor-not-allowed"
          />
          <p className="text-xs text-zinc-500 mt-1">To update your email, contact your administrator.</p>
        </div>

        {/* Booking Link */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold">
            Booking link <span className="ml-2 text-[10px] tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <Input 
              value={draft.profile.bookingLink}
              onChange={(e) => setDraft(s => ({ ...s, profile: { ...s.profile, bookingLink: e.target.value } }))}
              placeholder="https://cal.com/..."
              className={!isValidUrl && draft.profile.bookingLink.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestLink}
              disabled={!isValidUrl || !draft.profile.bookingLink}
              className="shrink-0"
            >
              Test link ↗
            </Button>
          </div>
          {!isValidUrl && draft.profile.bookingLink.length > 0 && (
            <p className="text-xs text-red-500 font-medium">Link must start with https://</p>
          )}
          <p className="text-xs text-zinc-500">Used by every drip CTA across this hub. Test before saving.</p>
        </div>

        {/* Callout */}
        <div className="max-w-md bg-amber-50 border border-amber-200/60 rounded-lg p-4 flex gap-3 text-amber-900">
          <div className="mt-0.5 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <div className="text-sm">
            <strong>High-stakes field.</strong> A broken booking link silently breaks every drip automation in this hub. Hit &quot;Test link ↗&quot; before saving.
          </div>
        </div>

      </div>
    </div>
  );
}
