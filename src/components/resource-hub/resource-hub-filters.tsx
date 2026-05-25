import * as React from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search } from "lucide-react";

export type ResourceFilterTab = "all" | "audio" | "document" | "video";

interface ResourceHubFiltersProps {
  activeTab: ResourceFilterTab;
  onTabChange: (tab: ResourceFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<ResourceFilterTab, number>;
}

export function ResourceHubFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  counts,
}: ResourceHubFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(value) => {
          if (value) onTabChange(value as ResourceFilterTab);
        }}
        className="justify-start bg-white dark:bg-zinc-950 border border-border p-1 rounded-lg shadow-sm h-10 overflow-x-auto w-full sm:w-auto"
      >
        <ToggleGroupItem value="all" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-800 data-[state=on]:text-white dark:data-[state=on]:bg-zinc-200 dark:data-[state=on]:text-zinc-900 whitespace-nowrap">
          All <span className="ml-1.5 opacity-60 text-[10px] bg-black/10 dark:bg-white/20 px-1.5 py-0.5 rounded-full">{counts.all}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="audio" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 whitespace-nowrap">
          Audio <span className="ml-1.5 opacity-60 text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{counts.audio}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="document" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 whitespace-nowrap">
          Documents <span className="ml-1.5 opacity-60 text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{counts.document}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="video" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800 whitespace-nowrap">
          Videos <span className="ml-1.5 opacity-60 text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{counts.video}</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="relative flex-1 w-full min-w-[200px] sm:max-w-md ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg border-border pl-9 pr-4 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
