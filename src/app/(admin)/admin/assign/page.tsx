"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AssignPage() {
  const { isAuthenticated } = useConvexAuth();
  const users = useQuery(api.admin.listUnprovisionedUsers, isAuthenticated ? undefined : "skip");
  const agencies = useQuery(api.admin.listAgencies, isAuthenticated ? undefined : "skip");
  const assign = useMutation(api.admin.assignUserToAgency);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<string>("");

  if (users === undefined || agencies === undefined) {
    return <div>Loading...</div>;
  }

  const handleAssign = async () => {
    if (!selectedUser || !selectedAgency) return;
    try {
      await assign({
        clerkId: selectedUser,
        agencyId: selectedAgency as any,
      });
      setSelectedUser("");
      setSelectedAgency("");
    } catch (e) {
      console.error(e);
      alert("Failed to assign");
    }
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Unprovisioned Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No pending users.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u._id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedUser === u.clerkId 
                    ? "border-black bg-zinc-100 dark:border-white dark:bg-zinc-800" 
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
                onClick={() => setSelectedUser(u.clerkId)}
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{u.name || "Unknown"}</div>
                <div className="text-sm text-gray-500">{u.email || u.clerkId}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Assignment</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-900 dark:text-zinc-100">Agency</label>
            <select
              className="w-full border border-zinc-200 dark:border-zinc-700 p-2 rounded bg-transparent text-zinc-900 dark:text-zinc-100"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
            >
              <option value="">Select an agency...</option>
              {agencies.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="w-full bg-black dark:bg-white text-white dark:text-black font-medium p-2 rounded disabled:opacity-50"
            disabled={!selectedUser || !selectedAgency}
            onClick={handleAssign}
          >
            Assign User
          </button>
        </div>
      </div>
    </div>
  );
}
