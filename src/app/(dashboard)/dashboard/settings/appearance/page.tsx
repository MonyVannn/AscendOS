"use client";

import * as React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useSettings } from "@/components/settings/settings-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, Loader2 } from "lucide-react";

function AssetUpload({
  label,
  kind,
  value,
  onChange,
  placeholder,
  helpText
}: {
  label: string;
  kind: "logo" | "favicon";
  value: string;
  onChange: (url: string, storageId?: Id<"_storage">) => void;
  placeholder: string;
  helpText: string;
}) {
  const generateUploadUrl = useMutation(api.settings.generateThemeAssetUploadUrl);
  const finalizeUpload = useMutation(api.settings.finalizeThemeAssetUpload);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };

      const { url, storageId: confirmedId } = await finalizeUpload({
        kind,
        storageId,
      });

      onChange(url, confirmedId);
    } catch (error) {
      console.error("Upload failed", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">↑</span>
          <Input 
            value={value}
            onChange={(e) => onChange(e.target.value, undefined)}
            placeholder={placeholder}
            className="pl-8"
            disabled={isUploading}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={kind === "favicon" ? "image/x-icon,image/vnd.microsoft.icon,image/png" : "image/png,image/jpeg,image/svg+xml,image/webp"}
          onChange={handleFileChange}
        />
        <Button 
          type="button" 
          variant="outline" 
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="sr-only">Upload</span>
        </Button>
      </div>
      <p className="text-xs text-zinc-500">{helpText}</p>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const { draft, setDraft } = useSettings();

  const handleThemeChange = (field: string, value: string) => {
    setDraft(s => ({ ...s, theme: { ...s.theme, [field]: value } }));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Identity */}
      <section>
        <div className="mb-6">
          <h2 className="text-base font-bold mb-1">Hub appearance</h2>
          <p className="text-sm text-zinc-500">
            Brand the hub for the agents who log in. Changes apply to every page in the regional director&apos;s view.
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Identity</div>
          
          <AssetUpload
            label="Logo URL"
            kind="logo"
            value={draft.theme.logoUrl || ""}
            onChange={(url, storageId) => setDraft(s => ({ ...s, theme: { ...s.theme, logoUrl: url, logoStorageId: storageId } }))}
            placeholder="https://cdn.example.com/logo.svg"
            helpText="Upload an image or paste a hosted URL."
          />

          <AssetUpload
            label="Favicon URL"
            kind="favicon"
            value={draft.theme.faviconUrl || ""}
            onChange={(url, storageId) => setDraft(s => ({ ...s, theme: { ...s.theme, faviconUrl: url, faviconStorageId: storageId } }))}
            placeholder="https://cdn.example.com/favicon.png"
            helpText="Recommended: 32x32px .ico or .png. Upload or paste a URL."
          />
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Colors */}
      <section>
        <div className="space-y-6">
          <div className="mb-4">
            <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-1">Colors</div>
            <p className="text-xs text-zinc-500">Click any swatch to open the picker. The preview updates in real time.</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-3 text-zinc-700 dark:text-zinc-300">Interactive</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <ColorPicker label="Primary Color" field="primaryColor" value={draft.theme.primaryColor} onChange={handleThemeChange} />
                <ColorPicker label="Primary Foreground" field="primaryForeground" value={draft.theme.primaryForeground || ""} onChange={handleThemeChange} />
                <ColorPicker label="Accent Color" field="accentColor" value={draft.theme.accentColor} onChange={handleThemeChange} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 text-zinc-700 dark:text-zinc-300">Content</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <ColorPicker label="Page Background" field="pageBg" value={draft.theme.pageBg || ""} onChange={handleThemeChange} />
                <ColorPicker label="Card Background" field="cardBg" value={draft.theme.cardBg || ""} onChange={handleThemeChange} />
                <ColorPicker label="Card Inner (Muted) BG" field="cardInnerBg" value={draft.theme.cardInnerBg || ""} onChange={handleThemeChange} />
                <ColorPicker label="Border Color" field="borderColor" value={draft.theme.borderColor || ""} onChange={handleThemeChange} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 text-zinc-700 dark:text-zinc-300">Sidebar</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <ColorPicker label="Sidebar Background" field="sidebarBg" value={draft.theme.sidebarBg || ""} onChange={handleThemeChange} />
                <ColorPicker label="Sidebar Text" field="sidebarItemText" value={draft.theme.sidebarItemText || ""} onChange={handleThemeChange} />
                <ColorPicker label="Section Label" field="sidebarSectionLabel" value={draft.theme.sidebarSectionLabel || ""} onChange={handleThemeChange} />
                <ColorPicker label="Active Item BG" field="sidebarActiveItemBg" value={draft.theme.sidebarActiveItemBg || ""} onChange={handleThemeChange} />
                <ColorPicker label="Hover BG" field="sidebarHoverBg" value={draft.theme.sidebarHoverBg || ""} onChange={handleThemeChange} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 text-zinc-700 dark:text-zinc-300">Typography</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <ColorPicker label="Heading Text" field="headingText" value={draft.theme.headingText || ""} onChange={handleThemeChange} />
                <ColorPicker label="Body Text" field="bodyText" value={draft.theme.bodyText || ""} onChange={handleThemeChange} />
                <ColorPicker label="Muted Text" field="mutedText" value={draft.theme.mutedText || ""} onChange={handleThemeChange} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Typography & Shape */}
      <section>
        <div className="space-y-6">
          <div className="mb-4">
            <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-1">Typography & Shape</div>
            <p className="text-xs text-zinc-500">Type family and corner radius applied across buttons, inputs, and cards.</p>
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold">Font family</label>
            <select 
              value={draft.theme.fontFamily}
              onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Inter">Inter — clean, neutral</option>
              <option value="DM Sans">DM Sans — friendly, approachable</option>
              <option value="Geist">Geist — sharp, modern</option>
              <option value="system-ui">System UI — native</option>
            </select>
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold">Border radius</label>
            <div className="grid grid-cols-3 gap-2">
              <RadiusOption 
                label="Sharp" 
                value="0px" 
                currentValue={draft.theme.borderRadius} 
                onClick={(v) => handleThemeChange("borderRadius", v)} 
              />
              <RadiusOption 
                label="Rounded" 
                value="0.5rem" 
                currentValue={draft.theme.borderRadius} 
                onClick={(v) => handleThemeChange("borderRadius", v)} 
              />
              <RadiusOption 
                label="Pill" 
                value="9999px" 
                currentValue={draft.theme.borderRadius} 
                onClick={(v) => handleThemeChange("borderRadius", v)} 
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function ColorPicker({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (field: string, value: string) => void }) {
  const isValidHex = /^#[0-9A-Fa-f]{6}$/i.test(value);
  const colorPickerValue = isValidHex ? value : "#000000";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="relative w-10 h-10 rounded shadow-inner shrink-0 overflow-hidden border border-black/10 dark:border-white/10">
        <input 
          type="color" 
          value={colorPickerValue}
          onChange={(e) => onChange(field, e.target.value)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] cursor-pointer opacity-0"
        />
        <div 
          className="w-full h-full pointer-events-none"
          style={{ backgroundColor: isValidHex ? value : "transparent" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor={`color-input-${field}`} className="text-sm font-semibold block mb-0.5 cursor-pointer">{label}</label>
        <input 
          id={`color-input-${field}`}
          type="text"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="text-xs text-zinc-500 uppercase font-mono bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full"
          placeholder="#000000"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function RadiusOption({ label, value, currentValue, onClick }: { label: string; value: string; currentValue: string; onClick: (value: string) => void }) {
  // Map current unknown values to the closest bucket, default to rounded
  const isSelected = (() => {
    if (value === "0px" && (currentValue === "0px" || currentValue === "0")) return true;
    if (value === "9999px" && currentValue === "9999px") return true;
    if (value === "0.5rem" && currentValue !== "0px" && currentValue !== "0" && currentValue !== "9999px") return true;
    return false;
  })();

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`h-24 border rounded-lg flex flex-col items-center justify-center gap-3 transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <div 
        className={`w-12 h-6 border-2 ${isSelected ? "border-blue-500" : "border-zinc-300 dark:border-zinc-600"}`}
        style={{ borderRadius: value === "0.5rem" ? "6px" : value }}
      />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
