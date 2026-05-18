"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ActivityLogTableSkeleton() {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Date</TableHead>
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Contact</TableHead>
            <TableHead className="hidden md:table-cell text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Template</TableHead>
            <TableHead className="hidden md:table-cell text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Tool</TableHead>
            <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-10">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="bg-white hover:bg-white dark:bg-zinc-950 dark:hover:bg-zinc-950 border-b border-border/50">
              <TableCell className="py-4">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell py-4">
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell className="hidden md:table-cell py-4">
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
