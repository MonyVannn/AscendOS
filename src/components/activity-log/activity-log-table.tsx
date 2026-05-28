"use client"

import * as React from "react"
import { formatActivityDateStacked } from "@/lib/format-activity-date"
import { ActivityLogEntry } from "./activity-log-types"
import { Badge } from "@/components/ui/badge"
import {
  ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"

export const columns: ColumnDef<ActivityLogEntry>[] = [
  {
    accessorKey: "submittedAt",
    header: "Date",
    cell: ({ row }) => {
      const dateParts = formatActivityDateStacked(row.original.submittedAt);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{dateParts.date}</span>
          <span className="text-xs text-muted-foreground">{dateParts.time}</span>
        </div>
      )
    },
    meta: {
      className: "whitespace-nowrap",
    },
  },
  {
    accessorKey: "contactName",
    header: "Contact",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{row.original.contactName}</span>
          <span className="text-xs text-muted-foreground">{row.original.contactEmail}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "templateName",
    header: "Template",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-foreground">
          {row.original.templateName}
        </div>
      )
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "toolName",
    header: "Tool",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {row.original.toolName}
        </Badge>
      )
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = row.original.success;
      return success ? (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
          Sent
        </Badge>
      ) : (
        <Badge variant="destructive">
          Failed
        </Badge>
      )
    },
  },
]

export function ActivityLogTable({ logs }: { logs: ActivityLogEntry[] }) {
  return (
    <DataTable 
      columns={columns} 
      data={logs} 
    />
  )
}
