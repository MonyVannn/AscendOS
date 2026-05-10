"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

import { AgenciesHeader } from "@/components/admin/agencies/agencies-header";
import { AgencyCard } from "@/components/admin/agencies/agency-card";

export function AgenciesPageClient() {
  const { isAuthenticated } = useConvexAuth();
  const agencies = useQuery(api.admin.listAgencies, isAuthenticated ? undefined : "skip");

  if (agencies === undefined) {
    return (
      <div className="max-w-[1400px] mx-auto h-full flex flex-col">
        <AgenciesHeader />
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col pb-6">
      <AgenciesHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <AgencyCard key={agency._id} agency={agency as React.ComponentProps<typeof AgencyCard>["agency"]} />
        ))}
      </div>
    </div>
  );
}