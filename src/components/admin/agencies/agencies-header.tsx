import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AgenciesHeader() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Tenant Registry
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Agencies
          </h1>
          <p className="text-sm text-zinc-500">
            Registered tenants on the AscendOS network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + New Agency
          </Button>
        </div>
      </div>
      <Separator className="mt-4 mb-6" />
    </>
  );
}
