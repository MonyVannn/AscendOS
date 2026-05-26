"use client";

import * as React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TimelineBoard } from "./timeline-board";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FieldTrainerTimelinePageClient() {
  const { isAuthenticated } = useConvexAuth();
  const rawEnrollments = useQuery(api.fieldTrainer.listForTimeline, isAuthenticated ? {} : "skip");

  const [search, setSearch] = React.useState("");

  const isLoading = rawEnrollments === undefined;

  const filteredEnrollments = React.useMemo(() => {
    if (!rawEnrollments) return [];
    if (!search.trim()) return rawEnrollments;

    const query = search.toLowerCase();
    return rawEnrollments.filter((e) => 
      e.firstName.toLowerCase().includes(query) ||
      e.fieldTrainer.toLowerCase().includes(query) ||
      e.assignedRdName.toLowerCase().includes(query)
    );
  }, [rawEnrollments, search]);

  return (
    <div className="mx-auto max-w-[1600px] h-[calc(100vh-2rem)] flex flex-col pt-6 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
            Insights <span className="w-1 h-1 rounded-full bg-muted-foreground/50" /> Field Trainer timeline
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Field Trainer Timeline</h1>
          <p className="text-muted-foreground text-sm max-w-xl mt-1">
            Track agent progression through the Field Trainer program.
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents..."
            className="pl-9 bg-background shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading timeline...
            </div>
          </div>
        ) : rawEnrollments.length === 0 ? (
          <div className="bg-card border border-border rounded-xl h-full shadow-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">No agents enrolled yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              There are currently no active or completed enrollments for your agency in the Field Trainer program.
            </p>
            <Button asChild>
              <Link href="/dashboard/train/field-trainer">
                Go to Field Trainer Tool
              </Link>
            </Button>
          </div>
        ) : (
          <TimelineBoard enrollments={filteredEnrollments as any} />
        )}
      </div>
    </div>
  );
}
