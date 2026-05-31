"use client";

import * as React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  User,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FieldTrainerAgentSelect } from "./field-trainer-agent-select";

interface RemoveAgentFormProps {
  agency: {
    slug: string;
  };
}

export function RemoveAgentForm({ agency }: RemoveAgentFormProps) {
  const { isAuthenticated } = useConvexAuth();
  const rawEnrollments = useQuery(
    api.fieldTrainer.listForTimeline,
    isAuthenticated ? {} : "skip"
  );
  
  const activeEnrollments = React.useMemo(() => {
    if (!rawEnrollments) return [];
    return rawEnrollments; // non-withdrawn
  }, [rawEnrollments]);

  const [selectedAgentId, setSelectedAgentId] = React.useState<Id<"fieldTrainerEnrollments"> | "">("");
  const selectedAgent = activeEnrollments.find((e) => e._id === selectedAgentId);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isFormValid = Boolean(selectedAgent);

  const handleSend = React.useCallback(async () => {
    if (!isFormValid || isSubmitting || !selectedAgent) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ghl/remove-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: selectedAgent.firstName,
          phone: selectedAgent.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Agent removed successfully");
        setSelectedAgentId("");
      } else {
        toast.error(data.error || "Failed to remove agent");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, selectedAgent]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  return (
    <div className="flex flex-col">
      {/* Destructive Warning */}
      <div className="p-4 md:p-5 bg-destructive/5 border-b border-destructive/10">
        <div className="flex gap-2.5 text-destructive">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm space-y-0.5">
            <div className="font-medium">Destructive Action</div>
            <div className="text-destructive/80">
              This permanently removes the agent from GoHighLevel automations and contacts. This cannot be undone from AscendOS.
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 md:p-5 space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-medium leading-none text-foreground">Agent Info</h3>
          <p className="text-[13px] text-muted-foreground">Which agent do you want to remove?</p>
        </div>

        <div className="space-y-1.5 max-w-md">
          <label className="text-xs font-medium text-foreground/80">Select Agent</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <FieldTrainerAgentSelect
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              disabled={isSubmitting}
              enrollmentFilter="non-withdrawn"
            />
          </div>
        </div>

        <div className="pt-2 max-w-md">
          <Button 
            variant="destructive"
            className="w-full h-10 text-sm font-medium"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSend}
          >
            {isSubmitting ? "Removing..." : "Remove agent"}
          </Button>
          
          <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Will fire through GHL · <strong className="font-medium text-foreground/80">{agency.slug}</strong> workspace</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/50 font-sans font-medium text-[10px]">↵</kbd>
              <span className="ml-1">to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
