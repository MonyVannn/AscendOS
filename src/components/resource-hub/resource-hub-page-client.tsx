"use client"

import * as React from "react";
import { ResourceHubHeader } from "./resource-hub-header";
import { ResourceHubFilters, ResourceFilterTab } from "./resource-hub-filters";
import { ResourceHubSection } from "./resource-hub-section";
import { MOCK_RESOURCES } from "@/lib/resource-hub/mock-data";

export function ResourceHubPageClient() {
  const [activeTab, setActiveTab] = React.useState<ResourceFilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Calculate totals
  const totalItems = MOCK_RESOURCES.length;
  const totalShares = MOCK_RESOURCES.reduce((sum, item) => sum + item.shareCount, 0);

  // Calculate counts for tabs
  const counts = React.useMemo(() => {
    return {
      all: MOCK_RESOURCES.length,
      audio: MOCK_RESOURCES.filter(r => r.category === "audio").length,
      document: MOCK_RESOURCES.filter(r => r.category === "document").length,
      video: MOCK_RESOURCES.filter(r => r.category === "video").length,
    };
  }, []);

  // Filter items based on active tab and search query
  const filteredResources = React.useMemo(() => {
    return MOCK_RESOURCES.filter(item => {
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
  }, [activeTab, searchQuery]);

  // Group filtered items by category
  const ouItems = filteredResources.filter(r => r.category === "audio");
  const documentItems = filteredResources.filter(r => r.category === "document");
  const videoItems = filteredResources.filter(r => r.category === "video");

  return (
    <div className="mx-auto max-w-screen-xl py-8 px-4 sm:px-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ResourceHubHeader totalItems={totalItems} totalShares={totalShares} />
      
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
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {(activeTab === "all" || activeTab === "audio") && (
            <ResourceHubSection category="audio" title="Audio" items={ouItems} />
          )}
          
          {(activeTab === "all" || activeTab === "document") && (
            <ResourceHubSection category="document" title="Documents" items={documentItems} />
          )}
          
          {(activeTab === "all" || activeTab === "video") && (
            <ResourceHubSection category="video" title="Videos" items={videoItems} />
          )}
        </div>
      )}
    </div>
  );
}
