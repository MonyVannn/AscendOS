import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

interface ResourceHubHeaderProps {
  totalItems: number;
  totalShares: number;
}

export function ResourceHubHeader({ totalItems, totalShares }: ResourceHubHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
          Resource Hub <span className="text-muted-foreground/30">•</span> {totalItems} items <span className="text-muted-foreground/30">•</span> {totalShares} shares this month
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resource Hub</h1>
        <p className="text-muted-foreground text-sm max-w-xl mt-1">
          Manage and share your agency&apos;s training materials. Track who&apos;s opened, completed, or still needs a nudge.
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" className="bg-background" disabled title="Coming soon">
          <Filter className="h-4 w-4 mr-2" />
          All categories
        </Button>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled title="Coming soon">
          <Plus className="h-4 w-4 mr-2" />
          Add resource
        </Button>
      </div>
    </div>
  );
}
