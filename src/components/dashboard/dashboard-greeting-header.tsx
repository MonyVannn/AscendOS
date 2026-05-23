import * as React from "react";
import { formatGreetingDate } from "@/lib/dashboard-period";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { DashboardPeriod } from "@/lib/dashboard-period";

interface DashboardGreetingHeaderProps {
  userName: string;
  formsReadyCount: number;
  periodLabel: string;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  metrics: {
    formsTriggered: number;
    successRate: number;
    avgFireTimeMs: number;
  };
  smartForms: Array<{ label: string; href: string; isLive: boolean }>;
}

export function DashboardGreetingHeader({
  userName,
  formsReadyCount,
  periodLabel,
  onPeriodChange,
  metrics,
  smartForms,
}: DashboardGreetingHeaderProps) {
  const firstName = userName.split(" ")[0];
  const dateStr = formatGreetingDate();
  const formsText = formsReadyCount === 1 ? "1 form" : `${formsReadyCount} forms`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {dateStr} <span className="text-muted-foreground/30">•</span> {formsText} ready to fire
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Good morning, <span className="text-red-500">{firstName}</span>.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Your team triggered {metrics.formsTriggered} automations {periodLabel.toLowerCase()} — {metrics.successRate}% success rate.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:self-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-muted-foreground border-dashed">
              <Filter className="h-3.5 w-3.5" />
              {periodLabel}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPeriodChange("this_week")}>
              This week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPeriodChange("last_week")}>
              Last week
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              New submission
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {smartForms.length === 0 ? (
              <DropdownMenuItem disabled>No forms available</DropdownMenuItem>
            ) : (
              smartForms.map((form) => (
                <DropdownMenuItem key={form.href} asChild disabled={!form.isLive}>
                  <Link href={form.isLive ? form.href : "#"} className="w-full cursor-pointer">
                    {form.label}
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
