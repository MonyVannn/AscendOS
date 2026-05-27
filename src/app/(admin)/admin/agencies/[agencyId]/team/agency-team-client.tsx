"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AGENCY_ROLES, AgencyRole, ROLE_LABELS } from "@/lib/roles";

export function AgencyTeamClient({ agencyId }: { agencyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const agencyIdTyped = agencyId as Id<"agencies">;

  const members = useQuery(
    api.admin.listAgencyMembers,
    isAuthenticated ? { agencyId: agencyIdTyped } : "skip"
  );
  
  const updateRole = useMutation(api.admin.updateAgencyMemberRole);

  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: Id<"users">, newRole: AgencyRole) => {
    setIsProcessingId(userId);
    try {
      await updateRole({ userId, role: newRole });
    } catch (e) {
      console.error(e);
      alert("Failed to update user role.");
    } finally {
      setIsProcessingId(null);
    }
  };

  if (members === undefined) {
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
          <Users className="h-6 w-6 text-blue-600" />
          Agency Team
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage members and their roles within this agency.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Team Members ({members.length})</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {members.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm dark:bg-blue-900/20 dark:text-blue-400">
                  {member.name ? member.name.substring(0, 2).toUpperCase() : <User className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{member.name || "Unknown"}</p>
                  <p className="text-sm text-zinc-500">{member.email || member.clerkId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={member.role || ""}
                  disabled={isProcessingId === member._id || member.role === "SUPER_ADMIN"}
                  onChange={(e) => handleRoleChange(member._id, e.target.value as AgencyRole)}
                  className="flex h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {AGENCY_ROLES.map(role => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                  {member.role === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">Super Admin (Global)</option>
                  )}
                </select>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No members found in this agency.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
