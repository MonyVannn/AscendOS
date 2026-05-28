import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AgencySnapshot {
  _id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "ONBOARDING";
  memberCount: number;
  webhookCount: number;
}

export function AdminAgencySnapshot({ agencies }: { agencies: AgencySnapshot[] }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Agency Snapshot
        </h3>
        <Link href="/admin/agencies" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline">
          View All
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {agencies.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-4">
            No agencies found.
          </div>
        ) : (
          agencies.map((agency) => (
            <div key={agency._id} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
              <div className="min-w-0">
                <Link href={`/admin/agencies/${agency._id}`} className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate hover:underline hover:text-blue-600 dark:hover:text-blue-400">
                  {agency.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-max">
                    {agency.slug}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {agency.memberCount} members
                  </span>
                </div>
              </div>
              
              <div className="shrink-0 ml-4">
                <Badge
                  variant="outline"
                  className={`gap-1.5 font-mono text-[10px] py-0.5 px-2 rounded-full uppercase ${
                    agency.status === "ACTIVE"
                      ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      agency.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  {agency.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}