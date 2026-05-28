import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export function AdminDashboardHeader({
  health,
  date,
}: {
  health: { status: "healthy" | "attention" | "degraded"; label: string };
  date: number;
}) {
  const dateStr = format(new Date(date), "MMMM d, yyyy");

  const getHealthColor = () => {
    switch (health.status) {
      case "healthy":
        return "border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      case "attention":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "degraded":
        return "border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    }
  };

  const getHealthDotColor = () => {
    switch (health.status) {
      case "healthy":
        return "bg-green-500";
      case "attention":
        return "bg-amber-500";
      case "degraded":
        return "bg-red-500";
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Control Plane <span className="mx-1.5 opacity-50">·</span> {dateStr}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Platform Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`gap-1.5 font-mono text-[10px] py-0.5 px-2 rounded-full uppercase shrink-0 ${getHealthColor()}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${getHealthDotColor()}`}
            />
            {health.label}
          </Badge>
        </div>
      </div>
      <Separator className="mt-4" />
    </>
  );
}