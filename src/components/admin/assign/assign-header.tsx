import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AssignHeader({ count }: { count: number }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 ">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Provisioning <span className="mx-1.5 opacity-50">·</span> Step 2 of
            onboarding
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Assign Users
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-zinc-950 dark:text-zinc-50">
            {count} awaiting
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">—</span>
          <span className="text-zinc-500">auto-sync via Clerk</span>
          <span className="text-zinc-300 dark:text-zinc-700">—</span>
          <Badge
            variant="outline"
            className="gap-1.5 font-mono text-[10px] border-green-200 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 py-0.5 px-2 rounded-full"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            webhooks ok
          </Badge>
        </div>
      </div>
      <Separator className="mt-4 mb-6" />
    </>
  );
}
