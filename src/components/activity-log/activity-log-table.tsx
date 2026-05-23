"use client"

import * as React from "react"
import { formatActivityDateStacked } from "@/lib/format-activity-date"
import { ActivityLogEntry } from "./activity-log-types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ActivityLogTable({ logs }: { logs: ActivityLogEntry[] }) {
  return (
    <div className="overflow-hidden">
      <Table className="border border-border">
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10 pl-8">Date</TableHead>
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Contact</TableHead>
            <TableHead className="hidden md:table-cell text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Template</TableHead>
            <TableHead className="hidden md:table-cell text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Tool</TableHead>
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const dateParts = formatActivityDateStacked(log.submittedAt);
            return (
              <TableRow
                key={log.id}
                className={`transition-colors border-b border-border/50 ${
                  log.success
                    ? "bg-white hover:bg-zinc-50/80 dark:bg-zinc-950 dark:hover:bg-zinc-900/50"
                    : "bg-[#fff5f5] hover:bg-[#ffebeb] dark:bg-red-950/10 dark:hover:bg-red-950/20"
                }`}
              >
                <TableCell className="whitespace-nowrap py-4">
                  <div className="flex flex-col gap-0.5 pl-5">
                    <span className="text-sm font-medium text-foreground">{dateParts.date}</span>
                    <span className="text-[11px] text-muted-foreground">{dateParts.time}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{log.contactName}</span>
                    <span className="text-[11px] text-muted-foreground">{log.contactEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-foreground py-4">
                  {log.templateName}
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">
                  <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-transparent font-medium dark:bg-zinc-800 dark:text-zinc-300">
                    {log.toolName}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  {log.success ? (
                    <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      Sent
                    </Badge>
                  ) : (
                    <Badge className="border-red-100 bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
