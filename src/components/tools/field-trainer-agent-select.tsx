"use client";

import * as React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { normalizePhone } from "@/lib/phone/normalize";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface FieldTrainerAgentSelectProps {
  value: Id<"fieldTrainerEnrollments"> | "";
  onValueChange: (id: Id<"fieldTrainerEnrollments">) => void;
  disabled?: boolean;
}

export function FieldTrainerAgentSelect({
  value,
  onValueChange,
  disabled,
}: FieldTrainerAgentSelectProps) {
  const { isAuthenticated } = useConvexAuth();
  const rawEnrollments = useQuery(
    api.fieldTrainer.listForTimeline,
    isAuthenticated ? {} : "skip"
  );

  const activeEnrollments = React.useMemo(() => {
    if (!rawEnrollments) return [];
    return rawEnrollments.filter((e) => e.programStatus === "active");
  }, [rawEnrollments]);

  const selectedAgent = activeEnrollments.find((e) => e._id === value);
  const selectedAgentPhone = selectedAgent ? selectedAgent.phone.replace(/\D/g, "") : "";
  const formattedSelectedPhone = selectedAgentPhone.length === 10
    ? `${selectedAgentPhone.slice(0, 3)}-${selectedAgentPhone.slice(3, 6)}-${selectedAgentPhone.slice(6)}`
    : selectedAgentPhone.length === 11 && selectedAgentPhone.startsWith("1")
    ? `${selectedAgentPhone.slice(1, 4)}-${selectedAgentPhone.slice(4, 7)}-${selectedAgentPhone.slice(7)}`
    : selectedAgent ? normalizePhone(selectedAgent.phone) : "";

  if (rawEnrollments === undefined) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full pl-9 h-10 bg-input/30">
          <SelectValue placeholder="Loading agents..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (activeEnrollments.length === 0) {
    return (
      <div className="space-y-2">
        <Select disabled>
          <SelectTrigger className="w-full pl-9 h-10 opacity-50 bg-input/30">
            <SelectValue placeholder="No active agents found" />
          </SelectTrigger>
        </Select>
        <p className="text-[11px] text-muted-foreground px-1">
          You don't have any active agents yet. Head to the{" "}
          <span className="font-medium text-foreground/80">Start Production Drip</span> tab
          to enroll someone first.
        </p>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange as any} disabled={disabled}>
      <SelectTrigger className="w-full pl-9 h-12 text-left bg-input/30">
        <SelectValue placeholder="Select an active agent">
          {selectedAgent ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-foreground">{selectedAgent.firstName}</span>
              <span className="text-muted-foreground hidden sm:inline">
                {formattedSelectedPhone} · Week {selectedAgent.currentWeek}
              </span>
            </div>
          ) : (
            "Select an active agent"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
        <SelectGroup>
          {activeEnrollments.map((agent) => {
            const initials = agent.firstName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();
            
            const cleanedPhone = agent.phone.replace(/\D/g, "");
            const formattedPhone = cleanedPhone.length === 10
              ? `${cleanedPhone.slice(0, 3)}-${cleanedPhone.slice(3, 6)}-${cleanedPhone.slice(6)}`
              : cleanedPhone.length === 11 && cleanedPhone.startsWith("1")
              ? `${cleanedPhone.slice(1, 4)}-${cleanedPhone.slice(4, 7)}-${cleanedPhone.slice(7)}`
              : normalizePhone(agent.phone);

            return (
              <SelectItem key={agent._id} value={agent._id} className="py-2.5">
                <div className="w-full flex items-center pr-20 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-9 border border-border shrink-0">
                      <AvatarFallback className="bg-background text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-foreground leading-tight">{agent.firstName}</span>
                      <span className="text-xs font-medium text-muted-foreground truncate leading-tight mt-0.5">
                        {formattedPhone}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-9 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="font-medium text-foreground leading-tight text-sm">
                      {agent.fieldTrainer || "No Trainer"}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground leading-tight mt-0.5">
                      Week {agent.currentWeek}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
