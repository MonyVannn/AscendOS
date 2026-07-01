"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { User, Phone, Calendar, Clock, ArrowRight, UserCog } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { normalizePhone } from "@/lib/phone/normalize";
import { FIELD_TRAINER_WEEK_COLUMNS } from "@/lib/field-trainer/curriculum";
import { formatActivityDateStacked } from "@/lib/format-activity-date";
import { Separator } from "@/components/ui/separator";

import { computeEffectiveWeek } from "@/lib/field-trainer/compute-effective-week";

interface AgentDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: Id<"fieldTrainerEnrollments"> | null;
}

export function AgentDetailSheet({ open, onOpenChange, enrollmentId }: AgentDetailSheetProps) {
  const detail = useQuery(
    api.fieldTrainer.getEnrollmentDetail,
    enrollmentId && open ? { enrollmentId } : "skip"
  );

  const getEventLabel = (eventType: string, week?: number, trainer?: string) => {
    switch (eventType) {
      case "started_production_drip":
        return "Started production drip";
      case "reassigned_trainer":
        return `Reassigned trainer${trainer ? ` to ${trainer}` : ""}`;
      case "repositioned_week":
        return `Moved to week ${week ?? "?"}`;
      case "auto_advanced_week":
        return `Auto-advanced to week ${week ?? "?"}`;
      case "agent_removed":
        return "Agent removed from program";
      default:
        return eventType;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "started_production_drip":
        return <Calendar className="w-3.5 h-3.5" />;
      case "reassigned_trainer":
        return <UserCog className="w-3.5 h-3.5" />;
      case "repositioned_week":
      case "auto_advanced_week":
        return <ArrowRight className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (open) {
      // Small timeout to avoid state update during render/effect cascade issues
      const timeout = setTimeout(() => setNowMs(Date.now()), 0);
      const interval = setInterval(() => setNowMs(Date.now()), 60000);
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [open]);

  const effectiveWeek = detail ? computeEffectiveWeek(detail, nowMs) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(28rem,calc(100vw-1rem))] overflow-y-auto p-0 sm:max-w-md">
        {!detail && enrollmentId ? (
          <div className="h-full flex items-center justify-center text-muted-foreground p-6">
            <SheetTitle className="sr-only">Loading agent details</SheetTitle>
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading details...
            </div>
          </div>
        ) : !detail ? (
          <div className="h-full flex items-center justify-center text-muted-foreground p-6 text-center">
            <SheetTitle className="sr-only">Agent not found</SheetTitle>
            Agent not found or you do not have permission to view this enrollment.
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b border-border bg-muted/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                    {detail.firstName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold line-clamp-1">
                      {detail.firstName || "Unknown"}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-1.5 mt-1">
                      <span className="font-medium text-foreground/70">{detail.fieldTrainer}</span>
                      <span className="opacity-50">•</span>
                      <span className="line-clamp-1">{detail.assignedRd.name}</span>
                    </SheetDescription>
                  </div>
                </div>
                <div
                  className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    detail.programStatus === "completed"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : detail.programStatus === "active"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {detail.programStatus}
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-8">
              {/* Contact Info */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Contact
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">{normalizePhone(detail.phone)}</span>
                </div>
              </section>

              {/* Program Status */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Program Status
                </h3>
                <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Phase</span>
                    <span className="text-sm font-medium">
                      {FIELD_TRAINER_WEEK_COLUMNS.find((c) => c.week === effectiveWeek)?.title ||
                        `Week ${effectiveWeek}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Started Program</span>
                    <span className="text-sm font-medium">
                      {format(detail.programStartedAt, "MMM d, yyyy")}
                    </span>
                  </div>
                  {detail.weekEffectiveAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Time in Current Week</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(detail.weekEffectiveAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Team */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Team
                </h3>
                <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Field Trainer</span>
                    <span className="text-sm font-medium">{detail.fieldTrainer}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Assigned RD</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{detail.assignedRd.name}</div>
                      <div className="text-xs text-muted-foreground">{detail.assignedRd.email}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity History */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Activity History
                </h3>
                {detail.events.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic text-center py-4 border border-border border-dashed rounded-xl">
                    No activity recorded
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {detail.events.map((event, i) => {
                      const dateParts = formatActivityDateStacked(event.occurredAt);
                      return (
                        <div key={event._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                            <div className="text-muted-foreground">
                              {getEventIcon(event.eventType)}
                            </div>
                          </div>
                          
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-3 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {getEventLabel(event.eventType, event.week, event.fieldTrainer)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>by {event.performedByName}</span>
                              <span>{dateParts.date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
