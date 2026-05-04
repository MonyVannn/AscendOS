"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

export function NewAgencyClient() {
  const router = useRouter();
  const createAgency = useMutation(api.admin.createAgency);

  // Basic Info
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");

  // GHL Info
  const [ghlLocationId, setGhlLocationId] = React.useState("");
  const [ghlWebhookUrl, setGhlWebhookUrl] = React.useState("");
  const [ghlAccessToken, setGhlAccessToken] = React.useState("");
  const [showToken, setShowToken] = React.useState(false);

  // Features
  const [features, setFeatures] = React.useState<string[]>([
    "beast-mode-drip",
    "field-trainer",
    "resource-hub",
  ]);
  const availableFeatures = [
    "beast-mode-drip",
    "field-trainer",
    "onboarding-drip",
    "resource-hub",
    "agent-gradebook",
  ];

  const toggleFeature = (f: string) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  // Brand Theme
  const [showBrandTheme, setShowBrandTheme] = React.useState(false);
  const [primaryColor, setPrimaryColor] = React.useState("#0075de");
  const [accentColor, setAccentColor] = React.useState("#097fe8");
  const [backgroundColor, setBackgroundColor] = React.useState("#f6f5f4");
  const [sidebarColor, setSidebarColor] = React.useState("#1F1E1C");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [faviconUrl, setFaviconUrl] = React.useState("");
  const [fontFamily, setFontFamily] = React.useState("Inter");
  const [borderRadius, setBorderRadius] = React.useState("8px");
  const [dashboardTitle, setDashboardTitle] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createAgency({
        name,
        slug,
        ghlLocationId,
        ghlWebhookUrl: ghlWebhookUrl.trim() || undefined,
        ghlAccessToken,
        featuresArray: features,
        theme: showBrandTheme
          ? {
              primaryColor,
              accentColor,
              backgroundColor,
              sidebarColor,
              textColor: "#111827",
              logoUrl: logoUrl.trim() || undefined,
              faviconUrl: faviconUrl.trim() || undefined,
              fontFamily,
              borderRadius,
              dashboardTitle: dashboardTitle.trim() || name,
            }
          : undefined,
      });

      router.push("/admin/agencies");
    } catch (err: any) {
      setError(err.message || "Failed to create agency");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-slugifier
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (
      !slug ||
      slug ===
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
    ) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto h-full py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">
            Register New Agency
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Step 1 of Provisioning
        </div>
      </div>

      <Separator className="mb-8" />

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                Agency Name
              </label>
              <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
                Required
              </span>
            </div>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Divinity Group"
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                Slug
              </label>
              <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                Auto • Editable
              </span>
            </div>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="divinity-group"
              required
              className="bg-zinc-50 font-mono text-sm"
            />
            <p className="text-[13px] text-zinc-500">
              This is your agency&apos;s unique link. Use lowercase and hyphens
              only.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              GHL Location ID
            </label>
            <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
              Required
            </span>
          </div>
          <Input
            value={ghlLocationId}
            onChange={(e) => setGhlLocationId(e.target.value)}
            placeholder="e.g. abcDEF123ghiJKL456"
            required
            className="bg-white font-mono text-sm"
          />
          <p className="text-[13px] text-zinc-500">
            The location this agency lives under. Found in your GHL sub-account
            settings.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              GHL Webhook URL
            </label>
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Optional
            </span>
          </div>
          <Input
            value={ghlWebhookUrl}
            onChange={(e) => setGhlWebhookUrl(e.target.value)}
            placeholder="https://services.leadconnectorhq.com/hooks/..."
            className="bg-zinc-50 font-mono text-sm"
          />
          <p className="text-[13px] text-zinc-500">
            Add this if you want events pushed back into GHL. You can wire it up
            later.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              <Lock size={12} />
              GHL Access Token
            </label>
            <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
              Encrypted
            </span>
          </div>
          <div className="relative">
            <Input
              type={showToken ? "text" : "password"}
              value={ghlAccessToken}
              onChange={(e) => setGhlAccessToken(e.target.value)}
              required
              className="bg-white font-mono text-sm pr-16"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest text-zinc-500 hover:text-zinc-800 uppercase"
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-md flex items-center gap-2 text-sm text-orange-800">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            We encrypt this immediately. It&apos;s never shown to clients or
            staff.
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Features
            </label>
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Click to toggle
            </span>
          </div>
          <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-md">
            {availableFeatures.map((f) => {
              const active = features.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? "bg-white border-blue-200 text-blue-700 shadow-sm border"
                      : "bg-white border-zinc-200 text-zinc-500 border hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-500" : "bg-transparent"}`}
                  ></span>
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-zinc-200 rounded-md overflow-hidden bg-zinc-50">
          <button
            type="button"
            onClick={() => setShowBrandTheme(!showBrandTheme)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-100/50 transition-colors text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Brand Theme
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-1">
                Optional • Can be configured later
              </p>
            </div>
            {showBrandTheme ? (
              <ChevronUp size={16} className="text-zinc-400" />
            ) : (
              <ChevronDown size={16} className="text-zinc-400" />
            )}
          </button>

          {showBrandTheme && (
            <div className="p-6 border-t border-zinc-200 bg-white space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                      style={{ backgroundColor: backgroundColor }}
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Sidebar Color
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                      style={{ backgroundColor: sidebarColor }}
                    />
                    <Input
                      value={sidebarColor}
                      onChange={(e) => setSidebarColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Logo URL
                  </label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://cdn.../logo.svg"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Favicon URL
                  </label>
                  <Input
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://cdn.../favicon.ico"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Font Family
                  </label>
                  <Input
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Border Radius
                  </label>
                  <Input
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    placeholder="8px"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  Dashboard Title
                </label>
                <Input
                  value={dashboardTitle}
                  onChange={(e) => setDashboardTitle(e.target.value)}
                  placeholder="e.g. Divinity Hub"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 py-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/agencies")}
            className="px-8 text-zinc-500 hover:text-zinc-900"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Agency"}
          </Button>
        </div>
      </form>
    </div>
  );
}
