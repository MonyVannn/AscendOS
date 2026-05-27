"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldAlert, UserMinus, UserPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PlatformAdminsClient() {
  const { isAuthenticated } = useConvexAuth();
  const [refreshNonce, setRefreshNonce] = useState(0);

  const platformAdmins = useQuery(api.admin.listPlatformAdmins, isAuthenticated ? { refreshNonce } : "skip");
  const unprovisionedUsers = useQuery(api.admin.listUnprovisionedUsers, isAuthenticated ? { refreshNonce } : "skip");
  
  const promote = useMutation(api.admin.promoteToSuperAdmin);
  const revoke = useMutation(api.admin.revokeSuperAdmin);

  const [selectedClerkId, setSelectedClerkId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefresh = () => {
    setRefreshNonce((prev) => prev + 1);
  };

  const handlePromote = async () => {
    if (!selectedClerkId) return;
    setIsProcessing(true);
    try {
      await promote({ clerkId: selectedClerkId });
      setSelectedClerkId("");
      handleRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to promote user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async (clerkId: string) => {
    if (!confirm("Are you sure you want to revoke this user's Super Admin access? They will be demoted to an unprovisioned state.")) {
      return;
    }
    setIsProcessing(true);
    try {
      await revoke({ clerkId });
      handleRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to revoke user.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (platformAdmins === undefined || unprovisionedUsers === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 pb-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-blue-600" />
          Platform Admins
        </h1>
        <p className="text-zinc-500 mt-1">
          Super Admins manage the entire platform across all agencies. They do not belong to a single agency.
        </p>
      </div>

      {/* Current Super Admins */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Current Super Admins ({platformAdmins.length})</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {platformAdmins.map((admin) => (
            <div key={admin._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{admin.name || "Unknown"}</p>
                <p className="text-sm text-zinc-500">{admin.email || admin.clerkId}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRevoke(admin.clerkId)}
                disabled={isProcessing || platformAdmins.length <= 1} // Prevent revoking last admin
                className="gap-2"
              >
                <UserMinus className="h-4 w-4" />
                Revoke Access
              </Button>
            </div>
          ))}
          {platformAdmins.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No Super Admins found.
            </div>
          )}
        </div>
      </div>

      {/* Promote User */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Promote to Super Admin</h2>
          <p className="text-xs text-zinc-500 mt-1">Select an unprovisioned user to grant full platform access.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select User</label>
              <select 
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClerkId}
                onChange={(e) => setSelectedClerkId(e.target.value)}
              >
                <option value="">-- Choose a user --</option>
                {unprovisionedUsers.map(u => (
                  <option key={u.clerkId} value={u.clerkId}>
                    {u.name || "Unknown"} ({u.email || u.clerkId})
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handlePromote} 
              disabled={!selectedClerkId || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Promote
            </Button>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:text-amber-500 dark:bg-amber-500/10 p-3 rounded-md border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              Warning: Promoting a user to Super Admin gives them full access to all agencies, billing, and system settings. This action cannot be limited to a specific agency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
