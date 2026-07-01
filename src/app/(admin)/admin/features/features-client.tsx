"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LayoutDashboard, Plus, Pencil, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { iconMap } from "@/lib/dashboard-icons";

const PILLARS = ["recruit", "train", "sell", "team", "account", "tools"] as const;
const TYPES = ["smart-form", "iframe", "page"] as const;

export function FeaturesClient() {
  const { isAuthenticated } = useConvexAuth();
  const features = useQuery(api.catalog.listFeaturesAdmin, isAuthenticated ? undefined : "skip");
  const integrations = useQuery(api.catalog.listIntegrations, isAuthenticated ? undefined : "skip");
  
  const createFeature = useMutation(api.catalog.createFeature);
  const updateFeature = useMutation(api.catalog.updateFeature);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [pillar, setPillar] = useState<any>("recruit");
  const [type, setType] = useState<any>("smart-form");
  const [href, setHref] = useState("");
  const [defaultEmbedUrl, setDefaultEmbedUrl] = useState("");
  const [icon, setIcon] = useState("zap");
  const [sortOrder, setSortOrder] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);
  const [integrationKeys, setIntegrationKeys] = useState<string[]>([]);
  const [toolName, setToolName] = useState("");

  const resetForm = () => {
    setKey("");
    setLabel("");
    setDescription("");
    setPillar("recruit");
    setType("smart-form");
    setHref("");
    setDefaultEmbedUrl("");
    setIcon("zap");
    setSortOrder(10);
    setIsActive(true);
    setIntegrationKeys([]);
    setToolName("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!key || !label || !href || !icon) return;
    setIsProcessing(true);
    try {
      await createFeature({
        key,
        label,
        description,
        pillar,
        type,
        href,
        defaultEmbedUrl: type === "iframe" ? defaultEmbedUrl : undefined,
        icon,
        sortOrder,
        isActive,
        integrationKeys,
        toolName: toolName || undefined,
      });
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create feature.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: Id<"features">) => {
    if (!label || !href || !icon) return;
    setIsProcessing(true);
    try {
      await updateFeature({
        id,
        label,
        description,
        pillar,
        type,
        href,
        defaultEmbedUrl: type === "iframe" ? defaultEmbedUrl : undefined,
        icon,
        sortOrder,
        isActive,
        integrationKeys,
        toolName: toolName || undefined,
      });
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to update feature.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (feature: any) => {
    setEditingId(feature._id);
    setKey(feature.key);
    setLabel(feature.label);
    setDescription(feature.description);
    setPillar(feature.pillar);
    setType(feature.type);
    setHref(feature.href);
    setDefaultEmbedUrl(feature.defaultEmbedUrl || "");
    setIcon(feature.icon);
    setSortOrder(feature.sortOrder);
    setIsActive(feature.isActive);
    setIntegrationKeys(feature.integrationKeys || []);
    setToolName(feature.toolName || "");
    setIsCreating(false);
  };

  const toggleIntegration = (intKey: string) => {
    setIntegrationKeys(prev => 
      prev.includes(intKey) ? prev.filter(k => k !== intKey) : [...prev, intKey]
    );
  };

  if (features === undefined || integrations === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Features Catalog
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage the global list of features available to agencies.
          </p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            New Feature
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {isCreating ? "Create New Feature" : "Edit Feature"}
            </h2>
            <p className="text-sm text-amber-600 mt-1">
              Note: After saving, a developer must add the dashboard page, form component, and API route before this tool is usable by RDs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Key (kebab-case)</label>
              <Input 
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                disabled={!isCreating} 
                placeholder="e.g. beast-mode-drip"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Label</label>
              <Input 
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
                placeholder="e.g. Beast Mode Drip"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
              <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What does this feature do?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pillar</label>
              <select 
                value={pillar} 
                onChange={(e) => setPillar(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Href</label>
              <Input 
                value={href} 
                onChange={(e) => setHref(e.target.value)} 
                placeholder="/dashboard/recruit/beast-mode-drip"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Icon</label>
              <select 
                value={icon} 
                onChange={(e) => setIcon(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(iconMap).map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {type === "iframe" && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Default Embed URL</label>
                <Input 
                  value={defaultEmbedUrl} 
                  onChange={(e) => setDefaultEmbedUrl(e.target.value)} 
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort Order</label>
              <Input 
                type="number"
                value={sortOrder} 
                onChange={(e) => setSortOrder(parseInt(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tool Name (for webhook logs)</label>
              <Input 
                value={toolName} 
                onChange={(e) => setToolName(e.target.value)} 
                placeholder="e.g. beast-mode-drip"
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Linked Integrations</label>
              <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                {integrations.filter(i => i.isActive).map(int => {
                  const active = integrationKeys.includes(int.key);
                  return (
                    <button
                      key={int.key}
                      type="button"
                      onClick={() => toggleIntegration(int.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                        active
                          ? "bg-white border-blue-200 text-blue-700 shadow-sm border"
                          : "bg-white border-zinc-200 text-zinc-500 border hover:border-zinc-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-500" : "bg-transparent"}`}></span>
                      {int.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 flex items-center pt-4 gap-2 md:col-span-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</label>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={() => isCreating ? handleCreate() : handleUpdate(editingId as Id<"features">)} 
              disabled={isProcessing || !key || !label || !href || !icon}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">All Features ({features.length})</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || iconMap.zap;
            return (
              <div key={feature._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-zinc-500" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{feature.label}</span>
                    <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {feature.key}
                    </span>
                    {!feature.isActive && (
                      <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="uppercase tracking-wider font-semibold">{feature.pillar}</span>
                    <span>•</span>
                    <span>{feature.type}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{feature.href}</span>
                  </div>
                  {feature.linkedIntegrations && feature.linkedIntegrations.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <LinkIcon className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {feature.linkedIntegrations.map((i: any) => i.label).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-zinc-400">Order: {feature.sortOrder}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEdit(feature)}
                    disabled={isProcessing || editingId === feature._id}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {features.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No features found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}