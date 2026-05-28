import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatActivityDate } from "@/lib/format-activity-date";

interface ActivityLog {
  id: string;
  submittedAt: number;
  agencyName: string;
  agencySlug: string;
  userName: string;
  toolName: string;
  contactName: string;
  success: boolean;
  errorMessage?: string;
}

export function AdminPlatformActivity({ logs, nowMs }: { logs: ActivityLog[], nowMs: number }) {
  return (
    <div className="flex flex-col h-[400px] rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Platform Activity
        </h3>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
          Global Feed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No recent activity found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    {log.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {log.toolName} <span className="text-zinc-500 font-normal">for {log.contactName}</span>
                      </p>
                      <span className="text-xs text-zinc-500 whitespace-nowrap tabular-nums">
                        {formatActivityDate(log.submittedAt)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {log.agencySlug}
                      </span>
                      <span className="text-xs text-zinc-500">
                        by {log.userName}
                      </span>
                    </div>

                    {!log.success && log.errorMessage && (
                      <div className="mt-2 p-2 rounded-md bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-xs font-mono break-words">
                        {log.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}