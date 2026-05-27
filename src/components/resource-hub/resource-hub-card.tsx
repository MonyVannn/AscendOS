import * as React from "react";
import { ResourceItem } from "@/lib/resource-hub/types";
import { RESOURCE_TAGS } from "@/lib/resource-hub/mock-data";
import { formatMediaDuration } from "@/lib/resource-hub/format-media-duration";
import { Button } from "@/components/ui/button";
import { Users, Upload, Eye, Headphones, FileText, PlaySquare, Image as ImageIcon } from "lucide-react";

interface ResourceHubCardProps {
  resource: ResourceItem;
  onView?: () => void;
}

export function ResourceHubCard({ resource, onView }: ResourceHubCardProps) {
  const tagColor = RESOURCE_TAGS.find(t => t.label === resource.tag)?.color || "bg-zinc-500";

  let Icon = FileText;
  const iconBg = "bg-accent/10 text-accent";
  
  if (resource.category === "audio") {
    Icon = Headphones;
  } else if (resource.category === "video") {
    Icon = PlaySquare;
  } else if (resource.category === "image") {
    Icon = ImageIcon;
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} relative`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 space-y-1 mb-4">
        <h4 className="font-semibold text-foreground line-clamp-1" title={resource.title}>
          {resource.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2" title={resource.description}>
          {resource.description}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${tagColor}`} />
          <span className="text-foreground">{resource.tag}</span>
        </div>
        <span>·</span>
        <span>
          {resource.category === "audio" || resource.category === "video"
            ? resource.durationSeconds ? formatMediaDuration(resource.durationSeconds) : "Unknown"
            : resource.fileType}
        </span>
        {resource.category === "video" && (
          <>
            <span>·</span>
            <span>YouTube</span>
          </>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{resource.shareCount} shared</span>
        </div>
        <div className="flex items-center gap-2">
          {(resource.category === "document" || resource.category === "image") && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs" 
              disabled={!resource.fileUrl} 
              title={!resource.fileUrl ? "No file available" : "Preview resource"}
              onClick={onView}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          <Button size="sm" className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-foreground dark:bg-red-600 dark:hover:bg-red-700 dark:text-white" disabled title="Coming soon">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
