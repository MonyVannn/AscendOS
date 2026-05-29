"use client"

import * as React from "react"
import { formatActivityDateStacked } from "@/lib/format-activity-date"
import { AdminWebhookLogEntry } from "./admin-webhook-logs-types"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { getToolDisplayName } from "@/lib/feature-tool-mapping"

export const columns: ColumnDef<AdminWebhookLogEntry>[] = [
  {
    accessorKey: "submittedAt",
    header: "Date",
    cell: ({ row }) => {
      const dateParts = formatActivityDateStacked(new Date(row.original.submittedAt).getTime());
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
    accessorKey: "agencyName",
    header: "Agency",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{row.original.agencyName}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.original.agencySlug}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "contactName",
    header: "Contact",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{row.original.contactName || "—"}</span>
          <span className="text-xs text-muted-foreground">{row.original.contactEmail}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "toolName",
    header: "Tool",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {getToolDisplayName(row.original.toolName)}
        </Badge>
      )
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "templateName",
    header: "Template",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-foreground">
          {row.original.templateName || "—"}
        </div>
      )
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "userName",
    header: "Submitted by",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-foreground">
          {row.original.userName}
        </div>
      )
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = row.original.success;
      return (
        <div className="flex flex-col gap-1 items-start">
          {success ? (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
              Sent
            </Badge>
          ) : (
            <Badge variant="destructive">
              Failed
            </Badge>
          )}
          {!success && row.original.errorMessage && (
            <span className="text-[10px] text-red-500 max-w-[150px] truncate" title={row.original.errorMessage}>
              {row.original.errorMessage}
            </span>
          )}
        </div>
      )
    },
  },
]

export function AdminWebhookLogsTable({ logs }: { logs: AdminWebhookLogEntry[] }) {
  return (
    <DataTable 
      columns={columns} 
      data={logs} 
    />
  )
}
