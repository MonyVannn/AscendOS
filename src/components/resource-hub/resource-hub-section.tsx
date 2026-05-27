import * as React from "react";
import { ResourceCategory, ResourceItem } from "@/lib/resource-hub/types";
import { ResourceHubCard } from "./resource-hub-card";
import { Headphones, FileText, PlaySquare, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceHubSectionProps {
  category: ResourceCategory;
  title: string;
  items: ResourceItem[];
  onAddResource: (category: ResourceCategory) => void;
  onViewResource?: (id: string) => void;
  onShareResource?: (resource: ResourceItem) => void;
}

export function ResourceHubSection({ category, title, items, onAddResource, onViewResource, onShareResource }: ResourceHubSectionProps) {
  if (items.length === 0) return null;

  let Icon = FileText;
  const iconColor = "text-accent";
  let addLabel = "Add document";

  if (category === "audio") {
    Icon = Headphones;
    addLabel = "Add audio";
  } else if (category === "video") {
    Icon = PlaySquare;
    addLabel = "Add video";
  } else if (category === "image") {
    Icon = ImageIcon;
    addLabel = "Add image";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-muted-foreground opacity-60">{items.length}</span>
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs" onClick={() => onAddResource(category)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {addLabel}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ResourceHubCard 
            key={item.id} 
            resource={item} 
            onView={onViewResource ? () => onViewResource(item.id) : undefined} 
            onShare={onShareResource ? () => onShareResource(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
