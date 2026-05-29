"use client"

import * as React from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminWebhookLogsFilters } from "./admin-webhook-logs-filters"
import { AdminWebhookLogsTable } from "./admin-webhook-logs-table"
import { AdminWebhookLogsTableSkeleton } from "./admin-webhook-logs-table-skeleton"
import { ActivityLogPagination } from "@/components/activity-log/activity-log-pagination"
import { ActivityLogEmptyState } from "@/components/activity-log/activity-log-empty-state"
import { AdminWebhookLogEntry, AdminWebhookLogStatusFilter } from "./admin-webhook-logs-types"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { Id } from "@/convex/_generated/dataModel"

const PAGE_SIZE = 20

export function AdminWebhookLogsClient() {
  const { isAuthenticated } = useConvexAuth()
  
  const [status, setStatus] = React.useState<AdminWebhookLogStatusFilter>("all")
  const [search, setSearch] = React.useState("")
  const [agencyId, setAgencyId] = React.useState<string>("all")
  const [toolName, setToolName] = React.useState<string>("all")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [pageIndex, setPageIndex] = React.useState(0)
  const [cursors, setCursors] = React.useState<(string | null)[]>([null])

  const handleFilterChange = () => {
    setPageIndex(0)
    setCursors([null])
  }

  const handleStatusChange = (newStatus: AdminWebhookLogStatusFilter) => {
    setStatus(newStatus)
    handleFilterChange()
  }

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    handleFilterChange()
  }

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange)
    handleFilterChange()
  }

  const handleAgencyIdChange = (newAgencyId: string) => {
    setAgencyId(newAgencyId)
    handleFilterChange()
  }

  const handleToolNameChange = (newToolName: string) => {
    setToolName(newToolName)
    handleFilterChange()
  }

  const dateFrom = dateRange?.from ? startOfDay(dateRange.from).getTime() : undefined
  const dateTo = dateRange?.to ? endOfDay(dateRange.to).getTime() : undefined

  const result = useQuery(
    api.admin.listWebhookLogs,
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
          agencyId: agencyId === "all" ? undefined : (agencyId as Id<"agencies">),
          toolName: toolName === "all" ? undefined : toolName,
        }
      : "skip"
  )

  const isLoading = result === undefined

  const logs: AdminWebhookLogEntry[] | undefined = result?.page.map(log => ({
    _id: log._id,
    submittedAt: new Date(log.submittedAt).toISOString(),
    contactName: log.contactName || "—",
    contactEmail: log.contactEmail,
    templateName: log.templateName || "—",
    toolName: log.toolName,
    success: log.success,
    errorMessage: log.errorMessage,
    latencyMs: log.latencyMs,
    retried: log.retried,
    agencyId: log.agencyId,
    agencyName: log.agencyName,
    agencySlug: log.agencySlug,
    userId: log.userId,
    userName: log.userName,
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

  const isDefaultFilters = status === "all" && !search && agencyId === "all" && toolName === "all"

  return (
    <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Webhook Logs</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Global view of all webhook submissions across the platform.
        </p>
      </div>

      <AdminWebhookLogsFilters 
        status={status}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        agencyId={agencyId}
        onAgencyIdChange={handleAgencyIdChange}
        toolName={toolName}
        onToolNameChange={handleToolNameChange}
      />

      {isLoading || !logs ? (
        <AdminWebhookLogsTableSkeleton />
      ) : logs.length === 0 && pageIndex === 0 && isDefaultFilters ? (
        <ActivityLogEmptyState />
      ) : logs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-24 px-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">No results match your filters.</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search, status, agency, tool, or date range.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AdminWebhookLogsTable logs={logs} />
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
