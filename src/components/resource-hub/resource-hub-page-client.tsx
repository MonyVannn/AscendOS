"use client"

import * as React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResourceHubHeader } from "./resource-hub-header";
import { ResourceHubFilters, ResourceFilterTab } from "./resource-hub-filters";
import { ResourceHubSection } from "./resource-hub-section";
import { AddResourceSheet } from "./add-resource-sheet";
import { ResourcePreviewSheet } from "./resource-preview-sheet";
import { ShareResourceSheet } from "./share-resource-sheet";
import { ResourceNudgeList } from "./resource-nudge-list";
import { ResourceCategory, ResourceItem } from "@/lib/resource-hub/types";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@/convex/_generated/dataModel";

export function ResourceHubPageClient() {
  const { isAuthenticated } = useConvexAuth();
  const rawResources = useQuery(api.resourceHub.listResources, isAuthenticated ? {} : "skip");
  const shareStats = useQuery(api.resourceShares.getShareStatsForAgency, isAuthenticated ? {} : "skip");
  
  const [activeTab, setActiveTab] = React.useState<ResourceFilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [addSheetOpen, setAddSheetOpen] = React.useState(false);
  const [addCategory, setAddCategory] = React.useState<ResourceCategory>("document");
  const [previewResourceId, setPreviewResourceId] = React.useState<Id<"resources"> | null>(null);
  const [shareResource, setShareResource] = React.useState<ResourceItem | null>(null);

  // Calculate totals
  const totalItems = rawResources?.length || 0;
  const totalShares = shareStats?.monthlyShares || 0;

  // Calculate counts for tabs
  const counts = React.useMemo(() => {
    if (!rawResources) return { all: 0, audio: 0, document: 0, video: 0, image: 0 };
    return {
      all: rawResources.length,
      audio: rawResources.filter(r => r.category === "audio").length,
      document: rawResources.filter(r => r.category === "document").length,
      video: rawResources.filter(r => r.category === "video").length,
      image: rawResources.filter(r => r.category === "image").length,
    };
  }, [rawResources]);

  // Filter items based on active tab and search query
  const filteredResources = React.useMemo(() => {
    if (!rawResources) return [];
    
    return rawResources.filter(item => {
      // Filter by tab
      if (activeTab !== "all" && item.category !== activeTab) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tag.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [activeTab, searchQuery, rawResources]);

  // Group filtered items by category
  const ouItems = filteredResources.filter(r => r.category === "audio");
  const documentItems = filteredResources.filter(r => r.category === "document");
  const videoItems = filteredResources.filter(r => r.category === "video");
  const imageItems = filteredResources.filter(r => r.category === "image");
  
  const handleAddResource = (category: ResourceCategory = "document") => {
    setAddCategory(category);
    setAddSheetOpen(true);
  };

  if (rawResources === undefined) {
    return (
      <div className="mx-auto max-w-screen-xl py-8 px-4 sm:px-6 flex flex-col gap-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-8">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl py-8 px-4 sm:px-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ResourceHubHeader totalItems={totalItems} totalShares={totalShares} onAddResource={() => handleAddResource()} />
      
      <ResourceNudgeList />

      <ResourceHubFilters 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />
      
      {filteredResources.length === 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">No resources found.</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or category filter, or add a new resource.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {(activeTab === "all" || activeTab === "audio") && (
            <ResourceHubSection category="audio" title="Audio" items={ouItems} onAddResource={handleAddResource} onViewResource={(id) => setPreviewResourceId(id as Id<"resources">)} onShareResource={setShareResource} />
          )}
          
          {(activeTab === "all" || activeTab === "document") && (
            <ResourceHubSection category="document" title="Documents" items={documentItems} onAddResource={handleAddResource} onViewResource={(id) => setPreviewResourceId(id as Id<"resources">)} onShareResource={setShareResource} />
          )}
          
          {(activeTab === "all" || activeTab === "video") && (
            <ResourceHubSection category="video" title="Videos" items={videoItems} onAddResource={handleAddResource} onViewResource={(id) => setPreviewResourceId(id as Id<"resources">)} onShareResource={setShareResource} />
          )}
          
          {(activeTab === "all" || activeTab === "image") && (
            <ResourceHubSection category="image" title="Images" items={imageItems} onAddResource={handleAddResource} onViewResource={(id) => setPreviewResourceId(id as Id<"resources">)} onShareResource={setShareResource} />
          )}
        </div>
      )}
      
      <AddResourceSheet 
        open={addSheetOpen} 
        onOpenChange={setAddSheetOpen} 
        defaultCategory={addCategory} 
      />

      <ResourcePreviewSheet
        open={previewResourceId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewResourceId(null);
        }}
        resourceId={previewResourceId}
      />

      <ShareResourceSheet
        open={shareResource !== null}
        onOpenChange={(open) => {
          if (!open) setShareResource(null);
        }}
        resource={shareResource}
      />
    </div>
  );
}
