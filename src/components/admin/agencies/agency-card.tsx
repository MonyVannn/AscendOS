import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Agency {
  _id: string;
  name: string;
  slug: string;
  enabledFeatures: { key: string; label: string }[];
  rdCount: number;
  featureCount: number;
  webhookCount: number;
  status: "ACTIVE" | "ONBOARDING";
}

export function AgencyCard({ agency }: { agency: Agency }) {
  const getStatusColor = (status: Agency["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      case "ONBOARDING":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    }
  };

  const getStatusDotColor = (status: Agency["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "ONBOARDING":
        return "bg-amber-500";
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 font-bold text-sm dark:bg-blue-900/20 dark:text-blue-400">
            {agency.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 leading-none mb-1.5">
              {agency.name}
            </h3>
            <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-max">
              {agency.slug}
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`gap-1.5 font-mono text-[10px] py-0.5 px-2 rounded-full uppercase shrink-0 ${getStatusColor(agency.status)}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(agency.status)}`}
          />
          {agency.status}
        </Badge>
      </div>
      <Separator className="my-2" />

      {/* Metrics */}
      <div className="flex items-stretch dark:border-zinc-800">
        <div className="min-w-0 flex-1 px-3 first:pl-0">
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {agency.rdCount}
          </div>
          <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
            RDS
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="min-w-0 flex-1 px-3">
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {agency.featureCount}
          </div>
          <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
            FEATURES
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="min-w-0 flex-1 px-3 last:pr-0">
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {agency.webhookCount.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1">
            WEBHOOKS
          </div>
        </div>
      </div>
      <Separator className="my-2" />

      {/* Chips */}
      <div className="flex flex-1 flex-col mt-6">
        <div className="flex flex-wrap gap-2">
          {agency.enabledFeatures &&
            agency.enabledFeatures.map((feature, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="font-mono text-[10px] font-medium uppercase text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              >
                {feature.label}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  );
}
