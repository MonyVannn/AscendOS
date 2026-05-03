"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { AssignHeader } from "@/components/admin/assign/assign-header";
import { AssignUserList } from "@/components/admin/assign/assign-user-list";
import { AssignPanel } from "@/components/admin/assign/assign-panel";

export default function AssignPage() {
  const { isAuthenticated } = useConvexAuth();
  const [refreshNonce, setRefreshNonce] = useState(0);
  
  const users = useQuery(api.admin.listUnprovisionedUsers, isAuthenticated ? { refreshNonce } : "skip");
  const agencies = useQuery(api.admin.listAgencies, isAuthenticated ? undefined : "skip");
  const assign = useMutation(api.admin.assignUserToAgency);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"RD" | "SUPER_ADMIN">("RD");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshNonce((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500); // UI feel
  };

  if (users === undefined || agencies === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  const handleAssign = async () => {
    if (!selectedUserId || !selectedAgencyId) return;
    
    setIsAssigning(true);
    try {
      await assign({
        clerkId: selectedUserId,
        agencyId: selectedAgencyId as Id<"agencies">,
        role: selectedRole,
      });
      setSelectedUserId("");
      setSelectedAgencyId("");
      setSelectedRole("RD");
      
      // Usually UI optimistic updates cover it, but forcing refresh ensures sync
      handleRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to assign user. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedUser = users.find(u => u.clerkId === selectedUserId) || null;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <AssignHeader count={users.length} />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 pb-6">
        <AssignUserList 
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={(id) => {
            if (id === selectedUserId) {
              setSelectedUserId(""); // toggle off
            } else {
              setSelectedUserId(id);
            }
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <AssignPanel 
          user={selectedUser}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          agencies={agencies as any} 
          selectedAgencyId={selectedAgencyId}
          onSelectAgency={setSelectedAgencyId}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onConfirm={handleAssign}
          isAssigning={isAssigning}
        />
      </div>
    </div>
  );
}
