import * as React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: "warning" | "destructive";
}

export function AdminAttentionPanel({ items }: { items: AttentionItem[] }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Needs Attention
        </h3>
        {items.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            {items.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-zinc-500">
            <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">All clear</p>
            <p className="text-xs text-zinc-500 text-center max-w-[200px] mt-1">
              No pending tasks or system issues detected.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = item.severity === "destructive" ? AlertCircle : AlertTriangle;
              const bgClass = item.severity === "destructive" 
                ? "bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20" 
                : "bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20";
              const iconClass = item.severity === "destructive"
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400";
              const titleClass = item.severity === "destructive"
                ? "text-red-900 dark:text-red-300"
                : "text-amber-900 dark:text-amber-300";
              const textClass = item.severity === "destructive"
                ? "text-red-700 dark:text-red-400/80"
                : "text-amber-700 dark:text-amber-400/80";

              return (
                <div key={item.id} className={`flex gap-3 p-4 rounded-lg border ${bgClass}`}>
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconClass}`} />
                  <div className="space-y-1.5 flex-1">
                    <h4 className={`text-sm font-semibold ${titleClass}`}>{item.title}</h4>
                    <p className={`text-xs ${textClass}`}>{item.description}</p>
                    <div className="pt-1">
                      <Button asChild variant="link" className={`h-auto p-0 text-xs font-semibold ${iconClass}`}>
                        <Link href={item.href}>Resolve issue →</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}