"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Webhook, Plus, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

export function IntegrationsClient() {
  const { isAuthenticated } = useConvexAuth();
  const integrations = useQuery(api.catalog.listIntegrations, isAuthenticated ? undefined : "skip");
  
  const createIntegration = useMutation(api.catalog.createIntegration);
  const updateIntegration = useMutation(api.catalog.updateIntegration);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setKey("");
    setLabel("");
    setDescription("");
    setSortOrder(10);
    setIsActive(true);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!key || !label) return;
    setIsProcessing(true);
    try {
      await createIntegration({
        key,
        label,
        description,
        sortOrder,
        isActive,
      });
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create integration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: Id<"integrations">) => {
    if (!label) return;
    setIsProcessing(true);
    try {
      await updateIntegration({
        id,
        label,
        description,
        sortOrder,
        isActive,
      });
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to update integration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (integration: any) => {
    setEditingId(integration._id);
    setKey(integration.key);
    setLabel(integration.label);
    setDescription(integration.description);
    setSortOrder(integration.sortOrder);
    setIsActive(integration.isActive);
    setIsCreating(false);
  };

  if (integrations === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Webhook className="h-6 w-6 text-blue-600" />
            Integrations Catalog
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage the global list of GHL integrations (webhooks) available to features.
          </p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            New Integration
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {isCreating ? "Create New Integration" : "Edit Integration"}
          </h2>
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
                placeholder="What does this integration do?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort Order</label>
              <Input 
                type="number"
                value={sortOrder} 
                onChange={(e) => setSortOrder(parseInt(e.target.value))} 
              />
            </div>
            <div className="space-y-2 flex items-center pt-8 gap-2">
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
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={() => isCreating ? handleCreate() : handleUpdate(editingId as Id<"integrations">)} 
              disabled={isProcessing || !key || !label}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">All Integrations ({integrations.length})</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {integrations.map((integration) => (
            <div key={integration._id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{integration.label}</span>
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {integration.key}
                  </span>
                  {!integration.isActive && (
                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 max-w-3xl line-clamp-1">{integration.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-400">Order: {integration.sortOrder}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => startEdit(integration)}
                  disabled={isProcessing || editingId === integration._id}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {integrations.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No integrations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}