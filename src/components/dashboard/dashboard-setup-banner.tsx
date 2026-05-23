import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardSetupBannerProps {
  profileComplete: boolean;
  ghlConnected: boolean;
}

export function DashboardSetupBanner({ profileComplete, ghlConnected }: DashboardSetupBannerProps) {
  if (profileComplete && ghlConnected) {
    return null;
  }

  const issues = [];
  if (!profileComplete) issues.push("completing your profile");
  if (!ghlConnected) issues.push("connecting your agency webhook");

  return (
    <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-4 flex gap-3 text-amber-900 shadow-sm">
      <div className="mt-0.5 shrink-0">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <strong>Setup required.</strong> You cannot send drips until you finish {issues.join(" and ")}.
        </div>
        <div className="shrink-0 flex gap-2">
          {!profileComplete && (
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-900 h-8" asChild>
              <Link href="/dashboard/settings/profile">Edit profile</Link>
            </Button>
          )}
          {!ghlConnected && (
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-900 h-8" asChild>
              <Link href="/dashboard/settings">View settings</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
