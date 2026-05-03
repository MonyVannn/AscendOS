import * as React from "react";
import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface User {
  clerkId: string;
  email?: string;
  name?: string;
}

interface Agency {
  _id: string;
  name: string;
  slug: string;
}

interface AssignPanelProps {
  user: User | null;
  agencies: Agency[];
  selectedAgencyId: string;
  onSelectAgency: (id: string) => void;
  selectedRole: "RD" | "SUPER_ADMIN";
  onSelectRole: (role: "RD" | "SUPER_ADMIN") => void;
  onConfirm: () => void;
  isAssigning: boolean;
}

export function AssignPanel({
  user,
  agencies,
  selectedAgencyId,
  onSelectAgency,
  selectedRole,
  onSelectRole,
  onConfirm,
  isAssigning,
}: AssignPanelProps) {
  const selectedAgency = agencies.find((a) => a._id === selectedAgencyId);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
          Assign to Agency
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Selected User Summary */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
            {user
              ? (user.name
                  ? user.name.substring(0, 2)
                  : user.email
                    ? user.email.substring(0, 2)
                    : "U"
                ).toUpperCase()
              : "?"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-blue-950 dark:text-blue-100 truncate">
              {user?.name || "Select a user"}
            </span>
            <span className="text-xs text-blue-700/80 dark:text-blue-300/80 truncate">
              {user?.email || "..."}
            </span>
          </div>
        </div>

        {/* Agency Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              Agency
            </label>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Required
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!user}>
              <Button
                variant="outline"
                className={`w-full justify-between h-12 px-3 bg-white dark:bg-zinc-950 ${
                  !selectedAgencyId
                    ? "text-zinc-400"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {selectedAgency ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                      {selectedAgency.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{selectedAgency.name}</span>
                  </div>
                ) : (
                  <span>Select agency...</span>
                )}
                <div className="flex items-center gap-2">
                  {selectedAgency && (
                    <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                      {selectedAgency.slug}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" max-h-60" align="start">
              {agencies.map((a) => (
                <DropdownMenuItem
                  key={a._id}
                  onClick={() => onSelectAgency(a._id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold shrink-0">
                      {a.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{a.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {a.slug}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              Role
            </label>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              2 Options
            </span>
          </div>
          <div className="flex rounded-md shadow-sm">
            <Button
              type="button"
              variant="outline"
              disabled={!user}
              onClick={() => onSelectRole("RD")}
              className={cn(
                "flex-1 flex-col gap-0.5 rounded-none rounded-l-md py-2 shadow-none font-normal h-auto min-h-11 border-zinc-200 dark:border-zinc-800",
                selectedRole === "RD"
                  ? "bg-white dark:bg-zinc-900 z-10 font-semibold shadow-sm dark:border-zinc-700"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <span
                className={
                  selectedRole === "RD"
                    ? "text-zinc-900 dark:text-zinc-100"
                    : ""
                }
              >
                Regional Director
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!user}
              onClick={() => onSelectRole("SUPER_ADMIN")}
              className={cn(
                "flex-1 flex-col gap-0.5 rounded-none rounded-r-md -ml-px py-2 shadow-none font-normal h-auto min-h-11 border-zinc-200 dark:border-zinc-800",
                selectedRole === "SUPER_ADMIN"
                  ? "bg-white dark:bg-zinc-900 z-10 font-semibold shadow-sm border-l border-zinc-200 dark:border-zinc-700"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <span
                className={
                  selectedRole === "SUPER_ADMIN"
                    ? "text-zinc-900 dark:text-zinc-100"
                    : ""
                }
              >
                Super Admin
              </span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Write Preview */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              Write Preview
            </label>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Convex Mutation
            </span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-200 dark:border-zinc-800 p-3 font-mono text-xs overflow-hidden">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold mb-3 border-b border-blue-100 dark:border-blue-900/30 pb-2">
              <Check className="h-3 w-3" />
              ASSIGNMENTS.CREATE
            </div>
            <div className="grid grid-cols-[70px_1fr] gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="font-semibold text-zinc-500">USER</div>
              <div className="truncate text-zinc-900 dark:text-zinc-100">
                {user ? (
                  <>
                    {user.name || user.email?.split("@")[0]}{" "}
                    <span className="text-zinc-400 mx-1">→</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {selectedAgency?.slug || "?"}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>

              <div className="font-semibold text-zinc-500 mt-1">ROLE</div>
              <div className="text-zinc-900 dark:text-zinc-100 mt-1 font-bold">
                {selectedRole}
              </div>

              <div className="font-semibold text-zinc-500 mt-1">CLERK ID</div>
              <div className="truncate mt-1">{user?.clerkId || "—"}</div>

              <div className="font-semibold text-zinc-500 mt-1">EFFECTIVE</div>
              <div className="mt-1">
                immediate{" "}
                <span className="text-zinc-300 dark:text-zinc-700 mx-1">·</span>{" "}
                {new Date().toISOString().split("T")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
          disabled={!user || !selectedAgencyId || isAssigning}
          onClick={onConfirm}
        >
          {isAssigning ? (
            "Assigning..."
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Confirm Assignment
            </>
          )}
        </Button>

        {user && selectedAgency && (
          <div className="flex items-start gap-2 text-[11px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded border border-amber-200 dark:border-amber-500/20 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              This grants <strong>immediate dashboard access</strong> to{" "}
              <span className="font-mono bg-amber-100 dark:bg-amber-500/20 px-1 rounded">
                {selectedAgency.slug}
              </span>
              . Double-check the agency and role before confirming.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
