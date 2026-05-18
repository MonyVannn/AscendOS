"use client"

import * as React from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ActivityLogFilters } from "./activity-log-filters"
import { ActivityLogTable } from "./activity-log-table"
import { ActivityLogTableSkeleton } from "./activity-log-table-skeleton"
import { ActivityLogEmptyState } from "./activity-log-empty-state"
import { ActivityLogEntry } from "./activity-log-types"

export function ActivityLogPageClient() {
  const { isAuthenticated } = useConvexAuth()
  const rawLogs = useQuery(api.activityLog.listSubmissionLogs, isAuthenticated ? { limit: 50 } : "skip")

  const isLoading = rawLogs === undefined

  const logs: ActivityLogEntry[] | undefined = rawLogs?.map(log => ({
    id: log._id,
    submittedAt: new Date(log.submittedAt).toISOString(),
    contactName: log.contactName || "—",
    contactEmail: log.contactEmail,
    templateName: log.templateName || "—",
    toolName: "Email Template",
    success: log.success
  }))

  return (
    <div className="mx-auto max-w-screen-xl py-8 px-4 sm:px-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
          Insights <span className="w-1 h-1 rounded-full bg-muted-foreground/50" /> Activity log
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Log</h1>
        <p className="text-muted-foreground text-sm max-w-xl mt-1">
          A record of every automation submission sent through the Hub.
        </p>
      </div>

      <ActivityLogFilters />

      {isLoading || !logs ? (
        <ActivityLogTableSkeleton />
      ) : logs.length === 0 ? (
        <ActivityLogEmptyState />
      ) : (
        <ActivityLogTable logs={logs} />
      )}
    </div>
  )
}
