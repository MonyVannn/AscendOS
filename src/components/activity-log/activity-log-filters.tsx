"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export function ActivityLogFilters() {
  const [status, setStatus] = React.useState("all")
  const [search, setSearch] = React.useState("")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        type="single"
        value={status}
        onValueChange={(value) => {
          if (value) setStatus(value)
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

      <DatePickerWithRange className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg" />

      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder="Search by contact name or email..."
          className="h-10 bg-white dark:bg-zinc-950 shadow-sm rounded-lg border-border px-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  )
}
