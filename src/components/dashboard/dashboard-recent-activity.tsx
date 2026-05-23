import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/dashboard-period";

export type RecentActivityLog = {
  id: string;
  toolName: string;
  toolLabel: string;
  templateName?: string;
  contactName: string;
  userId: string;
  userName: string;
  success: boolean;
  ghlStatus?: number;
  errorMessage?: string;
  submittedAt: number;
};

interface DashboardRecentActivityProps {
  logs: RecentActivityLog[];
  currentUserId: string;
  nowMs: number;
}

export function DashboardRecentActivity({ logs, currentUserId, nowMs }: DashboardRecentActivityProps) {
  const [tab, setTab] = React.useState<"all" | "failed" | "mine">("all");

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (tab === "failed" && log.success) return false;
      if (tab === "mine" && log.userId !== currentUserId) return false;
      return true;
    });
  }, [logs, tab, currentUserId]);

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Last 24h</span>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>All</TabButton>
          <TabButton active={tab === "failed"} onClick={() => setTab("failed")}>Failed</TabButton>
          <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>Mine</TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No recent activity found.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredLogs.map((log) => (
              <ActivityRow key={log.id} log={log} nowMs={nowMs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ActivityRow({ log, nowMs }: { log: RecentActivityLog; nowMs: number }) {
  return (
    <div className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${log.success ? "hover:bg-muted/30" : "bg-[#fff5f5]/30 hover:bg-[#fff5f5] dark:bg-red-950/5 dark:hover:bg-red-950/10"}`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-1 shrink-0">
          {log.success ? (
            <div className="h-5 w-5 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center dark:border-emerald-900 dark:bg-emerald-900/20">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center dark:border-red-900 dark:bg-red-900/20">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{log.toolLabel}</p>
            {log.templateName && (
              <span className="hidden sm:inline-block text-xs text-muted-foreground truncate max-w-[150px]">
                {log.templateName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span>by {log.userName}</span>
            <span className="opacity-50">•</span>
            <span>{log.contactName}</span>
            {!log.success && log.ghlStatus && (
              <>
                <span className="opacity-50">•</span>
                <span className="text-red-600 font-medium">Error {log.ghlStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 text-right">
        <div className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[120px]">
          {log.success ? "→ success" : log.errorMessage ? `→ ${log.errorMessage}` : "→ failed"}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {log.success ? (
            <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase text-[9px] font-bold tracking-wider px-1.5 py-0">
              Success
            </Badge>
          ) : (
            <Link href="/dashboard/activity-log">
              <Badge className="border-red-200 bg-white text-red-600 hover:bg-red-50 dark:bg-zinc-950 dark:text-red-400 dark:border-red-900 uppercase text-[9px] font-bold tracking-wider px-1.5 py-0 cursor-pointer">
                Failed
              </Badge>
            </Link>
          )}
          <span className="text-[10px] text-muted-foreground font-medium">
            {formatRelativeTime(log.submittedAt, nowMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
