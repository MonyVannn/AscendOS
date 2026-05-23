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
    <div className="p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-muted/30">
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
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{log.toolLabel}</p>
            {log.templateName && (
              <span className="hidden sm:inline-block text-xs text-muted-foreground truncate max-w-[150px]">
                {log.templateName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mt-0.5">
            <span>by {log.userName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-3 mr-2">
          <span className="text-muted-foreground/40 text-sm">→</span>
          <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md truncate max-w-[180px]">
          <span className="truncate">For {log.contactName}</span>
            {!log.success && log.ghlStatus && (
              <>
                <span className="opacity-50">·</span>
                <span className="text-red-600 font-medium">Error {log.ghlStatus}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {log.success ? (
            <Badge className="border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-none">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              SUCCESS
            </Badge>
          ) : (
            <>
              <Badge className="border-transparent bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-500/10 dark:text-red-400 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                FAILED
              </Badge>
              <Link href="/dashboard/activity-log">
                <Badge className="border-transparent bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-[11px] font-medium px-2.5 py-0.5 flex items-center gap-1.5 cursor-pointer transition-colors shadow-none">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Retry
                </Badge>
              </Link>
            </>
          )}
          <span className="text-[12px] text-muted-foreground font-medium min-w-[70px] text-right">
            {formatRelativeTime(log.submittedAt, nowMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
