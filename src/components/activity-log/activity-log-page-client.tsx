"use client"

import * as React from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ActivityLogFilters } from "./activity-log-filters"
import { ActivityLogTable } from "./activity-log-table"
import { ActivityLogTableSkeleton } from "./activity-log-table-skeleton"
import { ActivityLogEmptyState } from "./activity-log-empty-state"
import { ActivityLogPagination } from "./activity-log-pagination"
import { ActivityLogEntry, ActivityLogStatusFilter } from "./activity-log-types"
import { getToolDisplayName } from "@/lib/feature-tool-mapping"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { useSearchParams } from "next/navigation"

const PAGE_SIZE = 10

export function ActivityLogPageClient() {
  const { isAuthenticated } = useConvexAuth()
  const searchParams = useSearchParams()
  
  const [status, setStatus] = React.useState<ActivityLogStatusFilter>("all")
  const [search, setSearch] = React.useState(searchParams.get("q") || "")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [pageIndex, setPageIndex] = React.useState(0)
  const [cursors, setCursors] = React.useState<(string | null)[]>([null])

  const handleStatusChange = (newStatus: ActivityLogStatusFilter) => {
    setStatus(newStatus)
    setPageIndex(0)
    setCursors([null])
  }

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setPageIndex(0)
    setCursors([null])
  }

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange)
    setPageIndex(0)
    setCursors([null])
  }

  const dateFrom = dateRange?.from ? startOfDay(dateRange.from).getTime() : undefined
  const dateTo = dateRange?.to ? endOfDay(dateRange.to).getTime() : undefined

  const result = useQuery(
    api.activityLog.listSubmissionLogs,
    isAuthenticated
      ? {
          paginationOpts: {
            numItems: PAGE_SIZE,
            cursor: cursors[pageIndex] ?? null,
          },
          status,
          dateFrom,
          dateTo,
          search: search.trim() || undefined,
        }
      : "skip"
  )

  const isLoading = result === undefined

  const logs: ActivityLogEntry[] | undefined = result?.page.map(log => ({
    id: log._id,
    submittedAt: new Date(log.submittedAt).toISOString(),
    contactName: log.contactName || "—",
    contactEmail: log.contactEmail,
    templateName: log.templateName || "—",
    toolName: getToolDisplayName(log.toolName),
    success: log.success
  }))

  const handleNext = () => {
    if (result && !result.isDone) {
      setCursors((prev) => {
        const next = [...prev]
        next[pageIndex + 1] = result.continueCursor
        return next
      })
      setPageIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1)
    }
  }

  const isDefaultFilters = status === "all" && !search

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

      <ActivityLogFilters 
        status={status}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {isLoading || !logs ? (
        <ActivityLogTableSkeleton />
      ) : logs.length === 0 && pageIndex === 0 && isDefaultFilters ? (
        <ActivityLogEmptyState />
      ) : logs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">No results match your filters.</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search, status, or date range.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ActivityLogTable logs={logs} />
          <ActivityLogPagination
            pageIndex={pageIndex}
            isDone={result.isDone}
            isLoading={isLoading}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  )
}
