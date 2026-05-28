import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function AdminDashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col pb-6 w-full animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Separator className="mt-4" />

      {/* Stat Strip */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <div className="flex-1 p-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-3 w-32" />
            </div>
            {i < 4 && <Separator orientation="vertical" className="hidden md:block h-auto" />}
            {i < 4 && <Separator className="md:hidden" />}
          </React.Fragment>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="h-[200px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="flex-1 w-full rounded-lg" />
        </div>
        <div className="h-[200px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <Skeleton className="h-3 w-32" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <div className="h-[400px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <Skeleton className="h-3 w-32" />
          <div className="space-y-4 mt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="h-[400px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <Skeleton className="h-3 w-32" />
          <div className="space-y-6 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}