import * as React from "react";

export const metadata = {
  title: "Settings | AscendOS Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-zinc-500">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Coming Soon</h2>
        <p>Global system settings and configuration will be available in a future update.</p>
      </div>
    </div>
  );
}
