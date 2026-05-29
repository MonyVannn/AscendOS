"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { TOOL_NAME_LABELS } from "@/lib/feature-tool-mapping"
import { AdminWebhookLogStatusFilter } from "./admin-webhook-logs-types"

interface AdminWebhookLogsFiltersProps {
  status: AdminWebhookLogStatusFilter;
  onStatusChange: (status: AdminWebhookLogStatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  agencyId: string;
  onAgencyIdChange: (agencyId: string) => void;
  toolName: string;
  onToolNameChange: (toolName: string) => void;
}

export function AdminWebhookLogsFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  agencyId,
  onAgencyIdChange,
  toolName,
  onToolNameChange,
}: AdminWebhookLogsFiltersProps) {
  const agencies = useQuery(api.admin.listAgencies);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        type="single"
        value={status}
        onValueChange={(value) => {
          if (value) onStatusChange(value as AdminWebhookLogStatusFilter)
        }}
        className="justify-start bg-white dark:bg-zinc-950 border border-border p-1 rounded-lg shadow-sm h-10"
      >
        <ToggleGroupItem value="all" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-800 data-[state=on]:text-white dark:data-[state=on]:bg-zinc-200 dark:data-[state=on]:text-zinc-900">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="sent" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
          Sent
        </ToggleGroupItem>
        <ToggleGroupItem value="failed" className="h-full px-4 text-xs font-medium rounded-md data-[state=on]:bg-zinc-100 dark:data-[state=on]:bg-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
          Failed
        </ToggleGroupItem>
      </ToggleGroup>

      <DatePickerWithRange 
        className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg" 
        date={dateRange}
        onDateChange={onDateRangeChange}
      />

      <div className="w-[200px]">
        <Select value={agencyId} onValueChange={onAgencyIdChange}>
          <SelectTrigger className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg border-border">
            <SelectValue placeholder="All Agencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agencies</SelectItem>
            {agencies?.map((agency) => (
              <SelectItem key={agency._id} value={agency._id}>
                {agency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <Select value={toolName} onValueChange={onToolNameChange}>
          <SelectTrigger className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg border-border">
            <SelectValue placeholder="All Tools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tools</SelectItem>
            {Object.entries(TOOL_NAME_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder="Search contact, agency, user, or tool..."
          className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg border-border px-4"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
